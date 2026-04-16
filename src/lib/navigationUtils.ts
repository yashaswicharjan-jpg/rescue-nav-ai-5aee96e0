// Navigation utilities — route calculation, waypoints, turn-by-turn instructions

export interface RouteStep {
  instruction: string;
  distance: number; // meters
  direction: "ahead" | "left" | "right" | "arrive";
  lat: number;
  lng: number;
}

export interface NavigationRoute {
  steps: RouteStep[];
  totalDistance: number; // meters
  estimatedTime: number; // minutes
  waypoints: [number, number][];
  destination: { name: string; lat: number; lng: number };
}

function haversineDistance(
  lat1: number, lng1: number, lat2: number, lng2: number
): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function bearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function getDirection(prevBearing: number, nextBearing: number): "ahead" | "left" | "right" {
  let diff = ((nextBearing - prevBearing) + 360) % 360;
  if (diff > 180) diff -= 360;
  if (Math.abs(diff) < 30) return "ahead";
  return diff > 0 ? "right" : "left";
}

// Interpolate waypoints between two points to simulate a realistic path
function interpolateWaypoints(
  from: [number, number],
  to: [number, number],
  dangerZones: { lat: number; lng: number; radius: number }[]
): [number, number][] {
  const dist = haversineDistance(from[0], from[1], to[0], to[1]);
  const numPoints = Math.max(3, Math.min(8, Math.floor(dist / 100)));
  const points: [number, number][] = [from];

  for (let i = 1; i < numPoints; i++) {
    const t = i / numPoints;
    let lat = from[0] + (to[0] - from[0]) * t;
    let lng = from[1] + (to[1] - from[1]) * t;

    // Offset waypoints away from danger zones
    for (const dz of dangerZones) {
      const d = haversineDistance(lat, lng, dz.lat, dz.lng);
      if (d < dz.radius * 1.5) {
        const angle = bearing(dz.lat, dz.lng, lat, lng);
        const offsetDist = (dz.radius * 1.5 - d) / 111000; // rough degrees
        lat += offsetDist * Math.cos((angle * Math.PI) / 180) * 0.3;
        lng += offsetDist * Math.sin((angle * Math.PI) / 180) * 0.3;
      }
    }

    points.push([lat, lng]);
  }

  points.push(to);
  return points;
}

export function calculateRoute(
  userPos: [number, number],
  shelters: { lat: number; lng: number; name: string }[],
  dangerZones: { lat: number; lng: number }[]
): NavigationRoute | null {
  if (shelters.length === 0) return null;

  // Find nearest shelter
  let nearest = shelters[0];
  let minDist = Infinity;
  for (const s of shelters) {
    const d = haversineDistance(userPos[0], userPos[1], s.lat, s.lng);
    if (d < minDist) {
      minDist = d;
      nearest = s;
    }
  }

  const dzWithRadius = dangerZones.map((dz) => ({ ...dz, radius: 800 }));
  const waypoints = interpolateWaypoints(
    userPos,
    [nearest.lat, nearest.lng],
    dzWithRadius
  );

  // Generate turn-by-turn steps
  const steps: RouteStep[] = [];
  let totalDist = 0;
  let prevBear = bearing(waypoints[0][0], waypoints[0][1], waypoints[1][0], waypoints[1][1]);

  for (let i = 0; i < waypoints.length - 1; i++) {
    const segDist = haversineDistance(
      waypoints[i][0], waypoints[i][1],
      waypoints[i + 1][0], waypoints[i + 1][1]
    );
    totalDist += segDist;

    const nextBear = bearing(
      waypoints[i][0], waypoints[i][1],
      waypoints[i + 1][0], waypoints[i + 1][1]
    );

    const dir = i === 0 ? "ahead" : getDirection(prevBear, nextBear);
    const distRounded = Math.round(segDist / 10) * 10;

    let instruction: string;
    if (i === waypoints.length - 2) {
      instruction = `Arrive at ${nearest.name}`;
    } else if (dir === "ahead") {
      instruction = `Move ${distRounded}m ahead`;
    } else if (dir === "left") {
      instruction = `Turn left in ${distRounded}m`;
    } else {
      instruction = `Turn right in ${distRounded}m`;
    }

    steps.push({
      instruction,
      distance: segDist,
      direction: i === waypoints.length - 2 ? "arrive" : dir,
      lat: waypoints[i + 1][0],
      lng: waypoints[i + 1][1],
    });

    prevBear = nextBear;
  }

  // Walking speed ~5km/h = 83m/min
  const estimatedTime = Math.max(1, Math.round(totalDist / 83));

  return {
    steps,
    totalDistance: Math.round(totalDist),
    estimatedTime,
    waypoints,
    destination: nearest,
  };
}

export function formatDistance(meters: number): string {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
  return `${Math.round(meters)}m`;
}

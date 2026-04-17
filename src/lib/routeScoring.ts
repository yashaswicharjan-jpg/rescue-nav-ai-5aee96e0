// OSRM-based routing with risk scoring against danger zones
import { mockAlerts, type Alert } from "./mockAlerts";

export interface ScoredRoute {
  label: "fastest" | "safest";
  coordinates: [number, number][]; // [lat,lng]
  distanceM: number;
  durationS: number;
  riskScore: number; // 0 (safe) - 100 (dangerous)
  safetyPct: number; // 100 - riskScore
  passesDanger: { alert: Alert; minDistM: number }[];
}

const OSRM = "https://router.project-osrm.org/route/v1/driving";
const DANGER_RADIUS_M = 800;

// Haversine
function distM(a: [number, number], b: [number, number]): number {
  const R = 6371000;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLng = ((b[1] - a[1]) * Math.PI) / 180;
  const lat1 = (a[0] * Math.PI) / 180;
  const lat2 = (b[0] * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(x));
}

function scoreRoute(coords: [number, number][], alerts: Alert[]): {
  riskScore: number;
  passesDanger: { alert: Alert; minDistM: number }[];
} {
  const passes: { alert: Alert; minDistM: number }[] = [];
  let totalRisk = 0;

  for (const a of alerts) {
    let minD = Infinity;
    for (const c of coords) {
      const d = distM(c, [a.lat, a.lng]);
      if (d < minD) minD = d;
    }
    if (minD < DANGER_RADIUS_M * 1.5) {
      passes.push({ alert: a, minDistM: minD });
      // Severity weight
      const sevWeight =
        a.severity === "critical" ? 1 : a.severity === "high" ? 0.7 : 0.4;
      // Closer = more risk; clamp 0-1
      const proximity = Math.max(0, 1 - minD / (DANGER_RADIUS_M * 1.5));
      totalRisk += proximity * sevWeight * 60; // up to 60 per alert
    }
  }
  return {
    riskScore: Math.min(100, Math.round(totalRisk)),
    passesDanger: passes,
  };
}

async function fetchOSRM(
  from: [number, number],
  to: [number, number],
  alternatives = false,
): Promise<{ coords: [number, number][]; distance: number; duration: number }[]> {
  const url = `${OSRM}/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson&alternatives=${alternatives}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("OSRM request failed");
  const data = await res.json();
  return (data.routes || []).map((r: any) => ({
    coords: r.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]),
    distance: r.distance,
    duration: r.duration,
  }));
}

/**
 * Returns Fastest + Safest routes between two points, scored against active danger zones.
 * Falls back gracefully if OSRM is unreachable.
 */
export async function getScoredRoutes(
  from: [number, number],
  to: [number, number],
  alerts: Alert[] = mockAlerts,
): Promise<{ fastest: ScoredRoute; safest: ScoredRoute } | null> {
  try {
    const routes = await fetchOSRM(from, to, true);
    if (routes.length === 0) return null;

    const scored = routes.map((r) => {
      const s = scoreRoute(r.coords, alerts);
      return {
        coordinates: r.coords,
        distanceM: r.distance,
        durationS: r.duration,
        ...s,
        safetyPct: 100 - s.riskScore,
      };
    });

    // Fastest = shortest duration
    const fastest = scored.reduce((a, b) => (a.durationS < b.durationS ? a : b));
    // Safest = lowest risk; tiebreak by duration
    const safest = scored.reduce((a, b) =>
      a.riskScore < b.riskScore || (a.riskScore === b.riskScore && a.durationS < b.durationS)
        ? a
        : b,
    );

    return {
      fastest: { ...fastest, label: "fastest" },
      safest: { ...safest, label: "safest" },
    };
  } catch (e) {
    console.error("Route scoring failed:", e);
    return null;
  }
}

export function riskColor(riskScore: number): string {
  if (riskScore >= 60) return "#ef4444"; // red
  if (riskScore >= 30) return "#f59e0b"; // amber
  return "#22c55e"; // green
}

export function formatKm(m: number): string {
  return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`;
}

export function formatMin(s: number): string {
  const min = Math.round(s / 60);
  return `${min} min`;
}

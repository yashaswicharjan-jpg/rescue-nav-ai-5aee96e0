// OpenStreetMap Overpass API - find nearby emergency resources
export type ResourceCategory = "hospital" | "water" | "shelter" | "charging";

export interface Resource {
  id: string;
  category: ResourceCategory;
  name: string;
  lat: number;
  lng: number;
  distanceM: number;
  tags: Record<string, string>;
  openNow?: boolean;
}

const OVERPASS = "https://overpass-api.de/api/interpreter";

const CATEGORY_QUERY: Record<ResourceCategory, string> = {
  hospital: 'node["amenity"~"hospital|clinic|doctors"]',
  water: 'node["amenity"="drinking_water"];node["man_made"="water_tap"]',
  shelter: 'node["amenity"~"shelter|community_centre"];node["emergency"="assembly_point"]',
  charging: 'node["amenity"="charging_station"]',
};

const CATEGORY_LABEL: Record<ResourceCategory, string> = {
  hospital: "Hospital",
  water: "Water",
  shelter: "Shelter",
  charging: "Charging",
};

export const CATEGORY_ICONS: Record<ResourceCategory, string> = {
  hospital: "🏥",
  water: "💧",
  shelter: "🏠",
  charging: "🔌",
};

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

function isOpenNow(tags: Record<string, string>): boolean | undefined {
  const oh = tags.opening_hours;
  if (!oh) return undefined;
  if (oh === "24/7") return true;
  // Best-effort: present-but-not-24/7 → unknown
  return undefined;
}

export async function findResources(
  center: [number, number],
  category: ResourceCategory,
  radiusM = 5000,
): Promise<Resource[]> {
  const queryBody = CATEGORY_QUERY[category]
    .split(";")
    .map((q) => `${q.trim()}(around:${radiusM},${center[0]},${center[1]});`)
    .join("");
  const query = `[out:json][timeout:15];(${queryBody});out body 60;`;

  const res = await fetch(OVERPASS, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: query,
  });
  if (!res.ok) throw new Error("Overpass request failed");
  const data = await res.json();

  const items: Resource[] = (data.elements || [])
    .filter((el: any) => el.lat && el.lon)
    .map((el: any) => {
      const tags = el.tags || {};
      const name =
        tags.name ||
        tags["name:en"] ||
        `${CATEGORY_LABEL[category]} ${el.id.toString().slice(-4)}`;
      return {
        id: `${el.type}-${el.id}`,
        category,
        name,
        lat: el.lat,
        lng: el.lon,
        distanceM: distM(center, [el.lat, el.lon]),
        tags,
        openNow: isOpenNow(tags),
      };
    });

  return items.sort((a, b) => a.distanceM - b.distanceM).slice(0, 25);
}

export function resourceLabel(c: ResourceCategory): string {
  return CATEGORY_LABEL[c];
}

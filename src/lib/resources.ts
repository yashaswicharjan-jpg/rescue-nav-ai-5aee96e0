// Emergency resource discovery.
// ONLINE : OpenStreetMap Overpass API -> validated -> cached into the local
//          regional offline package (see offlineStore.ts).
// OFFLINE: the previously downloaded regional package is queried locally and
//          all distances are recomputed from the live GPS fix.
import {
  loadRegionPackage,
  regionForCoords,
  saveRegionPackage,
  setRegionName,
  type RegionPackage,
} from "./offlineStore";

export type ResourceCategory =
  | "hospital"
  | "clinic"
  | "police"
  | "fire_station"
  | "shelter"
  | "water"
  | "pharmacy"
  | "assembly_point";

export type VerificationLevel =
  | "verified"
  | "high"
  | "medium"
  | "low"
  | "unverified";

export interface Resource {
  id: string;
  name: string;
  category: ResourceCategory;
  lat: number;
  lng: number;
  address?: string;
  phone?: string;
  operationalStatus: "unknown" | "open" | "closed";
  dataSource: string;
  verificationLevel: VerificationLevel;
  lastUpdated: number;
  offlineDataTimestamp?: number;
  /** Recomputed from the current GPS fix on every query — never stored. */
  distanceM: number;
  tags?: Record<string, string>;
}

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

const CATEGORY_SELECTORS: Record<ResourceCategory, string[]> = {
  hospital: ['node["amenity"="hospital"]', 'way["amenity"="hospital"]'],
  clinic: ['node["amenity"~"clinic|doctors"]'],
  police: ['node["amenity"="police"]', 'way["amenity"="police"]'],
  fire_station: ['node["amenity"="fire_station"]', 'way["amenity"="fire_station"]'],
  shelter: [
    'node["amenity"~"shelter|community_centre"]',
    'node["emergency"="shelter"]',
  ],
  water: ['node["amenity"="drinking_water"]', 'node["man_made"="water_tap"]'],
  pharmacy: ['node["amenity"="pharmacy"]'],
  assembly_point: ['node["emergency"="assembly_point"]'],
};

export const CATEGORY_ICONS: Record<ResourceCategory, string> = {
  hospital: "🏥",
  clinic: "🩺",
  police: "🚓",
  fire_station: "🚒",
  shelter: "🏠",
  water: "💧",
  pharmacy: "💊",
  assembly_point: "📍",
};

const CATEGORY_LABEL: Record<ResourceCategory, string> = {
  hospital: "Hospital",
  clinic: "Clinic",
  police: "Police",
  fire_station: "Fire Station",
  shelter: "Shelter",
  water: "Water",
  pharmacy: "Pharmacy",
  assembly_point: "Assembly Point",
};

export const ALL_CATEGORIES: ResourceCategory[] = [
  "hospital",
  "clinic",
  "police",
  "fire_station",
  "shelter",
  "water",
  "pharmacy",
  "assembly_point",
];

/** Emergency-priority ordering per situation type. */
export const EMERGENCY_PRIORITY: Record<string, ResourceCategory[]> = {
  medical: ["hospital", "clinic", "pharmacy"],
  fire: ["fire_station", "hospital", "shelter"],
  disaster: ["shelter", "assembly_point", "water", "hospital"],
  security: ["police", "shelter", "hospital"],
};

export function resourceLabel(c: ResourceCategory): string {
  return CATEGORY_LABEL[c];
}

export function distanceM(a: [number, number], b: [number, number]): number {
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

function operationalStatus(tags: Record<string, string>): Resource["operationalStatus"] {
  if (tags.opening_hours === "24/7") return "open";
  if (tags.disused === "yes" || tags["disused:amenity"]) return "closed";
  return "unknown";
}

function verification(tags: Record<string, string>): VerificationLevel {
  if (tags.operator && tags.phone) return "verified";
  if (tags.name && (tags.operator || tags.phone)) return "high";
  if (tags.name) return "medium";
  return "low";
}

function toResource(el: any, category: ResourceCategory): Resource | null {
  const lat = el.lat ?? el.center?.lat;
  const lng = el.lon ?? el.center?.lon;
  if (typeof lat !== "number" || typeof lng !== "number") return null;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  const tags: Record<string, string> = el.tags || {};
  const address = [tags["addr:housenumber"], tags["addr:street"], tags["addr:city"]]
    .filter(Boolean)
    .join(" ");
  return {
    id: `${el.type}-${el.id}`,
    name: tags.name || tags["name:en"] || CATEGORY_LABEL[category],
    category,
    lat,
    lng,
    address: address || undefined,
    phone: tags.phone || tags["contact:phone"] || undefined,
    operationalStatus: operationalStatus(tags),
    dataSource: "OpenStreetMap",
    verificationLevel: verification(tags),
    lastUpdated: Date.now(),
    distanceM: 0,
    tags,
  };
}

async function overpass(query: string): Promise<any> {
  let lastErr: unknown;
  for (const url of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: query,
      });
      if (!res.ok) throw new Error(`Overpass ${res.status}`);
      return await res.json();
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("Overpass unreachable");
}

/** Download every category around a coordinate and persist it as the region package. */
export async function downloadRegionData(
  center: [number, number],
  radiusM = 15000,
  categories: ResourceCategory[] = ALL_CATEGORIES,
): Promise<RegionPackage> {
  const parts = categories
    .flatMap((c) => CATEGORY_SELECTORS[c].map((s) => ({ c, s })))
    .map(({ s }) => `${s}(around:${radiusM},${center[0]},${center[1]});`)
    .join("");
  const query = `[out:json][timeout:60];(${parts});out center 800;`;
  const data = await overpass(query);

  const resources: Resource[] = [];
  for (const el of data.elements || []) {
    const tags = el.tags || {};
    const cat = classify(tags);
    if (!cat || !categories.includes(cat)) continue;
    const r = toResource(el, cat);
    if (r) resources.push(r);
  }

  const region = regionForCoords(center[0], center[1]);
  const pkg = saveRegionPackage(region.id, region.center, resources, categories);
  void resolveRegionName(region.id, center);
  return pkg;
}

function classify(tags: Record<string, string>): ResourceCategory | null {
  const a = tags.amenity;
  if (a === "hospital") return "hospital";
  if (a === "clinic" || a === "doctors") return "clinic";
  if (a === "police") return "police";
  if (a === "fire_station") return "fire_station";
  if (a === "shelter" || a === "community_centre") return "shelter";
  if (a === "drinking_water" || tags.man_made === "water_tap") return "water";
  if (a === "pharmacy") return "pharmacy";
  if (tags.emergency === "assembly_point") return "assembly_point";
  if (tags.emergency === "shelter") return "shelter";
  return null;
}

async function resolveRegionName(regionId: string, center: [number, number]) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${center[0]}&lon=${center[1]}&zoom=10`,
    );
    const j = await res.json();
    const name =
      j.address?.city ||
      j.address?.town ||
      j.address?.county ||
      j.address?.state ||
      j.display_name;
    if (name) setRegionName(regionId, name);
  } catch {
    /* offline — region stays unnamed */
  }
}

export interface ResourceQueryResult {
  items: Resource[];
  source: "live" | "offline";
  regionId: string;
  regionName?: string;
  offlineDataTimestamp?: number;
  hasLocalPackage: boolean;
}

/**
 * Query resources around the live GPS fix. Distances are always recomputed
 * from `center`, never read from storage.
 */
export async function queryResources(
  center: [number, number],
  categories: ResourceCategory[],
  radiusM: number,
  opts: { forceOffline?: boolean } = {},
): Promise<ResourceQueryResult> {
  const region = regionForCoords(center[0], center[1]);
  const online = navigator.onLine && !opts.forceOffline;
  let pkg = loadRegionPackage(region.id);

  if (online) {
    try {
      pkg = await downloadRegionData(center, Math.max(radiusM, 10000), categories);
      return {
        items: filterLocal(pkg, center, categories, radiusM),
        source: "live",
        regionId: region.id,
        regionName: pkg.regionName,
        offlineDataTimestamp: pkg.updatedAt,
        hasLocalPackage: true,
      };
    } catch (e) {
      console.warn("Live resource fetch failed, falling back to offline data", e);
    }
  }

  if (!pkg) {
    return {
      items: [],
      source: "offline",
      regionId: region.id,
      hasLocalPackage: false,
    };
  }
  return {
    items: filterLocal(pkg, center, categories, radiusM),
    source: "offline",
    regionId: region.id,
    regionName: pkg.regionName,
    offlineDataTimestamp: pkg.updatedAt,
    hasLocalPackage: true,
  };
}

function filterLocal(
  pkg: RegionPackage,
  center: [number, number],
  categories: ResourceCategory[],
  radiusM: number,
): Resource[] {
  return pkg.resources
    .filter((r) => categories.includes(r.category))
    .map((r) => ({
      ...r,
      offlineDataTimestamp: pkg.updatedAt,
      distanceM: distanceM(center, [r.lat, r.lng]),
    }))
    .filter((r) => r.distanceM <= radiusM)
    .sort((a, b) => a.distanceM - b.distanceM)
    .slice(0, 60);
}

/** Nearest safe destinations for evacuation, excluding hazard areas. */
export function pickSafeDestinations(
  items: Resource[],
  hazards: { lat: number; lng: number; radiusM: number }[],
  limit = 4,
): Resource[] {
  return items
    .filter((r) =>
      hazards.every((h) => distanceM([r.lat, r.lng], [h.lat, h.lng]) > h.radiusM),
    )
    .slice(0, limit);
}

export function formatDistance(m: number): string {
  return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`;
}

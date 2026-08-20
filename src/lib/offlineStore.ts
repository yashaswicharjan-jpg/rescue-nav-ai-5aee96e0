// Local offline data store for regional map/resource packages.
// Storage: localStorage (browser/PWA limitation). The API below is the
// integration point for a native SQLite/MBTiles store on Android/iOS.

import type { Resource, ResourceCategory } from "./resources";

export const REGION_CELL_DEG = 0.5; // ~55 km cells
const PKG_PREFIX = "crisisnav.region.";
const PKG_VERSION = 1;

export interface RegionId {
  id: string;
  latIdx: number;
  lngIdx: number;
  center: [number, number];
}

export interface RegionPackage {
  version: number;
  regionId: string;
  regionName?: string;
  center: [number, number];
  resources: Resource[];
  categories: ResourceCategory[];
  updatedAt: number; // epoch ms — the offline data timestamp
}

export function regionForCoords(lat: number, lng: number): RegionId {
  const latIdx = Math.floor(lat / REGION_CELL_DEG);
  const lngIdx = Math.floor(lng / REGION_CELL_DEG);
  return {
    id: `r_${latIdx}_${lngIdx}`,
    latIdx,
    lngIdx,
    center: [
      (latIdx + 0.5) * REGION_CELL_DEG,
      (lngIdx + 0.5) * REGION_CELL_DEG,
    ],
  };
}

export function loadRegionPackage(regionId: string): RegionPackage | null {
  try {
    const raw = localStorage.getItem(PKG_PREFIX + regionId);
    if (!raw) return null;
    const pkg = JSON.parse(raw) as RegionPackage;
    if (pkg.version !== PKG_VERSION) return null;
    return pkg;
  } catch {
    return null;
  }
}

export function saveRegionPackage(
  regionId: string,
  center: [number, number],
  resources: Resource[],
  categories: ResourceCategory[],
  regionName?: string,
): RegionPackage {
  const existing = loadRegionPackage(regionId);
  // Merge by resource id so partial category downloads accumulate.
  const byId = new Map<string, Resource>();
  existing?.resources.forEach((r) => byId.set(r.id, r));
  resources.forEach((r) => byId.set(r.id, r));

  const pkg: RegionPackage = {
    version: PKG_VERSION,
    regionId,
    regionName: regionName ?? existing?.regionName,
    center,
    resources: [...byId.values()],
    categories: [...new Set([...(existing?.categories ?? []), ...categories])],
    updatedAt: Date.now(),
  };
  try {
    localStorage.setItem(PKG_PREFIX + regionId, JSON.stringify(pkg));
  } catch (e) {
    console.warn("Offline package too large to store", e);
  }
  return pkg;
}

export function listRegionPackages(): RegionPackage[] {
  const out: RegionPackage[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(PKG_PREFIX)) {
      const pkg = loadRegionPackage(key.slice(PKG_PREFIX.length));
      if (pkg) out.push(pkg);
    }
  }
  return out.sort((a, b) => b.updatedAt - a.updatedAt);
}

export function deleteRegionPackage(regionId: string) {
  localStorage.removeItem(PKG_PREFIX + regionId);
}

export function setRegionName(regionId: string, name: string) {
  const pkg = loadRegionPackage(regionId);
  if (!pkg) return;
  pkg.regionName = name;
  localStorage.setItem(PKG_PREFIX + regionId, JSON.stringify(pkg));
}

export function formatDataAge(ts: number): string {
  const mins = Math.round((Date.now() - ts) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} h ago`;
  return `${Math.round(hrs / 24)} d ago`;
}

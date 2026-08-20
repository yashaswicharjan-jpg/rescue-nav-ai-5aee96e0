// Hazard layer. Hazards are locally stored reports (community / mesh / drills)
// scoped to the user's real region — no hardcoded city data is displayed.
import { distanceM } from "./resources";
import { regionForCoords } from "./offlineStore";
import type { Alert } from "./mockAlerts";

const KEY = "crisisnav.hazards";

export interface HazardReport {
  id: string;
  regionId: string;
  type: "airstrike" | "flood" | "earthquake" | "fire" | "riot";
  title: string;
  description: string;
  severity: "critical" | "high" | "moderate";
  confidence: "confirmed" | "likely" | "unverified";
  source: "community" | "mesh" | "drill" | "authority";
  lat: number;
  lng: number;
  radiusM: number;
  createdAt: number;
}

function readAll(): HazardReport[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as HazardReport[]) : [];
  } catch {
    return [];
  }
}

function writeAll(list: HazardReport[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

export function getHazardsNear(
  center: [number, number],
  radiusM = 25000,
): HazardReport[] {
  const regionId = regionForCoords(center[0], center[1]).id;
  return readAll()
    .filter((h) => h.regionId === regionId)
    .filter((h) => distanceM(center, [h.lat, h.lng]) <= radiusM)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function addHazard(
  report: Omit<HazardReport, "id" | "createdAt" | "regionId">,
): HazardReport {
  const hazard: HazardReport = {
    ...report,
    id: `h_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    regionId: regionForCoords(report.lat, report.lng).id,
    createdAt: Date.now(),
  };
  writeAll([hazard, ...readAll()].slice(0, 200));
  return hazard;
}

export function removeHazard(id: string) {
  writeAll(readAll().filter((h) => h.id !== id));
}

export function clearDrills() {
  writeAll(readAll().filter((h) => h.source !== "drill"));
}

/** Creates a clearly-labelled training hazard 900 m from the live GPS fix. */
export function addDrillHazard(center: [number, number]): HazardReport {
  const offsetDeg = 0.008;
  return addHazard({
    type: "flood",
    title: "DRILL — Flash flood zone",
    description:
      "Training scenario only. Not a real emergency. Used to rehearse evacuation routing.",
    severity: "high",
    confidence: "unverified",
    source: "drill",
    lat: center[0] + offsetDeg,
    lng: center[1] + offsetDeg,
    radiusM: 700,
  });
}

/** Adapts a hazard report to the legacy Alert shape used by navigation UI. */
export function hazardToAlert(h: HazardReport, userPos?: [number, number]): Alert {
  const d = userPos ? distanceM(userPos, [h.lat, h.lng]) : 0;
  return {
    id: h.id,
    type: h.type,
    title: h.title,
    description: h.description,
    severity: h.severity === "moderate" ? "medium" : h.severity,
    confidence: h.confidence === "confirmed" ? "high" : h.confidence === "likely" ? "medium" : "low",
    lat: h.lat,
    lng: h.lng,
    distance: d < 1000 ? `${Math.round(d)} m` : `${(d / 1000).toFixed(1)} km`,
    time: new Date(h.createdAt).toLocaleTimeString(),
  };
}

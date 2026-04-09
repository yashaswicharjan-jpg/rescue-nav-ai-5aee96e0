export interface Alert {
  id: string;
  type: "airstrike" | "flood" | "earthquake" | "fire" | "riot";
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  distance: string;
  time: string;
  confidence: "high" | "medium" | "low";
  lat: number;
  lng: number;
}

export const mockAlerts: Alert[] = [
  {
    id: "1",
    type: "airstrike",
    title: "Airstrike Warning",
    description: "Reports of aerial activity detected in the northern sector",
    severity: "critical",
    distance: "3.2 km",
    time: "2 min ago",
    confidence: "high",
    lat: 33.89,
    lng: 35.51,
  },
  {
    id: "2",
    type: "flood",
    title: "Flash Flood Alert",
    description: "Rising water levels near the river basin",
    severity: "high",
    distance: "5.1 km",
    time: "8 min ago",
    confidence: "medium",
    lat: 33.87,
    lng: 35.53,
  },
  {
    id: "3",
    type: "earthquake",
    title: "Seismic Activity",
    description: "Magnitude 4.2 tremor detected",
    severity: "medium",
    distance: "12 km",
    time: "15 min ago",
    confidence: "high",
    lat: 33.85,
    lng: 35.48,
  },
];

export const severityColors: Record<string, string> = {
  critical: "bg-danger text-danger-foreground",
  high: "bg-warning text-warning-foreground",
  medium: "bg-accent text-accent-foreground",
  low: "bg-muted text-muted-foreground",
};

export const typeIcons: Record<string, string> = {
  airstrike: "💥",
  flood: "🌊",
  earthquake: "🌍",
  fire: "🔥",
  riot: "⚠️",
};

import { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Circle, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";
import { X, Clock, ShieldCheck, Loader2, Zap, Shield } from "lucide-react";
import { mockAlerts } from "@/lib/mockAlerts";
import { type ScoredRoute, riskColor, formatKm, formatMin } from "@/lib/routeScoring";

const userIcon = new L.DivIcon({
  html: '<div class="user-beacon"><div class="user-beacon-ring"></div><div class="user-beacon-dot"></div></div>',
  className: "",
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const targetIcon = new L.DivIcon({
  html: '<div style="background:hsl(210,80%,55%);width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 0 8px rgba(0,0,0,0.4);"></div>',
  className: "",
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const FitAll = ({ pts }: { pts: [number, number][] }) => {
  const map = useMap();
  useEffect(() => {
    if (pts.length >= 2) {
      map.fitBounds(L.latLngBounds(pts), { padding: [50, 50] });
    }
  }, [pts, map]);
  return null;
};

interface Props {
  target: { name: string; lat: number; lng: number };
  userPos: [number, number];
  routes: { fastest: ScoredRoute; safest: ScoredRoute } | null;
  loading: boolean;
  onClose: () => void;
}

export const RouteComparePanel = ({ target, userPos, routes, loading, onClose }: Props) => {
  const allPts = useMemo<[number, number][]>(() => {
    const pts: [number, number][] = [userPos, [target.lat, target.lng]];
    if (routes) {
      pts.push(...routes.fastest.coordinates, ...routes.safest.coordinates);
    }
    return pts;
  }, [userPos, target, routes]);

  // Compute the human-readable comparison message
  const comparison = useMemo(() => {
    if (!routes) return null;
    const sameRoute =
      routes.fastest.distanceM === routes.safest.distanceM &&
      routes.fastest.durationS === routes.safest.durationS;
    if (sameRoute) {
      return "Only one route available — already the safest option.";
    }
    const extraMin = Math.max(0, Math.round((routes.safest.durationS - routes.fastest.durationS) / 60));
    const safetyDiff = routes.safest.safetyPct - routes.fastest.safetyPct;
    if (safetyDiff <= 0) {
      return "Fastest route is also the safest.";
    }
    return `Safe route is ${extraMin} min longer but ${Math.round(safetyDiff)}% safer.`;
  }, [routes]);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 bg-primary px-4 py-3 text-primary-foreground">
        <Shield className="h-5 w-5" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold">Route Comparison</p>
          <p className="truncate text-xs opacity-90">to {target.name}</p>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg bg-primary-foreground/20 p-1.5"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Map */}
      <div className="relative flex-1">
        <MapContainer
          center={userPos}
          zoom={14}
          minZoom={2}
          maxZoom={19}
          className="h-full w-full"
          scrollWheelZoom
          doubleClickZoom
          touchZoom
          dragging
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap'
            maxZoom={19}
          />
          <FitAll pts={allPts} />

          {/* Danger zones */}
          {mockAlerts.map((a) => (
            <Circle
              key={a.id}
              center={[a.lat, a.lng]}
              radius={800}
              pathOptions={{
                color: "#ef4444",
                fillColor: "#ef4444",
                fillOpacity: 0.15,
                weight: 1,
                dashArray: "6 4",
              }}
            />
          ))}

          {/* Routes — draw safest underneath, fastest on top */}
          {routes && (
            <>
              <Polyline
                positions={routes.safest.coordinates}
                pathOptions={{
                  color: riskColor(routes.safest.riskScore),
                  weight: 7,
                  opacity: 0.85,
                }}
              />
              <Polyline
                positions={routes.fastest.coordinates}
                pathOptions={{
                  color: riskColor(routes.fastest.riskScore),
                  weight: 4,
                  opacity: 0.85,
                  dashArray: "10 6",
                }}
              />
            </>
          )}

          <Marker position={userPos} icon={userIcon}>
            <Popup>You are here</Popup>
          </Marker>
          <Marker position={[target.lat, target.lng]} icon={targetIcon}>
            <Popup>{target.name}</Popup>
          </Marker>
        </MapContainer>

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-background/80 backdrop-blur">
            <div className="flex items-center gap-2 rounded-lg bg-card px-4 py-3 shadow-lg">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm font-semibold">Calculating safest route...</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom comparison panel */}
      <div className="border-t border-border bg-card px-4 py-3">
        {!routes && !loading && (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Could not fetch routes. Check your connection.
          </p>
        )}
        {routes && (
          <>
            {comparison && (
              <p className="mb-3 rounded-lg bg-primary/10 px-3 py-2 text-center text-xs font-semibold text-primary">
                {comparison}
              </p>
            )}
            <div className="grid grid-cols-2 gap-2">
              <RouteCard route={routes.fastest} title="Fastest" icon={Zap} dashed />
              <RouteCard route={routes.safest} title="Safest" icon={Shield} />
            </div>
            {/* Legend */}
            <div className="mt-2 flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="h-1 w-4 bg-safe" />
                Low risk
              </span>
              <span className="flex items-center gap-1">
                <span className="h-1 w-4 bg-warning" />
                Medium
              </span>
              <span className="flex items-center gap-1">
                <span className="h-1 w-4 bg-danger" />
                High risk
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const RouteCard = ({
  route,
  title,
  icon: Icon,
  dashed,
}: {
  route: ScoredRoute;
  title: string;
  icon: any;
  dashed?: boolean;
}) => {
  const riskTier =
    route.riskScore >= 60 ? "HIGH RISK" : route.riskScore >= 30 ? "MEDIUM" : "LOW RISK";
  const tierClass =
    route.riskScore >= 60
      ? "bg-danger/15 text-danger"
      : route.riskScore >= 30
      ? "bg-warning/15 text-warning"
      : "bg-safe/15 text-safe";

  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <div className="mb-2 flex items-center gap-2">
        <Icon className="h-4 w-4 text-foreground" />
        <span className="text-xs font-bold uppercase tracking-wide text-foreground">{title}</span>
        {dashed && (
          <span className="ml-auto text-[9px] text-muted-foreground">— — —</span>
        )}
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3 w-3" /> Time
          </span>
          <span className="font-bold text-foreground">{formatMin(route.durationS)}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 text-muted-foreground">
            <ShieldCheck className="h-3 w-3" /> Safety
          </span>
          <span className="font-bold text-foreground">{route.safetyPct}%</span>
        </div>
        {/* Safety bar */}
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full transition-all"
            style={{
              width: `${route.safetyPct}%`,
              background: riskColor(route.riskScore),
            }}
          />
        </div>
        <div className="flex items-center justify-between pt-0.5">
          <span className="text-[10px] text-muted-foreground">{formatKm(route.distanceM)}</span>
          <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${tierClass}`}>
            {riskTier}
          </span>
        </div>
      </div>
    </div>
  );
};

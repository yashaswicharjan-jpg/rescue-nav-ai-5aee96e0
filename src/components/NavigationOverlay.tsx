import { useState, useEffect, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { X, Volume2, VolumeX, Navigation, ArrowUp, ArrowLeft, ArrowRight, Flag, ChevronRight } from "lucide-react";
import { type Alert } from "@/lib/mockAlerts";
import { type NavigationRoute, formatDistance, calculateRoute } from "@/lib/navigationUtils";
import { voiceGuidance } from "@/lib/voiceGuidance";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";

// Fix leaflet default icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const userIcon = new L.DivIcon({
  html: '<div class="user-beacon"><div class="user-beacon-ring"></div><div class="user-beacon-dot"></div></div>',
  className: "",
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const shelterIcon = new L.DivIcon({
  html: '<div style="background:hsl(210,80%,55%);width:16px;height:16px;border-radius:50%;border:2px solid white;box-shadow:0 0 8px rgba(59,130,246,0.5);"></div>',
  className: "",
  iconSize: [16, 16],
});

const dangerIcon = new L.DivIcon({
  html: '<div style="background:hsl(0,85%,55%);width:14px;height:14px;border-radius:50%;border:2px solid white;"></div>',
  className: "",
  iconSize: [14, 14],
});

const FitBounds = ({ waypoints }: { waypoints: [number, number][] }) => {
  const map = useMap();
  useEffect(() => {
    if (waypoints.length >= 2) {
      const bounds = L.latLngBounds(waypoints.map(([lat, lng]) => [lat, lng]));
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [waypoints, map]);
  return null;
};

const DIRECTION_ICONS = {
  ahead: ArrowUp,
  left: ArrowLeft,
  right: ArrowRight,
  arrive: Flag,
};

const shelters = [
  { lat: 33.88, lng: 35.50, name: "Central Shelter" },
  { lat: 33.86, lng: 35.52, name: "Hospital Safe Zone" },
  { lat: 33.89, lng: 35.49, name: "Underground Garage" },
];

interface Props {
  alert: Alert;
  userPos: [number, number];
  onClose: () => void;
}

export const NavigationOverlay = ({ alert, userPos, onClose }: Props) => {
  const { language } = useLanguage();
  const { t } = useTranslation(language.code);
  const [voiceOn, setVoiceOn] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [route, setRoute] = useState<NavigationRoute | null>(null);

  useEffect(() => {
    const r = calculateRoute(userPos, shelters, [{ lat: alert.lat, lng: alert.lng }]);
    setRoute(r);
  }, [userPos, alert]);

  // Voice announce current step
  useEffect(() => {
    if (!route || !voiceOn) return;
    const step = route.steps[currentStep];
    if (step) {
      voiceGuidance.speak(step.instruction, language.code);
    }
  }, [currentStep, route, voiceOn, language.code]);

  // Auto-advance steps every few seconds for demo
  useEffect(() => {
    if (!route) return;
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < route.steps.length - 1) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [route]);

  const toggleVoice = useCallback(() => {
    const next = !voiceOn;
    setVoiceOn(next);
    voiceGuidance.setEnabled(next);
    if (!next) voiceGuidance.stop();
  }, [voiceOn]);

  const handleClose = () => {
    voiceGuidance.stop();
    onClose();
  };

  if (!route) return null;

  const step = route.steps[currentStep];
  const DirIcon = step ? DIRECTION_ICONS[step.direction] : ArrowUp;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-background">
      {/* Alert Banner */}
      <div className="flex items-center gap-3 bg-danger px-4 py-3 text-danger-foreground">
        <span className="text-xl">⚠️</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold uppercase tracking-wide">
            {alert.title} ({alert.confidence.toUpperCase()})
          </p>
          <p className="text-xs opacity-90">{alert.description}</p>
        </div>
        <button onClick={handleClose} className="rounded-lg bg-danger-foreground/20 p-1.5">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Map */}
      <div className="relative flex-1">
        <MapContainer
          center={userPos}
          zoom={15}
          minZoom={2}
          maxZoom={19}
          className="h-full w-full"
          zoomControl={true}
          scrollWheelZoom={true}
          doubleClickZoom={true}
          touchZoom={true}
          dragging={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            maxZoom={19}
            minZoom={2}
            tileSize={256}
            zoomOffset={0}
          />
          <FitBounds waypoints={route.waypoints} />

          {/* Danger zone */}
          <Circle
            center={[alert.lat, alert.lng]}
            radius={800}
            pathOptions={{ color: "#ef4444", fillColor: "#ef4444", fillOpacity: 0.2, weight: 2, dashArray: "8 4" }}
          />
          <Marker position={[alert.lat, alert.lng]} icon={dangerIcon}>
            <Popup>{alert.title}</Popup>
          </Marker>

          {/* Safe route polyline */}
          <Polyline
            positions={route.waypoints}
            pathOptions={{ color: "#22c55e", weight: 5, opacity: 0.9 }}
          />

          {/* User */}
          <Circle
            center={userPos}
            radius={80}
            pathOptions={{ color: "#22c55e", fillColor: "#22c55e", fillOpacity: 0.2 }}
          />
          <Marker position={userPos} icon={userIcon}>
            <Popup>{t("your_location")}</Popup>
          </Marker>

          {/* Destination shelter */}
          <Marker position={[route.destination.lat, route.destination.lng]} icon={shelterIcon}>
            <Popup>🏠 {route.destination.name}</Popup>
          </Marker>

          {/* Other shelters */}
          {shelters
            .filter((s) => s.name !== route.destination.name)
            .map((s, i) => (
              <Marker key={i} position={[s.lat, s.lng]} icon={shelterIcon}>
                <Popup>🏠 {s.name}</Popup>
              </Marker>
            ))}
        </MapContainer>

        {/* Voice toggle */}
        <button
          onClick={toggleVoice}
          className="absolute top-3 right-3 z-[1000] rounded-full bg-card/90 p-2.5 backdrop-blur border border-border"
        >
          {voiceOn ? (
            <Volume2 className="h-5 w-5 text-primary" />
          ) : (
            <VolumeX className="h-5 w-5 text-muted-foreground" />
          )}
        </button>

        {/* Distance / Time badge */}
        <div className="absolute top-3 left-3 z-[1000] flex gap-2">
          <div className="rounded-lg bg-card/90 px-3 py-1.5 backdrop-blur border border-border">
            <p className="text-[10px] text-muted-foreground">{t("nav_distance")}</p>
            <p className="text-sm font-bold text-foreground">{formatDistance(route.totalDistance)}</p>
          </div>
          <div className="rounded-lg bg-card/90 px-3 py-1.5 backdrop-blur border border-border">
            <p className="text-[10px] text-muted-foreground">{t("nav_time")}</p>
            <p className="text-sm font-bold text-foreground">{route.estimatedTime} min</p>
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-3 left-3 z-[1000] flex gap-2 rounded-lg bg-card/90 px-3 py-1.5 backdrop-blur border border-border text-[10px]">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-danger" />{t("danger")}</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-safe" />{t("nav_safe_route")}</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-shelter" />{t("shelter")}</span>
        </div>
      </div>

      {/* Turn-by-turn instruction panel */}
      <div className="border-t border-border bg-card">
        {/* Current instruction */}
        {step && (
          <div className="flex items-center gap-4 px-4 py-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
              <DirIcon className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-lg font-bold text-foreground">{step.instruction}</p>
              <p className="text-xs text-muted-foreground">
                {t("nav_step")} {currentStep + 1} / {route.steps.length} — {t("nav_to")} {route.destination.name}
              </p>
            </div>
            <Navigation className="h-5 w-5 text-primary animate-pulse" />
          </div>
        )}

        {/* Upcoming steps */}
        <div className="max-h-28 overflow-y-auto border-t border-border px-4 py-2 space-y-1">
          {route.steps.slice(currentStep + 1, currentStep + 4).map((s, i) => {
            const Icon = DIRECTION_ICONS[s.direction];
            return (
              <div key={i} className="flex items-center gap-3 py-1 text-sm text-muted-foreground">
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1">{s.instruction}</span>
                <ChevronRight className="h-3 w-3" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

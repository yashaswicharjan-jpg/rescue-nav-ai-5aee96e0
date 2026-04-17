import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, ZoomControl, useMap } from "react-leaflet";
import L from "leaflet";
import { mockAlerts } from "@/lib/mockAlerts";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import { MapPin, Navigation, Search } from "lucide-react";

// Fix leaflet default icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const dangerIcon = new L.DivIcon({
  html: '<div style="background:hsl(0,85%,55%);width:14px;height:14px;border-radius:50%;border:2px solid white;"></div>',
  className: "",
  iconSize: [14, 14],
});

const shelterIcon = new L.DivIcon({
  html: '<div style="background:hsl(210,80%,55%);width:14px;height:14px;border-radius:50%;border:2px solid white;"></div>',
  className: "",
  iconSize: [14, 14],
});

const userIcon = new L.DivIcon({
  html: '<div class="user-beacon"><div class="user-beacon-ring"></div><div class="user-beacon-dot"></div></div>',
  className: "",
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const shelters = [
  { lat: 33.88, lng: 35.50, name: "Central Shelter" },
  { lat: 33.86, lng: 35.52, name: "Hospital Safe Zone" },
  { lat: 33.89, lng: 35.49, name: "Underground Garage" },
];

const RecenterMap = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

export const MapView = () => {
  const { language } = useLanguage();
  const { t } = useTranslation(language.code);
  const [userPos, setUserPos] = useState<[number, number]>([33.88, 35.50]);
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [locationInput, setLocationInput] = useState("");

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
      () => {}
    );
  }, []);

  const handleLocationSubmit = () => {
    const parts = locationInput.split(",").map((s) => parseFloat(s.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      setUserPos([parts[0], parts[1]]);
      setShowLocationInput(false);
      setLocationInput("");
    }
  };

  const handleUseMyLocation = () => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        setUserPos([pos.coords.latitude, pos.coords.longitude]);
        setShowLocationInput(false);
      },
      () => {}
    );
  };

  return (
    <div className="space-y-2">
      <div className="relative h-[400px] w-full overflow-hidden rounded-lg border border-border map-container" style={{ height: "400px" }}>
        <MapContainer
          center={userPos}
          zoom={13}
          minZoom={2}
          maxZoom={19}
          zoomControl={false}
          scrollWheelZoom={true}
          doubleClickZoom={true}
          touchZoom={true}
          dragging={true}
          className="h-full w-full"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            maxZoom={19}
            minZoom={2}
            tileSize={256}
            zoomOffset={0}
          />
          <ZoomControl position="topleft" />
          <RecenterMap center={userPos} />

          {/* User position */}
          <Circle center={userPos} radius={150} pathOptions={{ color: "#22c55e", fillColor: "#22c55e", fillOpacity: 0.2 }} />
          <Marker position={userPos} icon={userIcon}>
            <Popup>{t("your_location")}</Popup>
          </Marker>

          {/* Danger zones */}
          {mockAlerts.map((alert) => (
            <div key={alert.id}>
              <Circle
                center={[alert.lat, alert.lng]}
                radius={800}
                pathOptions={{ color: "#ef4444", fillColor: "#ef4444", fillOpacity: 0.15 }}
              />
              <Marker position={[alert.lat, alert.lng]} icon={dangerIcon}>
                <Popup>{alert.title} — {alert.severity}</Popup>
              </Marker>
            </div>
          ))}

          {/* Shelters */}
          {shelters.map((s, i) => (
            <Marker key={i} position={[s.lat, s.lng]} icon={shelterIcon}>
              <Popup>🏠 {s.name}</Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Legend */}
        <div className="absolute bottom-2 left-2 z-[1000] flex gap-2 rounded-md bg-background/90 px-2 py-1 text-[10px] backdrop-blur border border-border">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-danger" />{t("danger")}</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-safe" />{t("safe")}</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-shelter" />{t("shelter")}</span>
        </div>

        {/* Location toggle button */}
        <button
          onClick={() => setShowLocationInput(!showLocationInput)}
          className="absolute top-2 right-2 z-[1000] flex items-center gap-1 rounded-lg bg-card/90 px-2.5 py-1.5 text-xs font-medium text-foreground backdrop-blur hover:bg-card transition-colors"
        >
          <MapPin className="h-3.5 w-3.5 text-primary" />
          {t("enter_location")}
        </button>
      </div>

      {/* Location input panel */}
      {showLocationInput && (
        <div className="rounded-lg border border-border bg-card p-3 space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLocationSubmit()}
                placeholder={t("search_location")}
                className="w-full rounded-lg border border-border bg-secondary pl-8 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button onClick={handleLocationSubmit} className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90">
              <Search className="h-4 w-4" />
            </button>
          </div>
          <button onClick={handleUseMyLocation} className="flex w-full items-center justify-center gap-2 rounded-lg bg-secondary py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors">
            <Navigation className="h-3.5 w-3.5 text-primary" />
            {t("use_my_location")}
          </button>
        </div>
      )}
    </div>
  );
};

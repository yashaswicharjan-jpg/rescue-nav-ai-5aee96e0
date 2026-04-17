import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, ZoomControl, useMap } from "react-leaflet";
import L from "leaflet";
import { mockAlerts } from "@/lib/mockAlerts";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";
import { Navigation, Search, Loader2, LocateFixed } from "lucide-react";

// Fix leaflet default icon (prevents grey-box markers)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
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
  html: '<div class="pulse-dot"></div>',
  className: "",
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const searchIcon = new L.DivIcon({
  html: '<div style="background:hsl(38,92%,50%);width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 0 8px rgba(0,0,0,0.4);"></div>',
  className: "",
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const shelters = [
  { lat: 33.88, lng: 35.50, name: "Central Shelter" },
  { lat: 33.86, lng: 35.52, name: "Hospital Safe Zone" },
  { lat: 33.89, lng: 35.49, name: "Underground Garage" },
];

async function searchLocation(query: string) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
    { headers: { "Accept-Language": "en" } }
  );
  const data = await res.json();
  return data[0]
    ? { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon), name: data[0].display_name }
    : null;
}

const FlyToLocation = ({ coords }: { coords: [number, number] | null }) => {
  const map = useMap();
  useEffect(() => {
    if (coords) map.flyTo(coords, 14, { animate: true, duration: 1.5 });
  }, [coords, map]);
  return null;
};

export const MapView = () => {
  const { language } = useLanguage();
  const { t } = useTranslation(language.code);
  const [userPos, setUserPos] = useState<[number, number]>([33.88, 35.50]);
  const [searchQuery, setSearchQuery] = useState("");
  const [flyCoords, setFlyCoords] = useState<[number, number] | null>(null);
  const [searchMarker, setSearchMarker] = useState<{ pos: [number, number]; name: string } | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        const c: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserPos(c);
        setFlyCoords(c);
      },
      () => {}
    );
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchError(null);
    try {
      const result = await searchLocation(searchQuery);
      if (result) {
        const pos: [number, number] = [result.lat, result.lon];
        setFlyCoords(pos);
        setSearchMarker({ pos, name: result.name });
      } else {
        setSearchError("Location not found");
      }
    } catch {
      setSearchError("Search failed");
    } finally {
      setSearching(false);
    }
  };

  const handleUseMyLocation = () => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        const c: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserPos(c);
        setFlyCoords(c);
      },
      () => setSearchError("Location access denied")
    );
  };

  return (
    <div className="space-y-2">
      <div
        className="relative w-full overflow-hidden rounded-lg border border-border"
        style={{ height: "500px" }}
      >
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
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            maxZoom={19}
            minZoom={2}
            tileSize={256}
            zoomOffset={0}
          />
          <ZoomControl position="bottomright" />
          <FlyToLocation coords={flyCoords} />

          {/* User position */}
          <Circle center={userPos} radius={150} pathOptions={{ color: "#1a73e8", fillColor: "#1a73e8", fillOpacity: 0.15 }} />
          <Marker position={userPos} icon={userIcon}>
            <Popup>{t("your_location")}</Popup>
          </Marker>

          {/* Search marker */}
          {searchMarker && (
            <Marker position={searchMarker.pos} icon={searchIcon}>
              <Popup>{searchMarker.name}</Popup>
            </Marker>
          )}

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

        {/* Floating search bar (top center) */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] w-[min(92%,440px)] flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder={t("search_location") || "Search any city, country, or place..."}
              className="w-full rounded-xl border border-border bg-card/95 pl-9 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground shadow-lg backdrop-blur focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={searching}
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 disabled:opacity-60"
          >
            {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </button>
        </div>

        {/* My Location button */}
        <button
          onClick={handleUseMyLocation}
          className="absolute bottom-4 left-3 z-[1000] flex items-center gap-2 rounded-full bg-card/95 px-4 py-2.5 text-sm font-semibold text-foreground shadow-lg backdrop-blur border border-border hover:bg-card"
        >
          <LocateFixed className="h-4 w-4 text-primary" />
          {t("use_my_location") || "My Location"}
        </button>

        {/* Error toast */}
        {searchError && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[1000] rounded-lg bg-destructive px-3 py-1.5 text-xs text-destructive-foreground shadow-lg">
            {searchError}
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 right-3 z-[1000] flex flex-col gap-1 rounded-lg bg-card/90 px-2.5 py-1.5 text-[10px] backdrop-blur border border-border">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-danger" />{t("danger")}</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-safe" />{t("safe")}</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-shelter" />{t("shelter")}</span>
        </div>
      </div>
    </div>
  );
};

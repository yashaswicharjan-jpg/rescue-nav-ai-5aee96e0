import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import { mockAlerts } from "@/lib/mockAlerts";

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

const shelters = [
  { lat: 33.88, lng: 35.50, name: "Central Shelter" },
  { lat: 33.86, lng: 35.52, name: "Hospital Safe Zone" },
  { lat: 33.89, lng: 35.49, name: "Underground Garage" },
];

export const MapView = () => {
  const [userPos, setUserPos] = useState<[number, number]>([33.88, 35.50]);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
      () => {}
    );
  }, []);

  return (
    <div className="relative h-[300px] w-full overflow-hidden rounded-lg border border-border">
      <MapContainer center={userPos} zoom={13} className="h-full w-full" zoomControl={false}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        />
        {/* User position */}
        <Circle center={userPos} radius={100} pathOptions={{ color: "#3b82f6", fillColor: "#3b82f6", fillOpacity: 0.3 }} />
        <Marker position={userPos}>
          <Popup>Your Location</Popup>
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
      <div className="absolute bottom-2 left-2 z-[1000] flex gap-2 rounded-md bg-card/90 px-2 py-1 text-[10px] backdrop-blur">
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-danger" />Danger</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-safe" />Safe</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-shelter" />Shelter</span>
      </div>
    </div>
  );
};

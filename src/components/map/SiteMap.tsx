"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default icon paths (Webpack/Next.js breaks Leaflet's default icon)
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const ActiveIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface SiteMarker {
  id: string;
  siteCode: string;
  mediaType: string;
  locality: string;
  lat: number;
  lng: number;
  campaignName: string;
  campaignStatus: string;
  vendorName: string;
  monitorName: string | null;
}

function FitBounds({ markers }: { markers: SiteMarker[] }) {
  const map = useMap();
  useEffect(() => {
    if (markers.length === 0) return;
    const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng]));
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [map, markers]);
  return null;
}

export default function SiteMap({ markers }: { markers: SiteMarker[] }) {
  return (
    <MapContainer
      center={[20.5937, 78.9629]}
      zoom={5}
      style={{ height: "100%", width: "100%" }}
      className="rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds markers={markers} />
      {markers.map((m) => (
        <Marker
          key={m.id}
          position={[m.lat, m.lng]}
          icon={m.campaignStatus === "ACTIVE" ? ActiveIcon : DefaultIcon}
        >
          <Popup>
            <div className="text-sm space-y-1 min-w-[180px]">
              <p className="font-semibold text-gray-800">{m.siteCode}</p>
              <p className="text-gray-600">{m.mediaType.replace("_", " ")}</p>
              <p className="text-gray-500">{m.locality}</p>
              <hr className="my-1" />
              <p className="text-xs text-gray-500">Campaign: <span className="text-gray-700 font-medium">{m.campaignName}</span></p>
              <p className="text-xs text-gray-500">Vendor: <span className="text-gray-700">{m.vendorName}</span></p>
              {m.monitorName && (
                <p className="text-xs text-gray-500">Monitor: <span className="text-gray-700">{m.monitorName}</span></p>
              )}
              <span className={`inline-block text-xs px-2 py-0.5 rounded font-medium mt-1 ${
                m.campaignStatus === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
              }`}>
                {m.campaignStatus}
              </span>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import mobileIconImg from "../assets/smartphone.png";
// ✅ Fix marker icons (Leaflet’s default icons won’t load without this)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});
const mobileIcon = new L.Icon({
  iconUrl: mobileIconImg,
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -35],
});

export default function MapView() {
  // Example mobile locations (latitude, longitude)
  const mobiles = [
    {
      id: 1,
      name: "Mobile 1",
      lat: -33.927,
      lng: 18.413,
      info: "Device 1 - Near City Bowl",
    },
    {
      id: 2,
      name: "Mobile 2",
      lat: -33.922,
      lng: 18.385,
      info: "Device 2 - Near Fresnaye",
    },
    {
      id: 3,
      name: "Mobile 3",
      lat: -33.918,
      lng: 18.414,
      info: "Device 3 - Near Bo-Kaap",
    },
  ];

  // Center map on first mobile
  const center = [mobiles[0].lat, mobiles[0].lng];

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <MapContainer center={center} zoom={10} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {mobiles.map((m) => (
          <Marker key={m.id} position={[m.lat, m.lng]} icon={mobileIcon}>
            <Popup>
              <b>{m.name}</b> <br />
              {m.info}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import api from "../api/axios";
import mobileIconImg from "../assets/smartphone.png";
import { getLocationConnection } from "../signalr/locationHub";

// Fix Leaflet Icon Issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom Mobile Icon
const mobileIcon = new L.Icon({
  iconUrl: mobileIconImg,
  iconSize: [20, 20],
  iconAnchor: [19, 38],
  popupAnchor: [0, -35],
});

// Auto zoom to show all markers
function FitBounds({ locations }) {
  const map = useMap();
  useEffect(() => {
    if (locations.length > 0) {
      const bounds = locations.map((loc) => [loc.latitude, loc.longitude]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [locations]);
  return null;
}

export default function MapView() {
  const [locations, setLocations] = useState([]);
  const [center, setCenter] = useState([20.5937, 78.9629]); // Default India
  const [userHistory, setUserHistory] = useState({});
  const [locationNames, setLocationNames] = useState({});
  const [historyLocationNames, setHistoryLocationNames] = useState({});

  // --------------------------------------------------------------------
  // FETCH LIVE LOCATIONS
  // --------------------------------------------------------------------
  const fetchLocations = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("Location/all-latest", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const cleaned = (res.data || [])
        .filter((loc) => loc)
        .map((loc) => ({
          ...loc,
          latitude: Number(loc.latitude),
          longitude: Number(loc.longitude),
        }));

      setLocations(cleaned);
    } catch (err) {
      console.error("Live fetch error:", err);
    }
  };

  // --------------------------------------------------------------------
  // SIGNALR REALTIME LISTENER + TRIGGER
  // --------------------------------------------------------------------
  useEffect(() => {
    getLocationConnection().then((hub) => {
      // Trigger: ask all clients to send location
      hub
        .invoke("RequestLiveLocations")
        .then(() => console.log("📡 Requested live locations on load"))
        .catch((err) => console.error("Failed to request live locations:", err));

      // When a client sends location → update live map
      hub.on("ReceiveLocation", (loc) => {
        console.log("📡 Real-time location:", loc);

        setLocations((prev) => {
          const others = prev.filter((x) => x.userName !== loc.userName);
          return [...others, loc];
        });
      });
    });
  }, []);

  // --------------------------------------------------------------------
  // REVERSE GEOCODING FOR CURRENT LOCATION
  // --------------------------------------------------------------------
  const fetchPlaceName = async (lat, lng, userName) => {
    try {
      if (locationNames[userName]) return;

      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );

      const data = await res.json();
      const place =
        data.address.city ||
        data.address.town ||
        data.address.village ||
        data.address.suburb ||
        data.address.state ||
        "Unknown Location";

      setLocationNames((prev) => ({ ...prev, [userName]: place }));
    } catch (err) {
      console.error("Reverse geocode error:", err);
    }
  };

  // --------------------------------------------------------------------
  // REVERSE GEOCODING FOR HISTORY POINTS
  // --------------------------------------------------------------------
  const fetchHistoryPlaceName = async (lat, lng, userName) => {
    try {
      const key = `${lat}-${lng}`;

      if (
        historyLocationNames[userName] &&
        historyLocationNames[userName][key]
      ) {
        return; // already fetched
      }

      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );

      const data = await res.json();
      const place =
        data.address.city ||
        data.address.town ||
        data.address.village ||
        data.address.suburb ||
        data.address.state ||
        "Unknown Location";

      setHistoryLocationNames((prev) => ({
        ...prev,
        [userName]: {
          ...(prev[userName] || {}),
          [key]: place,
        },
      }));
    } catch (err) {
      console.error("History geocode error:", err);
    }
  };

  // --------------------------------------------------------------------
  // SAFE ARRAY EXTRACTOR
  // --------------------------------------------------------------------
  const extractArray = (payload) => {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;

    if (Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload.history)) return payload.history;
    if (Array.isArray(payload.result)) return payload.result;
    if (Array.isArray(payload.locations)) return payload.locations;

    const vals = Object.values(payload);
    return vals.filter((v) => typeof v === "object");
  };

  // --------------------------------------------------------------------
  // FETCH TOP 10 HISTORY BY USERNAME
  // --------------------------------------------------------------------
  const fetchUserHistory = async (userName) => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get(`Location/history/${userName}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      let arr = extractArray(res.data);
      arr = arr.slice(0, 30); // top 10 only

      const cleaned = arr.map((h) => ({
        ...h,
        latitude: Number(h.latitude),
        longitude: Number(h.longitude),
      }));

      // Fetch city name for each history point
      cleaned.forEach((h) => {
        fetchHistoryPlaceName(h.latitude, h.longitude, userName);
      });

      setUserHistory((prev) => ({ ...prev, [userName]: cleaned }));
    } catch (err) {
      console.error("History fetch error:", err);
    }
  };

  // --------------------------------------------------------------------
  // AUTO FETCH LIVE LOCATION EVERY 30 SECONDS
  // --------------------------------------------------------------------
  useEffect(() => {
    fetchLocations();
    const interval = setInterval(fetchLocations, 30000);
    return () => clearInterval(interval);
  }, []);

  // --------------------------------------------------------------------
  // FETCH CITY NAME FOR ALL USERS
  // --------------------------------------------------------------------
  useEffect(() => {
    locations.forEach((loc) => {
      fetchPlaceName(loc.latitude, loc.longitude, loc.userName);
    });
  }, [locations]);

  // --------------------------------------------------------------------
  // MAP UI
  // --------------------------------------------------------------------
  return (
    <div style={{ height: "100vh", width: "100%" }}>
      
      {/* ⭐ REFRESH BUTTON ⭐ */}
     <div style={{ position: "absolute", top: 10, right: 10, zIndex: 1000 }}>
  <button
    onClick={() => {
      fetchLocations();
      getLocationConnection().then((hub) => {
        hub.invoke("RequestLiveLocations")
          .then(() => console.log("🔄 Manual refresh requested"))
          .catch((err) => console.error("Refresh request failed:", err));
      });
    }}
    style={{
      padding: "10px 16px",
      background: "#28a745",
      border: "none",
      color: "white",
      borderRadius: "30px",
      cursor: "pointer",
      fontWeight: "bold",
      boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      fontSize: "15px"
    }}
  >
    {/* 🔴 FLASHING DOT */}
    <span
      style={{
        width: "18px",
        height: "18px",
        borderRadius: "50%",
        backgroundColor: "#ff4444",
        boxShadow: "0 0 6px 3px rgba(255, 0, 0, 0.6)",
        animation: "pulse 1.2s infinite",
        display: "inline-block"
      }}
    ></span>

    🔄 Refresh Live Locations
  </button>
</div>


      <MapContainer center={center} zoom={6} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBounds locations={locations} />

        {locations.map((loc, index) => (
          <Marker
            key={index}
            position={[loc.latitude, loc.longitude]}
            icon={mobileIcon}
          >
            <Popup>
              <div style={{ width: "260px" }}>
                <b>👤 {loc.userName}</b>
                <br />

                <b>📍 Location:</b> {locationNames[loc.userName] || "Loading..."}
                <br />
                Lat: {loc.latitude}
                <br />
                Lng: {loc.longitude}
                <br />
                🕒 {new Date(loc.serverTimestamp).toLocaleString()}
                <br /><br />

                <button
                  onClick={() => fetchUserHistory(loc.userName)}
                  style={{
                    padding: "6px 12px",
                    cursor: "pointer",
                    background: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    width: "100%",
                  }}
                >
                  Show Last 30 History
                </button>

                {userHistory[loc.userName] && (
                  <div style={{ marginTop: "10px" }}>
                    <b>📜 Last 30 History Points:</b>
                    <ul
                      style={{
                        maxHeight: "150px",
                        overflowY: "auto",
                        paddingLeft: "15px",
                      }}
                    >
                      {userHistory[loc.userName].map((h, idx) => {
                        const key = `${h.latitude}-${h.longitude}`;
                        const place =
                          historyLocationNames[loc.userName]?.[key] ||
                          "Loading...";
                        return (
                          <li
                            key={idx}
                            style={{
                              borderBottom:
                                idx !== userHistory[loc.userName].length - 1
                                  ? "1px dashed #999"
                                  : "none",
                              paddingBottom: "6px",
                              marginBottom: "6px",
                            }}
                          >
                            <b>{place}</b>
                            <br />
                            {h.latitude}, {h.longitude}
                            <br />
                            <small style={{ color: "green" }}>
                              {new Date(h.serverTimestamp).toLocaleString()}
                            </small>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

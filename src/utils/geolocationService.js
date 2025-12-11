// geolocationService.js
import api from "../api/axios";
import { getLocationConnection } from "../signalr/locationHub";

let worker = null;
let isSendingLocation = false; // Prevent simultaneous sends
let lastSentAt = 0;
const MIN_INTERVAL = 5000; // 5s throttle

// Register SignalR listener ONCE
getLocationConnection().then((hub) => {
  hub.off("SendYourLocation"); // Remove old listeners if hot reload
  hub.on("SendYourLocation", () => {
    console.log("📡 Server requested → sending location (SignalR)");
    uploadLocation("signalr");
  });
});

// MAIN LOCATION UPLOAD FUNCTION
async function uploadLocation(source = "unknown") {
  const now = Date.now();

  // 1️⃣ Prevent multiple sends at the same time
  if (isSendingLocation) {
    console.warn(`⏳ Skipped (${source}) → still processing previous upload`);
    return;
  }

  // 2️⃣ Prevent rapid repeated sending
  if (now - lastSentAt < MIN_INTERVAL) {
    console.warn(`🚫 Skipped (${source}) → throttled`);
    return;
  }

  lastSentAt = now;
  isSendingLocation = true;

  console.log(`🚀 uploadLocation triggered by: ${source}`);

  if (!navigator.geolocation) {
    console.warn("❌ Geolocation not supported");
    isSendingLocation = false;
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude, accuracy } = pos.coords;

      const payload = {
        userName: localStorage.getItem("userId"),
        latitude,
        longitude,
        accuracy,
        deviceTimestamp: new Date().toISOString(),
      };

      console.log("📍 Captured:", payload);

      // ------------------------------------------
      // ⭐ 1. SEND TO SIGNALR (Realtime map update)
      // ------------------------------------------
      try {
        const hub = await getLocationConnection();
        await hub.invoke("UpdateLocation", payload);
        console.log("📡 SignalR sent:", payload);
      } catch (err) {
        console.error("❌ SignalR send failed:", err);
      }

      // ------------------------------------------
      // ⭐ 2. STORE IN DATABASE VIA API
      // ------------------------------------------
      try {
        const token = localStorage.getItem("token");

        await api.post("Location/save", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("💾 API save success:", payload);
      } catch (err) {
        console.error("❌ DB save failed → caching offline:", err);
        saveOffline(payload);
      }

      isSendingLocation = false;
    },

    // ---------------------------------------------------------
    // ❌ ERROR HANDLER + RETRY LOGIC FOR ERROR CODE 2 (UNAVAILABLE)
    // ---------------------------------------------------------
    (err) => {
      console.warn("⚠️ Geolocation error:", err);

      isSendingLocation = false;

      if (err.code === 2) {
        // Retry after 2 seconds
        console.warn("🔁 Retrying location in 2 seconds...");
        setTimeout(() => uploadLocation("retry"), 2000);
      }
    },

    // ------------------------------------------------------------------
    // ⭐ HIGH ACCURACY SETTINGS (Fixes many POSITION_UNAVAILABLE issues)
    // ------------------------------------------------------------------
    {
      enableHighAccuracy: true,
      timeout: 10000, // 10 sec
      maximumAge: 0,
    }
  );
}

// Store offline if API fails
function saveOffline(data) {
  const list = JSON.parse(localStorage.getItem("pendingLocations") || "[]");
  list.push(data);
  localStorage.setItem("pendingLocations", JSON.stringify(list));
}

// Sync offline cached locations
async function syncOffline() {
  let queue = JSON.parse(localStorage.getItem("pendingLocations") || "[]");
  if (!queue.length) return;

  console.log("🔄 Syncing offline cached locations...");

  const token = localStorage.getItem("token");

  for (const item of queue) {
    try {
      await api.post("Location/save", item, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("☑️ Sent cached:", item);

      queue.shift();
      localStorage.setItem("pendingLocations", JSON.stringify(queue));
    } catch {
      console.log("⛔ Still offline → stopping sync");
      break;
    }
  }
}

// Start background tracking
export function startGeoLocationUploader() {
  if (worker) {
    console.log("⚠️ Worker already running");
    return;
  }

  console.log("📡 Starting background location service...");

  uploadLocation("startup");
  syncOffline();

  worker = new Worker("/location-worker.js");

  worker.onmessage = () => {
    uploadLocation("worker");
    syncOffline();
  };
}

// Stop background tracking
export function stopGeoLocationUploader() {
  if (worker) {
    worker.terminate();
    worker = null;
    console.log("🛑 Location worker stopped");
  }
}

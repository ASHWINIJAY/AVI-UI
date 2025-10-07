import api from "../api/axios";

const OFFLINE_KEYS = [
  { key: "offlineForms", url: "InfoLocosFinal/submit", isFormData: true },
  { key: "offlineWalkForms", url: "WalkInspect/submit", isFormData: false },
   { key: "offlineFrontLoco", url: "FrontLocoInspect/submit", isFormData: false },
];

export async function syncOfflineData() {
  console.log("🌐 Checking for offline data to sync...");

  for (const { key, url, isFormData } of OFFLINE_KEYS) {
    const offlineData = JSON.parse(localStorage.getItem(key) || "[]");
    if (offlineData.length === 0) continue;

    for (const item of offlineData) {
      try {
        let payload;
        let config = {};
        if (isFormData) {
          payload = new FormData();
          Object.entries(item).forEach(([k, value]) => {
            if (value !== null && value !== undefined && value !== "") {
              if (Array.isArray(value)) value.forEach((file) => payload.append(k, file));
              else payload.append(k, value);
            }
          });
          config = { headers: { "Content-Type": "multipart/form-data" } };
        } else {
          payload = item; // JSON payload
        }

        await api.post(url, payload, config);
        console.log(`✅ Synced offline data from ${key}`);
      } catch (err) {
        console.error(`❌ Failed to sync offline data from ${key}:`, err);
      }
    }

    localStorage.removeItem(key);
  }

  console.log("🎉 All offline data synced and cleared!");
}

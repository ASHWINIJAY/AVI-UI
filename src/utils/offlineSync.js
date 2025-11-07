import api from "../api/axios";

const OFFLINE_KEYS = [
  { key: "offlineForms", url: "InfoLocosFinal/submit", isFormData: true },
  { key: "offlineLocoCaptureForms", url: "LocoInfoCapture/submit", isFormData: true },
  { key: "offlineWalkForms", url: "WalkInspect/submit", isFormData: false },
   { key: "offlineFrontLoco", url: "FrontLocoInspect/submit", isFormData: false },
   { key: "offlineShortNose", url: "ShortNoseInspect/submit", isFormData: false },
   { key: "offlineCabLoco", url: "CabLocoInspect/submit", isFormData: false },
   { key: "offlineElectCab", url: "ElectCabInspect/submit", isFormData: false },
   { key: "offlineBatSwitch", url: "BatSwitchInspect/submit", isFormData: false },
   { key: "offlineLeftMidDoor", url: "LeftMidDoorInspect/submit", isFormData: false },
   { key: "offlineBotLeftPan", url: "BotLeftPanInspect/submit", isFormData: false },
   { key: "offlineCenAir", url: "CenAirInspect/submit", isFormData: false },
   { key: "offlineCirBreakPan", url: "CirBreakPanInspect/submit", isFormData: false },
   { key: "offlineComFan", url: "ComFanInspect/submit", isFormData: false },
   { key: "offlineCoupGear", url: "CoupGearInspect/submit", isFormData: false },
   { key: "offlineEndDeck", url: "EndDeckInspect/submit", isFormData: false },
   { key: "offlineEngineDeck", url: "EngineDeckInspect/submit", isFormData: false },
   { key: "offlineMidPan", url: "MidPanInspect/submit", isFormData: false },
   { key: "offlineRoofInspect", url: "RoofInspect/submit", isFormData: false },
   { key: "offlineTopRightPan", url: "TopRightPanInspect/submit", isFormData: false },
];
export function hasOfflineData() {
  return OFFLINE_KEYS.some(({ key }) => {
    const data = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(data) && data.length > 0;
  });
}
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

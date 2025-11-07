// utils/offlineHelper.js

/**
 * Get cached loco info from localStorage (array-based cache)
 * @param {string} cacheKey - localStorage key (e.g., "locoInfoCache")
 * @param {number|string} locoNumber - loco number to find
 * @returns {object|null} cached data or null if not found
 */
export function getCachedDataWhenOffline(cacheKey, locoNumber) {
  //if (navigator.onLine) return null; // ✅ Only run offline

  try {
    // Parse localStorage cache (array of objects)
    const cacheList = JSON.parse(localStorage.getItem(cacheKey) || "[]");

    // Find by locoNumber (ensure number comparison)
    const cached = cacheList.find(
      (item) => Number(item.locoNumber) === Number(locoNumber)
    );

    if (cached) {
      console.log("📴 Using cached data for loco:", locoNumber);
      return cached;
    } else {
      console.warn("⚠️ No cached data found for loco:", locoNumber);
      return null;
    }
  } catch (err) {
    console.error("❌ Failed to load cached data:", err);
    return null;
  }
}

/**
 * Save or update loco info in cache (array-based)
 * @param {string} cacheKey - localStorage key (e.g., "locoInfoCache")
 * @param {object} newData - { locoNumber, inventoryNumber, netBookValue }
 */
export function saveLocoDataToCache(cacheKey, newData) {
  try {
    const cacheList = JSON.parse(localStorage.getItem(cacheKey) || "[]");

    // Remove existing entry with same locoNumber
    const updated = [
      ...cacheList.filter(
        (item) => Number(item.locoNumber) !== Number(newData.locoNumber)
      ),
      newData,
    ];

    localStorage.setItem(cacheKey, JSON.stringify(updated));
    console.log("💾 Cached data for loco:", newData.locoNumber);
  } catch (err) {
    console.error("❌ Failed to save loco data:", err);
  }
}

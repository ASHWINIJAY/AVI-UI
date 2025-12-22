import Dexie from "dexie";

export const offlineDb = new Dexie("InspectionOfflineDB");

offlineDb.version(1).stores({
    inspections: "id, status, createdAt",
    syncQueue: "id, endpoint, method, createdAt"
});
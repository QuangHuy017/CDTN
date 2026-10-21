import roomIds from "../data/room-id-mapping.json";

export function readSavedRooms() {
  try {
    const value = JSON.parse(localStorage.getItem("unihome:saved-rooms") || "[]");
    if (!Array.isArray(value)) return [];
    return [...new Set(value.map((id) => roomIds[String(id)] ?? Number(id)).filter((id) => Number.isSafeInteger(id) && id > 0))];
  } catch { return []; }
}

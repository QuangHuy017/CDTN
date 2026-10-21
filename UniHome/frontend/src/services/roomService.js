export function filtersToQuery(filters) {
  const query = new URLSearchParams();
  if (filters.khuVuc) query.set("khuVuc", filters.khuVuc);
  if (filters.q) query.set("q", filters.q);
  for (const [key, field] of [["price", "giaThue"], ["area", "dienTich"]]) {
    const [min, max] = (filters[key] || "").split("-");
    if (min) query.set(`${field}Min`, min);
    if (max) query.set(`${field}Max`, max);
  }
  query.set("page", String(filters.page || 1));
  query.set("limit", "6");
  query.set("sort", "giaThue");
  return query;
}

export async function getRooms(filters, signal) {
  const response = await fetch(`/api/rooms?${filtersToQuery(filters)}`, { signal });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.pagination || !Array.isArray(data.data)) throw new Error(data?.message || "Chưa tải được phòng. Kiểm tra backend ở cổng 3000 rồi thử lại.");
  return data;
}

export function parseRoomPrompt(prompt, regions) {
  const normalize = (text) => text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");
  const text = normalize(prompt);
  const filters = { khuVuc: "", price: "", area: "" };
  filters.khuVuc = regions.find((region) => text.includes(normalize(region))) || "";
  const price = text.match(/(duoi|tren|tu|tam|khoang)\s*(\d+(?:[.,]\d+)?)\s*(?:trieu|tr)\b/);
  const area = text.match(/(tren|duoi|rong|tu)\s*(\d+(?:[.,]\d+)?)\s*m(?:2|²)/);
  if (price) {
    const value = Math.round(Number(price[2].replace(",", ".")) * 1000000);
    filters.price = price[1] === "duoi" ? `0-${value}` : `${value}-`;
  }
  if (area) {
    const value = Number(area[2].replace(",", "."));
    filters.area = area[1] === "duoi" ? `0-${value}` : `${value}-`;
  }
  return { filters, recognized: !!(filters.khuVuc || price || area) };
}

async function readCatalog(path, signal) {
  let response;
  try { response = await fetch(path, { signal }); }
  catch (error) {
    if (signal?.aborted) throw error;
    throw new Error("Không thể tải dữ liệu. Vui lòng kiểm tra kết nối và backend.");
  }
  const data = await response.json().catch(() => null);
  if (!response.ok || !Array.isArray(data?.data) || !data?.pagination) throw new Error(data?.message || "Không thể tải danh sách phòng. Vui lòng thử lại.");
  return data;
}

export async function getFeaturedRooms({ page = 1, all = false } = {}, signal) {
  const query = new URLSearchParams({ page: String(page), limit: "12", sort: "-createdAt" });
  if (!all) query.set("trangThai", "con_trong");
  const [rooms, buildings] = await Promise.all([
    readCatalog(`/api/rooms?${query}`, signal),
    readCatalog("/api/buildings?limit=100", signal),
  ]);
  const byCode = new Map(buildings.data.map((building) => [building.maCoSo, building]));
  return { ...rooms, data: rooms.data.map((room) => ({ ...room, building: byCode.get(room.maCoSo) || null })) };
}

export async function getRoomDetails(id, signal) {
  if ((!/^[1-9]\d*$/.test(String(id || "")) || !Number.isSafeInteger(Number(id)))) throw Object.assign(new Error("Không tìm thấy phòng."), { status: 404 });
  let response;
  try { response = await fetch(`/api/rooms/${encodeURIComponent(id)}`, { signal }); }
  catch (error) {
    if (signal?.aborted) throw error;
    throw new Error("Không thể kết nối máy chủ. Vui lòng thử lại.");
  }
  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.data?._id) throw Object.assign(new Error(response.status === 404 ? "Phòng này không còn tồn tại." : data?.message || "Không tải được thông tin phòng."), { status: response.status });
  const buildings = await readCatalog(`/api/buildings?${new URLSearchParams({ q: data.data.maCoSo, limit: "100" })}`, signal);
  return { ...data.data, building: buildings.data.find((building) => building.maCoSo === data.data.maCoSo) || null };
}

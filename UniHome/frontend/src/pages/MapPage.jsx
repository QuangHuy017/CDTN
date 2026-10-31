import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { readSavedRooms } from "../services/savedRooms";
import BuildingMap, { buildingPosition } from "../components/rooms/BuildingMap";
import RoomCard from "../components/rooms/RoomCard";
import { adminRequest } from "../services/adminService";

async function loadBuildings(signal) {
  const buildings = [];
  let page = 1, pages = 1;
  do {
    const result = await adminRequest(`/buildings?limit=100&page=${page}`, { signal });
    buildings.push(...result.data); pages = result.pagination.totalPages; page += 1;
  } while (page <= pages);
  return buildings;
}

const inputClass = "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm";
export default function MapPage() {
  const location = useLocation();
  const [buildings, setBuildings] = useState([]), [buildingsError, setBuildingsError] = useState("");
  const [buildingLoading, setBuildingLoading] = useState(true);
  const [selectedCode, setSelectedCode] = useState(() => new URLSearchParams(window.location.search).get("building") || "");
  const [buildingSearch, setBuildingSearch] = useState("");
  const selectBuilding = useCallback((code) => { setSelectedCode(code); setPage(1); }, []);
  const [form, setForm] = useState({ lat: "", lng: "", radiusKm: "3", label: "" });
  const [criteria, setCriteria] = useState(null), [page, setPage] = useState(1), [result, setResult] = useState(null);
  useEffect(() => {
    setSelectedCode(new URLSearchParams(location.search).get("building") || "");
    setCriteria(null);
    setPage(1);
  }, [location.search]);
  const [loading, setLoading] = useState(true), [error, setError] = useState(""), [retry, setRetry] = useState(0);
  const [saved, setSaved] = useState(readSavedRooms), [saveMessage, setSaveMessage] = useState("");
  function toggleSaved(id) {
    const next = saved.includes(id) ? saved.filter((value) => value !== id) : [...saved, id];
    setSaved(next);
    try { localStorage.setItem("unihome:saved-rooms", JSON.stringify(next)); setSaveMessage(next.includes(id) ? "Đã lưu phòng yêu thích." : "Đã bỏ lưu phòng."); }
    catch { setSaveMessage("Đã cập nhật trong phiên này; trình duyệt không cho phép lưu lâu dài."); }
  }
  useEffect(() => {
    document.title = "Bản đồ & tìm phòng theo bán kính | UniHome";
    const controller = new AbortController();
    setBuildingLoading(true);
    loadBuildings(controller.signal).then(setBuildings).catch((err) => { if (!controller.signal.aborted) setBuildingsError(err.message); }).finally(() => { if (!controller.signal.aborted) setBuildingLoading(false); });
    return () => controller.abort();
  }, [retry]);
  useEffect(() => {
    const controller = new AbortController(); setLoading(true); setError(""); setResult(null);
    const query = new URLSearchParams({ limit: "12", page: String(page), trangThai: "con_trong", sort: "giaThue" });
    if (selectedCode) query.set("maCoSo", selectedCode);
    if (criteria) for (const key of ["lat", "lng", "radiusKm"]) query.set(key, criteria[key]);
    adminRequest(`/rooms?${query}`, { signal: controller.signal }).then(setResult).catch((err) => { if (!controller.signal.aborted) setError(err.message); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [criteria, page, retry, selectedCode]);
  const byCode = useMemo(() => new Map(buildings.map((building) => [building.maCoSo, building])), [buildings]);
  const rooms = useMemo(() => (result?.data || []).map((room) => ({ ...room, building: byCode.get(room.maCoSo) })), [result, byCode]);
  const selected = byCode.get(selectedCode);
  const filteredBuildings = useMemo(() => buildings.filter((building) => `${building.tenCoSo} ${building.diaChi} ${building.maCoSo}`.toLocaleLowerCase("vi").includes(buildingSearch.toLocaleLowerCase("vi"))), [buildings, buildingSearch]);
  const center = useMemo(() => criteria ? [Number(criteria.lat), Number(criteria.lng)] : null, [criteria]);
  function pick([lat, lng]) { setForm((current) => ({ ...current, lat: lat.toFixed(6), lng: lng.toFixed(6) })); }
  function search(event) { event.preventDefault(); setCriteria({ ...form }); setSelectedCode(""); setPage(1); }
  return <main className="w-full flex-1">
    <section className="unihome-explorer" aria-label="Khám phá cơ sở UniHome">
      <aside className="unihome-explorer-sidebar">
        <div className="border-b border-slate-100 p-5">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-600">UniHome · Cơ sở cho thuê</p>
          <h1 className="text-xl font-bold text-slate-800">Khám phá cơ sở UniHome</h1>
          <p className="mt-2 text-xs leading-5 text-slate-500">Chọn tòa nhà để xem vị trí và phòng còn trống.</p>
          <input aria-label="Tìm cơ sở UniHome" placeholder="Tìm tên cơ sở, địa chỉ…" value={buildingSearch} onChange={(event) => setBuildingSearch(event.target.value)} className="mt-4 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs outline-none focus:border-sky-500" />
          <div className="mt-3 flex items-center justify-between text-xs"><span className="text-slate-500">{buildings.length} cơ sở UniHome</span><button type="button" onClick={() => { setSelectedCode(""); setCriteria(null); setPage(1); }} className="font-medium text-sky-700 hover:underline">Xem tất cả</button></div>
        </div>
        <div className="unihome-building-list" aria-label="Danh sách cơ sở UniHome">
          {filteredBuildings.map((building) => {
            const position = buildingPosition(building);
            return <button key={building._id} type="button" aria-pressed={selectedCode === building.maCoSo} onClick={() => selectBuilding(building.maCoSo)} className={`unihome-building-card ${selectedCode === building.maCoSo ? "is-selected" : ""}`}>
              <span className="unihome-building-art" aria-hidden="true"><svg viewBox="0 0 80 80" fill="none"><path d="M17 68V22l25-10v56M42 29h20v39M10 69h60" stroke="currentColor" strokeWidth="3" strokeLinejoin="round"/><path d="M25 29h8m-8 10h8m-8 10h8m-8 10h8m17-19h5m-5 10h5m-5 10h5" stroke="currentColor" strokeWidth="3"/></svg><span>{building.maCoSo}</span></span>
              <span className="min-w-0 flex-1 py-1"><strong className="block text-[13px] leading-5 text-slate-800">{building.tenCoSo}</strong><span className="mt-1 block text-[11px] leading-5 text-slate-500">{building.diaChi}</span><span className="mt-2 block text-[10px] text-slate-400">{position ? `${position[0].toFixed(5)}, ${position[1].toFixed(5)}` : "Chưa cập nhật tọa độ"}</span><span className="mt-2 block text-right text-[11px] font-semibold text-sky-600">Xem phòng →</span></span>
            </button>;
          })}
          {buildings.length > 0 && !filteredBuildings.length && <p className="p-3 text-xs text-slate-500">Không có cơ sở phù hợp.</p>}
          {!buildings.length && !buildingsError && <p role="status" className="p-3 text-xs text-slate-500">{buildingLoading ? "Đang tải cơ sở…" : "Chưa có dữ liệu cơ sở."}</p>}
        </div>
      </aside>
      <div className="unihome-explorer-map">
        <BuildingMap buildings={buildings} rooms={rooms} center={center} radiusKm={Number(criteria?.radiusKm)} onPick={pick} labels selectedCode={selectedCode} onSelect={selectBuilding} className="h-full min-h-[440px]" />
        <div className="pointer-events-none absolute top-4 right-4 z-[400] max-w-[240px] rounded-xl border border-white/70 bg-white/95 px-4 py-3 shadow-sm"><p className="text-xs font-semibold text-slate-800">{selected?.tenCoSo || "Các cơ sở UniHome"}</p><p className="mt-1 text-[10px] leading-4 text-slate-500">{selected ? selected.diaChi : "Vị trí tòa nhà theo tọa độ đã lưu"}</p></div>
      </div>
    </section>
    <section className="mx-auto max-w-[1440px] space-y-5 px-4 py-6 lg:px-8" aria-label="Phòng tại cơ sở">
    <h2 className="text-xl font-bold">{selected ? `Phòng tại ${selected.tenCoSo}` : "Phòng còn trống tại UniHome"}</h2>
    <details className="rounded-xl border border-slate-200 bg-white p-4"><summary className="cursor-pointer text-sm font-medium text-sky-800">Tìm phòng theo bán kính quanh trường học / nơi làm việc</summary><p className="mt-3 text-xs text-slate-500">Bấm một điểm trên bản đồ hoặc nhập tọa độ bên dưới. Khoảng cách tính theo đường chim bay.</p>
    <form onSubmit={search} className="grid items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-5">
      <label className="text-xs">Tên điểm (tùy chọn)<input className={inputClass} value={form.label} placeholder="Trường học / nơi làm việc" onChange={(e) => setForm({ ...form, label: e.target.value })} /></label>
      <label className="text-xs">Vĩ độ<input required type="number" step="any" min="-90" max="90" className={inputClass} value={form.lat} onChange={(e) => setForm({ ...form, lat: e.target.value })} /></label>
      <label className="text-xs">Kinh độ<input required type="number" step="any" min="-180" max="180" className={inputClass} value={form.lng} onChange={(e) => setForm({ ...form, lng: e.target.value })} /></label>
      <label className="text-xs">Bán kính (km)<input required type="number" step="0.1" min="0.1" max="100" className={inputClass} value={form.radiusKm} onChange={(e) => setForm({ ...form, radiusKm: e.target.value })} /></label>
      <button className="rounded-lg bg-sky-700 px-4 py-2.5 text-sm font-semibold text-white">Tìm quanh điểm này</button>
    </form>
    </details>
    {(error || buildingsError) && <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error || buildingsError} <button type="button" className="underline" onClick={() => { setBuildingsError(""); setRetry(retry + 1); }}>Thử lại</button></div>}
    <div className="flex flex-wrap items-center justify-between gap-3"><p role="status" className="text-sm text-slate-600">{loading ? "Đang tìm phòng…" : `${result?.pagination.total ?? 0} phòng còn trống${criteria ? ` trong ${criteria.radiusKm} km quanh ${criteria.label || "điểm đã chọn"}` : ""}`}. Khoảng cách tính theo đường chim bay.</p>{criteria && <button type="button" onClick={() => { setCriteria(null); setPage(1); }} className="text-sm text-sky-700 underline">Xóa bộ lọc bán kính</button>}</div>
    <p className="text-xs text-slate-500">Bản đồ hiển thị tất cả cơ sở UniHome có tọa độ đã lưu. {buildings.filter((building) => !buildingPosition(building)).length > 0 && "Một số tòa nhà chưa có tọa độ nên chưa hiển thị trên bản đồ."}</p>
    {!loading && result?.pagination.total === 0 && <p className="rounded-xl bg-slate-50 p-5 text-sm">Không tìm thấy phòng. Hãy tăng bán kính hoặc chọn điểm khác.</p>}
    {saveMessage && <p role="status" className="text-xs text-sky-700">{saveMessage}</p>}
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{rooms.map((room) => <RoomCard key={room._id} room={room} saved={saved.includes(room._id)} onSave={() => toggleSaved(room._id)} />)}</div>
    {result?.pagination.totalPages > 1 && <nav aria-label="Phân trang phòng" className="flex items-center justify-center gap-4"><button disabled={loading || page <= 1} onClick={() => setPage(page - 1)} className="rounded border px-3 py-2 disabled:opacity-40">Trước</button><span className="text-sm">{page} / {result.pagination.totalPages}</span><button disabled={loading || page >= result.pagination.totalPages} onClick={() => setPage(page + 1)} className="rounded border px-3 py-2 disabled:opacity-40">Sau</button></nav>}
    </section>
  </main>;
}

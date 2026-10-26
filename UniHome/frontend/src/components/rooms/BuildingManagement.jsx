import { useEffect, useMemo, useRef, useState } from "react";
import { adminRequest } from "../../services/adminService";
import BuildingMap from "./BuildingMap";

const button = "rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium hover:bg-slate-50 disabled:opacity-50";
const input = "mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-sky-500";
const numericFields = [["soTang", "Số tầng", 1], ["soPhongMoiTang", "Số phòng mỗi tầng", 1], ["tongSoPhong", "Tổng số phòng (khai báo)", 1], ["tienCocThang", "Tiền cọc (số tháng)", "any"]];

function BuildingEditor({ building, onClose, onSaved }) {
  const dialog = useRef(null);
  const [form, setForm] = useState(() => ({
    maCoSo: building?.maCoSo || "", tenCoSo: building?.tenCoSo || "", diaChi: building?.diaChi || "", khuVuc: building?.khuVuc || "",
    lat: building?.toaDo?.coordinates?.[1] ?? "", lng: building?.toaDo?.coordinates?.[0] ?? "",
    ...Object.fromEntries(numericFields.map(([key]) => [key, building?.[key] ?? ""])),
    noiQuy: (building?.noiQuy || []).join("\n")
  }));
  const [saving, setSaving] = useState(false), [error, setError] = useState("");
  useEffect(() => { const element = dialog.current; element.showModal(); return () => element.close(); }, []);
  const change = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const preview = useMemo(() => form.lat !== "" && form.lng !== "" && Number.isFinite(Number(form.lat)) && Number.isFinite(Number(form.lng)) && Math.abs(Number(form.lat)) <= 90 && Math.abs(Number(form.lng)) <= 180
    ? [{ tenCoSo: form.tenCoSo || "Cơ sở mới", diaChi: form.diaChi, toaDo: { type: "Point", coordinates: [Number(form.lng), Number(form.lat)] } }] : [], [form.lat, form.lng, form.tenCoSo, form.diaChi]);
  async function submit(event) {
    event.preventDefault(); if (saving) return;
    if (!preview.length) { setError("Vui lòng nhập tọa độ hợp lệ."); return; }
    const body = { tenCoSo: form.tenCoSo.trim(), diaChi: form.diaChi.trim(), khuVuc: form.khuVuc.trim(), toaDo: preview[0].toaDo,
      noiQuy: form.noiQuy.split("\n").map((value) => value.trim()).filter(Boolean) };
    if (!building) body.maCoSo = form.maCoSo.trim();
    for (const [key] of numericFields) if (form[key] !== "") body[key] = Number(form[key]);
    if (!body.tenCoSo || !body.diaChi || !body.khuVuc || (!building && !body.maCoSo)) { setError("Vui lòng điền đầy đủ thông tin bắt buộc."); return; }
    setSaving(true); setError("");
    try { await adminRequest(building ? `/buildings/${building._id}` : "/buildings", { method: building ? "PATCH" : "POST", body: JSON.stringify(body) }); onSaved(); }
    catch (err) { setError(err.message); } finally { setSaving(false); }
  }
  return <dialog ref={dialog} aria-labelledby="building-editor-title" onCancel={(event) => { event.preventDefault(); if (!saving) onClose(); }} className="fixed inset-0 m-auto max-h-[90vh] w-[calc(100%-2rem)] max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 text-slate-800 shadow-xl backdrop:bg-slate-950/40">
    <h2 id="building-editor-title" className="text-xl font-bold">{building ? "Chỉnh sửa cơ sở" : "Thêm cơ sở mới"}</h2>
    <p className="mt-2 text-xs leading-5 text-slate-500">Thông tin và tọa độ cơ sở được dùng cho các phòng thuộc tòa nhà. Các trường có * là bắt buộc.</p>
    <form onSubmit={submit} className="mt-5 space-y-4"><fieldset disabled={saving} className="grid gap-4 sm:grid-cols-2">
      <label className="text-xs">Mã cơ sở *<input required disabled={!!building} maxLength={100} className={`${input} disabled:bg-slate-100`} value={form.maCoSo} onChange={(event) => change("maCoSo", event.target.value)} />{building && <span className="mt-1 block text-slate-500">Mã cơ sở được giữ cố định để liên kết với phòng.</span>}</label>
      <label className="text-xs">Tên cơ sở *<input required maxLength={300} className={input} value={form.tenCoSo} onChange={(event) => change("tenCoSo", event.target.value)} /></label>
      <label className="text-xs sm:col-span-2">Địa chỉ *<input required maxLength={300} className={input} value={form.diaChi} onChange={(event) => change("diaChi", event.target.value)} /></label>
      <label className="text-xs sm:col-span-2">Khu vực *<input required maxLength={300} className={input} placeholder="Ví dụ: Cầu Giấy" value={form.khuVuc} onChange={(event) => change("khuVuc", event.target.value)} /></label>
      {numericFields.map(([key, label, step]) => <label key={key} className="text-xs">{label}{key === "soTang" ? " *" : ""}<input required={key === "soTang"} type="number" min="0" step={step} className={input} value={form[key]} onChange={(event) => change(key, event.target.value)} /></label>)}
      <label className="text-xs">Vĩ độ *<input required type="number" min="-90" max="90" step="any" className={input} value={form.lat} onChange={(event) => change("lat", event.target.value)} /></label>
      <label className="text-xs">Kinh độ *<input required type="number" min="-180" max="180" step="any" className={input} value={form.lng} onChange={(event) => change("lng", event.target.value)} /></label>
      <details className="sm:col-span-2"><summary className="cursor-pointer text-xs font-medium text-sky-700">Chọn vị trí trên bản đồ</summary><p className="my-2 text-xs text-slate-500">Bấm một điểm để điền tọa độ hoặc nhập thủ công phía trên.</p><BuildingMap buildings={preview} onPick={saving ? undefined : ([lat, lng]) => setForm((current) => ({ ...current, lat: lat.toFixed(6), lng: lng.toFixed(6) }))} /></details>
      <label className="text-xs sm:col-span-2">Nội quy (mỗi dòng một mục)<textarea rows={4} className={input} value={form.noiQuy} onChange={(event) => change("noiQuy", event.target.value)} /></label>
    </fieldset>{error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-xs text-red-700">{error}</p>}
    <div className="flex justify-end gap-2 border-t border-slate-100 pt-4"><button type="button" disabled={saving} onClick={onClose} className={button}>Hủy bỏ</button><button disabled={saving} className="rounded-lg bg-sky-700 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">{saving ? "Đang lưu…" : "Lưu cơ sở"}</button></div></form>
  </dialog>;
}

function DeleteBuilding({ building, onClose, onDeleted }) {
  const dialog = useRef(null); const [busy, setBusy] = useState(false), [error, setError] = useState("");
  useEffect(() => { const element = dialog.current; element.showModal(); return () => element.close(); }, []);
  async function remove() {
    if (busy) return; setBusy(true); setError("");
    try { await adminRequest(`/buildings/${building._id}`, { method: "DELETE" }); onDeleted(); }
    catch (err) { setError(err.status === 409 ? "Cơ sở đang có phòng trực thuộc nên không thể xóa. Hãy chuyển các phòng sang cơ sở khác trước." : err.message); } finally { setBusy(false); }
  }
  return <dialog ref={dialog} aria-labelledby="delete-building-title" onCancel={(event) => { event.preventDefault(); if (!busy) onClose(); }} className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl backdrop:bg-slate-950/40"><h2 id="delete-building-title" className="text-lg font-bold">Xóa cơ sở?</h2><p className="mt-3 text-sm leading-6">Bạn có muốn xóa <strong>{building.tenCoSo} ({building.maCoSo})</strong>?</p><p className="mt-2 text-xs leading-5 text-slate-500">Chỉ có thể xóa cơ sở không có phòng trực thuộc. Thao tác này không thể hoàn tác.</p>{error && <p role="alert" className="mt-3 rounded bg-red-50 p-3 text-xs text-red-700">{error}</p>}<div className="mt-5 flex justify-end gap-2"><button disabled={busy} type="button" onClick={onClose} className={button}>Hủy bỏ</button><button disabled={busy} type="button" onClick={remove} className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">{busy ? "Đang xóa…" : "Xác nhận xóa"}</button></div></dialog>;
}

export default function BuildingManagement({ query = "", onChanged }) {
  const [result, setResult] = useState(null), [page, setPage] = useState(1), [retry, setRetry] = useState(0);
  const [loading, setLoading] = useState(true), [error, setError] = useState(""), [message, setMessage] = useState("");
  const [editor, setEditor] = useState(null), [deleting, setDeleting] = useState(null);
  useEffect(() => { setPage(1); }, [query]);
  useEffect(() => {
    const controller = new AbortController(); setLoading(true); setError("");
    const params = new URLSearchParams({ limit: "10", page: String(page), sort: "maCoSo" }); if (query) params.set("q", query);
    adminRequest(`/buildings?${params}`, { signal: controller.signal }).then((data) => {
      if (page > Math.max(1, data.pagination.totalPages)) setPage(Math.max(1, data.pagination.totalPages)); else setResult(data);
    }).catch((err) => { if (!controller.signal.aborted) setError(err.message); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [query, page, retry]);
  function changed(text) { setEditor(null); setDeleting(null); setMessage(text); setRetry((value) => value + 1); onChanged(); }
  return <>
    <div className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-xl font-bold sm:text-2xl">Quản lý tòa nhà</h1><p className="mt-2 text-xs leading-5 text-slate-500">Thêm, chỉnh sửa thông tin, tọa độ và xóa các cơ sở UniHome.</p></div><button type="button" onClick={() => setEditor({ building: null })} className="rounded-lg bg-sky-700 px-4 py-2.5 text-xs font-semibold text-white">+ Thêm cơ sở mới</button></div>
    {message && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-xs text-emerald-700">{message}</p>}
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="flex items-center justify-between gap-3 p-5"><h2 className="text-sm font-semibold">Danh sách cơ sở ({result?.pagination.total ?? "…"})</h2><button type="button" disabled={loading} onClick={() => setRetry((value) => value + 1)} className={button}>Làm mới</button></div>
      {loading ? <p role="status" className="p-6 text-sm text-slate-500">Đang tải cơ sở…</p> : error ? <p role="alert" className="p-6 text-sm text-red-700">{error}</p> : !result?.data.length ? <p className="p-6 text-sm text-slate-500">Không có cơ sở phù hợp.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[800px] text-left text-xs"><thead className="border-y border-slate-100 bg-slate-50 text-[10px] text-slate-500"><tr>{["MÃ CƠ SỞ", "TÊN CƠ SỞ / ĐỊA CHỈ", "KHU VỰC", "SỐ TẦNG", "TỌA ĐỘ (VĨ ĐỘ, KINH ĐỘ)", "THAO TÁC"].map((label) => <th key={label} className="px-4 py-3 font-medium">{label}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{result.data.map((building) => <tr key={building._id} className="hover:bg-slate-50"><td className="px-4 py-4 font-semibold text-sky-700">{building.maCoSo}</td><td className="max-w-80 px-4 py-4"><strong>{building.tenCoSo}</strong><p className="mt-1 text-[11px] leading-5 text-slate-500">{building.diaChi}</p></td><td className="px-4 py-4">{building.khuVuc}</td><td className="px-4 py-4">{building.soTang}</td><td className="px-4 py-4 text-[11px] text-slate-500">{building.toaDo?.coordinates?.length === 2 ? `${building.toaDo.coordinates[1]}, ${building.toaDo.coordinates[0]}` : "Chưa cập nhật"}</td><td className="px-4 py-4"><div className="flex gap-2"><button type="button" onClick={() => setEditor({ building })} aria-label={`Sửa ${building.tenCoSo}`} className={button}>Sửa</button><button type="button" onClick={() => setDeleting(building)} aria-label={`Xóa ${building.tenCoSo}`} className={`${button} text-red-600`}>Xóa</button></div></td></tr>)}</tbody></table></div>}
      <div className="flex items-center justify-between gap-3 border-t border-slate-100 p-4 text-xs"><span>{result?.pagination.total ?? 0} cơ sở</span><div className="flex items-center gap-3"><button type="button" disabled={loading || page <= 1} onClick={() => setPage(page - 1)} className={button}>Trang trước</button><span>{page} / {Math.max(1, result?.pagination.totalPages || 1)}</span><button type="button" disabled={loading || page >= (result?.pagination.totalPages || 1)} onClick={() => setPage(page + 1)} className={button}>Trang sau</button></div></div>
    </section>
    {editor && <BuildingEditor building={editor.building} onClose={() => setEditor(null)} onSaved={() => changed("Đã lưu cơ sở thành công.")} />}
    {deleting && <DeleteBuilding building={deleting} onClose={() => setDeleting(null)} onDeleted={() => changed("Đã xóa cơ sở thành công.")} />}
  </>;
}

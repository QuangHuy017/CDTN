import { useEffect, useState } from "react";
import { useFavoriteAccess } from "../../contexts/FavoriteAccess";

export function vacancyDate(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value.split("-").reverse().join("/") : "Đang cập nhật";
}

export default function RoomInterest({ room, compact = false }) {
  const { signedIn, requestLogin } = useFavoriteAccess();
  const [registered, setRegistered] = useState(false), [checking, setChecking] = useState(false), [busy, setBusy] = useState(false);
  const [error, setError] = useState(""), [message, setMessage] = useState("");
  useEffect(() => {
    const controller = new AbortController(); setRegistered(false); setError(""); setMessage("");
    if (!signedIn || room.trangThai !== "sap_trong") { setChecking(false); return () => controller.abort(); }
    setChecking(true);
    fetch(`/api/rooms/${room._id}/interest`, { credentials: "same-origin", signal: controller.signal }).then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.message); return data; }).then((data) => setRegistered(data.registered)).catch((err) => { if (!controller.signal.aborted) setError(err.message || "Chưa kiểm tra được đăng ký."); }).finally(() => { if (!controller.signal.aborted) setChecking(false); });
    return () => controller.abort();
  }, [room._id, room.trangThai, signedIn]);
  if (room.trangThai !== "sap_trong") return null;
  async function toggle() {
    if (!signedIn) { requestLogin(); return; }
    if (busy || checking) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch(`/api/rooms/${room._id}/interest`, { method: registered ? "DELETE" : "POST", credentials: "same-origin" });
      const data = await response.json(); if (!response.ok) throw new Error(data.message);
      setRegistered(data.registered); setMessage(data.message);
    } catch (err) { setError(err.message || "Không thể đăng ký. Vui lòng thử lại."); } finally { setBusy(false); }
  }
  return <div className={`rounded-xl border border-amber-200 bg-amber-50 ${compact ? "mt-3 p-3" : "my-5 p-4"}`}>
    <p className="text-xs font-semibold text-amber-900">Dự kiến trống: {vacancyDate(room.ngayDuKienTrong)}</p>
    <button type="button" disabled={busy || checking} onClick={toggle} aria-pressed={registered} className={`mt-3 w-full rounded-lg border px-3 py-2 text-xs font-semibold disabled:opacity-50 ${registered ? "border-amber-300 bg-white text-amber-900" : "border-amber-600 bg-amber-600 text-white hover:bg-amber-700"}`}>{busy ? "Đang xử lý…" : checking ? "Đang kiểm tra…" : registered ? "Đã đăng ký quan tâm · Hủy" : "Đăng ký quan tâm"}</button>
    {error && <p role="alert" className="mt-2 text-xs text-red-700">{error}</p>}{message && <p role="status" className="mt-2 text-xs text-emerald-800">{message}</p>}
  </div>;
}

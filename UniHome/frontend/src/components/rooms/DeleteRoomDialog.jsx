import { useEffect, useRef, useState } from "react";
import { adminRequest } from "../../services/adminService";

export default function DeleteRoomDialog({ room, onClose, onDeleted }) {
  const dialog = useRef(null);
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  useEffect(() => { const element = dialog.current; element.showModal(); return () => element.close(); }, []);
  async function remove() {
    if (busy) return; setBusy(true); setError("");
    try { await adminRequest(`/rooms/${room._id}`, { method: "DELETE" }); onDeleted(); }
    catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  return <dialog ref={dialog} aria-labelledby="delete-room-title" onCancel={(event) => { event.preventDefault(); if (!busy) onClose(); }} className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-md rounded-xl border border-slate-200 bg-white p-6 text-slate-800 shadow-xl backdrop:bg-slate-950/40">
    <h2 id="delete-room-title" className="text-lg font-bold">Xóa phòng?</h2>
    <p className="mt-3 text-sm leading-6">Bạn có muốn xóa <strong>{room.tenPhong}</strong> ({room.maPhong})?</p>
    <p className="mt-2 text-xs leading-5 text-slate-500">Phòng sẽ bị xóa khỏi danh sách và bản đồ tìm phòng. Thao tác này không thể hoàn tác.</p>
    {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-xs text-red-700">{error}</p>}
    <div className="mt-5 flex justify-end gap-2"><button disabled={busy} type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-xs disabled:opacity-50">Hủy bỏ</button><button disabled={busy} type="button" onClick={remove} className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">{busy ? "Đang xóa…" : "Xác nhận xóa"}</button></div>
  </dialog>;
}

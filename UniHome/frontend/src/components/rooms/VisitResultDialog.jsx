import { useEffect, useRef, useState } from "react";
import { adminRequest } from "../../services/adminService";
import { getRoomDetails } from "../../services/roomService";
import { visitOutcomes } from "./VisitResultSummary";

export default function VisitResultDialog({ item, onClose, onSaved }) {
  const dialog = useRef(null);
  const [attendance, setAttendance] = useState("attended"), [outcome, setOutcome] = useState("considering");
  const [note, setNote] = useState(item.managerNote || ""), [cancel, setCancel] = useState(false);
  const [saving, setSaving] = useState(false), [error, setError] = useState("");
  const [room, setRoom] = useState(null);
  useEffect(() => {
    const element = dialog.current; element.showModal(); const controller = new AbortController();
    getRoomDetails(item.roomId, controller.signal).then(setRoom).catch(() => {});
    return () => { controller.abort(); element.close(); };
  }, [item.roomId]);
  async function submit(event) {
    event.preventDefault(); if (saving) return; setSaving(true); setError("");
    try {
      const body = { status: cancel ? "cancelled" : "completed", managerNote: note, ...(!cancel ? { visitResult: { attendance, ...(attendance === "attended" ? { outcome } : {}) } } : {}) };
      await adminRequest(`/contact-requests/${item._id}/status`, { method: "PATCH", body: JSON.stringify(body) }); onSaved();
    } catch (err) { setError(err.message); } finally { setSaving(false); }
  }
  const visitDate = new Date(item.scheduledAt);
  const schedule = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Asia/Ho_Chi_Minh" }).format(visitDate) + " - " + new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "Asia/Ho_Chi_Minh" }).format(visitDate);
  const radio = "size-5 shrink-0 accent-slate-900";
  return <dialog ref={dialog} aria-labelledby="visit-result-title" onCancel={(event) => { event.preventDefault(); if (!saving) onClose(); }} className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-xl sm:p-7 backdrop:bg-slate-950/40">
    <div className="flex items-start justify-between gap-4"><div><h2 id="visit-result-title" className="text-lg font-semibold">Cập nhật kết quả xem phòng</h2><p className="mt-1 text-xs text-slate-500">Yêu cầu #YC-{String(item._id).padStart(3, "0")}</p></div><span className="shrink-0 rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-semibold text-emerald-700">Đã xác nhận</span></div>
    <dl className="my-7 space-y-3 text-sm">{[["Khách hàng", item.name], ["Phòng", room?.soPhong ? `Phòng ${room.soPhong}` : item.room?.name || item.room?.code || item.roomId], ["Tòa nhà", room?.building?.tenCoSo || item.room?.address || "Đang cập nhật"], ["Lịch xem", schedule]].map(([label, value]) => <div key={label} className="flex justify-between gap-4"><dt className="shrink-0 text-slate-500">{label}</dt><dd className="text-right font-medium">{value}</dd></div>)}</dl>
    <form onSubmit={submit}><fieldset disabled={saving} className="space-y-5">
      {cancel ? <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">Bạn đang hủy lịch xem phòng này. Kết quả xem phòng sẽ không được ghi nhận.</div> : <>
        <fieldset><legend className="mb-3 text-sm font-semibold text-slate-600">1. Khách có đến xem phòng không?</legend>{[["attended", "Đã đến xem phòng"], ["no_show", "Không đến xem phòng"]].map(([value, label]) => <label key={value} className="mb-3 flex cursor-pointer items-center gap-3 text-sm"><input required type="radio" name="attendance" value={value} checked={attendance === value} onChange={() => setAttendance(value)} className={radio} />{label}</label>)}</fieldset>
        <fieldset disabled={attendance !== "attended"} className={`border-t border-slate-100 pt-5 ${attendance !== "attended" ? "opacity-40" : ""}`}><legend className="mb-3 text-sm font-semibold text-slate-600">2. Kết quả sau khi xem phòng</legend>{Object.entries(visitOutcomes).map(([value, label]) => <label key={value} className="mb-3 flex cursor-pointer items-center gap-3 text-sm"><input required={attendance === "attended"} type="radio" name="outcome" value={value} checked={attendance === "attended" && outcome === value} onChange={() => setOutcome(value)} className={radio} />{label}</label>)}{attendance !== "attended" && <p className="text-xs">Không áp dụng khi khách không đến.</p>}</fieldset>
      </>}
      <label className="block border-t border-slate-100 pt-5 text-sm font-medium text-slate-600">Ghi chú gửi người tìm phòng<textarea rows={3} maxLength={1000} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Thông tin bổ sung sau buổi xem phòng…" className="mt-3 w-full rounded-lg border border-slate-200 p-3 text-sm font-normal outline-none focus:border-sky-500" /></label>
    </fieldset>{error && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-xs text-red-700">{error}</p>}
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5"><button type="button" disabled={saving} onClick={() => setCancel(!cancel)} className="text-xs text-red-600 underline disabled:opacity-50">{cancel ? "Quay lại cập nhật kết quả" : "Hủy lịch xem phòng"}</button><div className="flex gap-2"><button type="button" disabled={saving} onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2.5 text-xs disabled:opacity-50">Đóng</button><button disabled={saving} className={`rounded-lg px-5 py-2.5 text-xs font-semibold text-white disabled:opacity-50 ${cancel ? "bg-red-600" : "bg-slate-900 hover:bg-slate-800"}`}>{saving ? "Đang lưu…" : cancel ? "Xác nhận hủy lịch" : "Hoàn thành"}</button></div></div>
    </form>
  </dialog>;
}

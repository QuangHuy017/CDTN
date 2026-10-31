import { useState } from "react";
import { formatRent } from "./RoomCard";
import { Link } from "react-router-dom";
import { sendContactRequest } from "../../services/contactService";

export function createVisitCalendar({ room, name, phone, date, time, note }) {
  const escape = (text) => String(text).replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
  const start = new Date(`${date}T${time}:00+07:00`);
  const end = new Date(start.getTime() + 30 * 60000);
  const timestamp = (value) => value.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//UniHome//Room Visit//VI", "BEGIN:VEVENT", `UID:${crypto.randomUUID()}@unihome`, `DTSTAMP:${timestamp(new Date())}`, `DTSTART:${timestamp(start)}`, `DTEND:${timestamp(end)}`, "STATUS:TENTATIVE", `SUMMARY:${escape(`Lịch dự kiến xem phòng ${room.maPhong}`)}`, `LOCATION:${escape(room.building?.diaChi || room.maCoSo)}`, `DESCRIPTION:${escape(`Chưa được cơ sở xác nhận.\nHọ tên: ${name}\nĐiện thoại: ${phone}\n${note || ""}`)}`, "END:VEVENT", "END:VCALENDAR", ""].join("\r\n");
}

export default function RoomVisitCard({ room }) {
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");
  const [sending, setSending] = useState(false);
  const [loginRequired, setLoginRequired] = useState(false);
  const unavailable = room.trangThai === "da_thue" || message === "Phòng đã được thuê. Vui lòng chọn phòng khác.";
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  async function saveVisit(event) {
    event.preventDefault();
    if (sending || unavailable) return;
    const values = Object.fromEntries(new FormData(event.currentTarget));
    if (new Date(`${values.date}T${values.time}:00+07:00`) <= new Date()) { setMessageType("error"); setMessage("Hãy chọn thời gian trong tương lai."); return; }
    setSending(true); setMessage(""); setLoginRequired(false);
    try {
      await sendContactRequest({ ...values, roomId: room._id });
      setMessageType("success");
      setMessage("Đã gửi yêu cầu xem phòng. Bạn có thể theo dõi phản hồi trong mục Yêu cầu liên hệ đã gửi.");
    } catch (error) { setMessageType("error"); setMessage(error.message); setLoginRequired(error.status === 401); }
    finally { setSending(false); }
  }
  const inputClass = "mt-1.5 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50";
  return (
    <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 lg:p-6">
        <p className="text-[10px] tracking-widest text-slate-400">GIÁ THUÊ NIÊM YẾT</p>
        <p className="mt-2 text-[32px] leading-none font-bold tracking-tight text-blue-600">{formatRent(room.giaThue)} <span className="text-xs font-normal tracking-normal text-slate-500">đ/tháng</span></p>
        <p className="mt-3 text-[10px] text-emerald-600">Thông tin chi phí theo cơ sở UniHome</p>
        <div id="visit-room" className="mt-5 scroll-mt-6 border-t border-slate-100 pt-5"><h2 className="text-sm font-bold">▦ Lên lịch xem phòng trực tiếp</h2><p className="mt-2 text-[11px] leading-relaxed text-slate-500">Gửi yêu cầu tới Ban quản lý UniHome. Vui lòng chờ xác nhận lịch trước khi đến.</p>
          {unavailable && <div role="alert" className="mt-4 flex items-start gap-3 rounded-xl border border-red-200 border-l-4 border-l-red-500 bg-red-50 p-4"><span aria-hidden="true" className="grid size-7 shrink-0 place-items-center rounded-full bg-red-100 text-base font-bold text-red-600">!</span><div><p className="text-sm font-bold text-red-800">Phòng đã được thuê</p><p className="mt-1 text-xs leading-5 text-red-700">Hiện không nhận yêu cầu xem phòng này. Vui lòng chọn phòng khác.</p><Link to="/?page=rooms" className="mt-3 inline-flex rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700">Tìm phòng còn trống →</Link></div></div>}
          <form className="mt-4 space-y-3 text-xs" onSubmit={saveVisit}>
            <label className="block">Họ và tên <span className="text-red-500">*</span><input name="name" autoComplete="name" placeholder="Ví dụ: Nguyễn Văn Nam" maxLength={100} required className={inputClass} /></label>
            <label className="block">Số điện thoại / Zalo <span className="text-red-500">*</span><input name="phone" type="tel" autoComplete="tel" placeholder="0912 345 678" required pattern="[+]?[0-9\s]{8,20}" className={inputClass} /></label>
            <div className="grid grid-cols-2 gap-3"><label>Ngày xem<input name="date" type="date" min={today} required className={inputClass} /></label><label>Khung giờ<select name="time" className={inputClass}><option value="09:00">09:00 - 09:30</option><option value="10:00">10:00 - 10:30</option><option value="14:00">14:00 - 14:30</option><option value="16:00">16:00 - 16:30</option><option value="18:00">18:00 - 18:30</option></select></label></div>
            <label className="block">Ghi chú thêm (nếu có)<textarea name="note" maxLength={500} rows={2} placeholder="Thời gian chuyển đến, câu hỏi thêm…" className={`${inputClass} h-auto! resize-y py-2`} /></label>
            <button disabled={sending || unavailable} className="w-full rounded-xl bg-blue-600 px-4 py-3 text-xs font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500">{unavailable ? "Phòng đã được thuê" : sending ? "Đang gửi…" : "Gửi yêu cầu xem phòng"}</button>
            {message && !unavailable && <div role={messageType === "success" ? "status" : "alert"} className={`flex items-start gap-2 rounded-xl border p-3 text-xs leading-5 ${messageType === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"}`}><span aria-hidden="true" className="shrink-0 font-bold">{messageType === "success" ? "✓" : "!"}</span><p>{message}</p></div>}
            {loginRequired ? <Link to="/login" state={{ from: `/rooms/${room._id}#visit-room` }} className="inline-block text-xs text-blue-600 underline">Đăng nhập để gửi yêu cầu</Link> : <Link to="/appointments" className="inline-block text-xs text-blue-600 underline">Xem yêu cầu liên hệ đã gửi</Link>}
          </form>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="text-sm font-bold">Đơn vị quản lý · UniHome</h2><p className="mt-4 font-semibold text-blue-600">{room.building?.tenCoSo || room.maCoSo}</p><p className="mt-2 text-xs leading-relaxed text-slate-500">{room.building?.diaChi || "Địa chỉ đang cập nhật"}</p><p className="mt-4 rounded-lg bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-500">Theo dõi phản hồi của Ban quản lý trong tài khoản của bạn. Yêu cầu xem phòng không phải xác nhận đặt phòng.</p></div>
    </aside>
  );
}

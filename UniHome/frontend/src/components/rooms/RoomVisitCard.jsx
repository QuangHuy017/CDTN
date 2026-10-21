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
  const [sending, setSending] = useState(false);
  const [loginRequired, setLoginRequired] = useState(false);
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  async function saveVisit(event) {
    event.preventDefault();
    if (sending) return;
    const values = Object.fromEntries(new FormData(event.currentTarget));
    if (new Date(`${values.date}T${values.time}:00+07:00`) <= new Date()) { setMessage("Hãy chọn thời gian trong tương lai."); return; }
    setSending(true); setMessage(""); setLoginRequired(false);
    try {
      await sendContactRequest({ ...values, roomId: room._id });
      setMessage("Đã gửi yêu cầu xem phòng. Bạn có thể theo dõi phản hồi trong mục Yêu cầu liên hệ đã gửi.");
    } catch (error) { setMessage(error.message); setLoginRequired(error.status === 401); }
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
          <form className="mt-4 space-y-3 text-xs" onSubmit={saveVisit}>
            <label className="block">Họ và tên <span className="text-red-500">*</span><input name="name" autoComplete="name" placeholder="Ví dụ: Nguyễn Văn Nam" maxLength={100} required className={inputClass} /></label>
            <label className="block">Số điện thoại / Zalo <span className="text-red-500">*</span><input name="phone" type="tel" autoComplete="tel" placeholder="0912 345 678" required pattern="[+]?[0-9\s]{8,20}" className={inputClass} /></label>
            <div className="grid grid-cols-2 gap-3"><label>Ngày xem<input name="date" type="date" min={today} required className={inputClass} /></label><label>Khung giờ<select name="time" className={inputClass}><option value="09:00">09:00 - 09:30</option><option value="10:00">10:00 - 10:30</option><option value="14:00">14:00 - 14:30</option><option value="16:00">16:00 - 16:30</option><option value="18:00">18:00 - 18:30</option></select></label></div>
            <label className="block">Ghi chú thêm (nếu có)<textarea name="note" maxLength={500} rows={2} placeholder="Thời gian chuyển đến, câu hỏi thêm…" className={`${inputClass} h-auto! resize-y py-2`} /></label>
            <button disabled={sending} className="w-full rounded-xl bg-blue-600 px-4 py-3 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50">{sending ? "Đang gửi…" : "Gửi yêu cầu xem phòng"}</button>
            {message && <p role="status" className="text-xs leading-relaxed text-blue-700">{message}</p>}
            {loginRequired ? <Link to="/login" state={{ from: `/rooms/${room._id}#visit-room` }} className="inline-block text-xs text-blue-600 underline">Đăng nhập để gửi yêu cầu</Link> : <Link to="/appointments" className="inline-block text-xs text-blue-600 underline">Xem yêu cầu liên hệ đã gửi</Link>}
          </form>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5"><h2 className="text-sm font-bold">Đơn vị quản lý · UniHome</h2><p className="mt-4 font-semibold text-blue-600">{room.building?.tenCoSo || room.maCoSo}</p><p className="mt-2 text-xs leading-relaxed text-slate-500">{room.building?.diaChi || "Địa chỉ đang cập nhật"}</p><p className="mt-4 rounded-lg bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-500">Theo dõi phản hồi của Ban quản lý trong tài khoản của bạn. Yêu cầu xem phòng không phải xác nhận đặt phòng.</p></div>
    </aside>
  );
}

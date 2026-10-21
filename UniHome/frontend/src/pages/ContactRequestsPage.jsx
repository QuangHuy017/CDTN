import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../components/common/Icon";
import { readSavedRooms } from "../services/savedRooms";
import { getContactRequests, cancelContactRequest } from "../services/contactService";

const statuses = {
  pending: { label: "Đang chờ BQL phản hồi", color: "border-amber-200 bg-amber-50 text-amber-700", icon: "◷" },
  confirmed: { label: "Đã xác nhận lịch", color: "border-emerald-200 bg-emerald-100 text-emerald-800", icon: "●" },
  completed: { label: "Đã hoàn thành xem phòng", color: "border-blue-200 bg-blue-100 text-slate-700", icon: "✓" },
  cancelled: { label: "Đã hủy yêu cầu", color: "border-slate-200 bg-slate-100 text-slate-500", icon: "×" }
};
const formatDate = (value) => new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date(value));

function RequestCard({ item, busy, onCancel }) {
  const [failedImage, setFailedImage] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const status = statuses[item.status] || statuses.pending;
  const cancellable = ["pending", "confirmed"].includes(item.status);
  return <article className="rounded-xl border border-[#e0e7f1] bg-white px-4 py-4 shadow-[0_1px_2px_#182d4810] sm:px-5">
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#edf0f6] pb-3"><div className="flex flex-wrap items-center gap-2 text-[11px]"><span className={`rounded px-2 py-1 font-semibold ${item.status === "completed" || item.status === "cancelled" ? "bg-slate-100 text-slate-500" : "bg-sky-50 text-sky-700"}`}>#YC-{String(item._id).padStart(4, "0")}</span><span className="text-slate-500">• {item.room?.code || `Phòng ${item.roomId}`}</span></div><span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${status.color}`}><span aria-hidden="true">{status.icon} </span>{status.label}</span></div>
    <div className="flex flex-col gap-4 py-4 sm:flex-row">
      <Link to={`/rooms/${item.roomId}`} className="block aspect-[1.5] w-full shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:aspect-auto sm:h-24 sm:w-36">{item.room?.image && !failedImage ? <img src={item.room.image} alt={item.room.name} loading="lazy" onError={() => setFailedImage(true)} className="size-full object-cover" /> : <span className="grid size-full place-items-center text-slate-300"><Icon name="building" className="size-9!" /></span>}</Link>
      <div className="min-w-0 flex-1"><h2><Link to={`/rooms/${item.roomId}`} className="text-[13px] leading-6 font-semibold text-[#18304e] hover:text-sky-700">{item.room?.name || "Thông tin phòng"} ({item.room?.code || item.roomId})</Link></h2><div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[10px] leading-5"><span className={`flex items-center gap-1 ${item.status === "confirmed" ? "font-medium text-sky-700" : "text-slate-600"}`}><Icon name="calendar" className="size-3!" />{item.status === "pending" ? "Thời gian đề xuất: " : "Thời gian xem: "}{formatDate(item.scheduledAt)}</span><span className="flex items-start gap-1 text-slate-500"><Icon name="pin" className="mt-1 size-3! shrink-0" />{item.room?.address}</span></div>
      {item.managerNote ? <div className="mt-3 flex items-start gap-2 rounded-lg border-l-2 border-emerald-600 bg-[#f0f4ff] px-3 py-2.5 text-[11px] leading-5 text-slate-600"><Icon name="document" className="mt-0.5 size-3.5! shrink-0 text-emerald-700" /><p><strong className="font-semibold text-emerald-700">Ghi chú từ BQL: </strong>{item.managerNote}</p></div> : item.note ? <div className="mt-3 flex items-start gap-2 rounded-lg border border-[#e1e8f2] px-3 py-2 text-[11px] leading-5 text-slate-600"><Icon name="document" className="mt-0.5 size-3.5! shrink-0 text-sky-700" /><p><strong className="font-medium">Lời nhắn gửi đi: </strong>“{item.note}”</p></div> : null}
      {item.status === "completed" && <p className="mt-3 rounded-lg bg-[#f0f4ff] px-3 py-2 text-[11px] text-slate-600">Buổi xem phòng đã hoàn thành. Cảm ơn bạn đã sử dụng UniHome.</p>}
      </div>
    </div>
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#edf0f6] pt-3"><p className="text-[10px] leading-5 text-slate-500">{item.status === "pending" ? "Đã gửi yêu cầu · Đang chờ Ban quản lý phản hồi" : item.status === "completed" ? "Đã hoàn thành buổi xem với Ban quản lý" : item.status === "cancelled" ? "Yêu cầu này đã được hủy" : "Đã xác nhận buổi xem phòng"}<span className="block">Gửi lúc {formatDate(item.createdAt)}</span></p><div className="flex flex-wrap gap-2">{cancellable && (confirmCancel ? <><button disabled={busy} type="button" onClick={() => { onCancel(item._id); setConfirmCancel(false); }} className="rounded-lg bg-red-600 px-3 py-2 text-[11px] font-medium text-white disabled:opacity-50">{busy ? "Đang hủy…" : "Xác nhận hủy"}</button><button disabled={busy} type="button" onClick={() => setConfirmCancel(false)} className="rounded-lg border border-slate-200 px-3 py-2 text-[11px] text-slate-600">Giữ yêu cầu</button></> : <button disabled={busy} type="button" onClick={() => setConfirmCancel(true)} className="flex items-center gap-1 rounded-lg border border-[#e1e8f2] px-3 py-2 text-[11px] text-red-600 hover:bg-red-50 disabled:opacity-50"><Icon name="close" className="size-3!" />{busy ? "Đang hủy…" : "Hủy yêu cầu"}</button>)}<Link to={`/rooms/${item.roomId}`} className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[11px] font-medium ${item.status === "confirmed" ? "border-sky-700 bg-sky-700 text-white hover:bg-sky-800" : "border-[#dfe7f2] text-[#233c58] hover:bg-slate-50"}`}><Icon name="eye" className="size-3.5!" />Xem chi tiết phòng</Link></div></div>
  </article>;
}

export default function ContactRequestsPage({ user, onLogout }) {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [retry, setRetry] = useState(0);
  const [busyId, setBusyId] = useState(null);
  useEffect(() => {
    document.title = "Yêu cầu liên hệ đã gửi | UniHome";
    const controller = new AbortController(); let active = true;
    const timeout = setTimeout(() => controller.abort(), 15000);
    setLoading(true); setError("");
    getContactRequests(controller.signal).then((data) => { if (active) setItems(data.data); }).catch((err) => { if (active) setError(controller.signal.aborted ? "Kết nối quá lâu. Vui lòng thử lại." : err.message); }).finally(() => { clearTimeout(timeout); if (active) setLoading(false); });
    return () => { active = false; clearTimeout(timeout); controller.abort(); };
  }, [user.id, retry]);
  async function cancel(id) {
    if (busyId !== null) return;
    setBusyId(id); setError(""); setMessage("");
    try { const data = await cancelContactRequest(id); setItems((current) => current.map((item) => item._id === id ? data.data : item)); setMessage("Đã hủy yêu cầu liên hệ."); }
    catch (err) { setError(err.message); } finally { setBusyId(null); }
  }
  const tabs = [["all", "Tất cả"], ["pending", "Chờ duyệt"], ["confirmed", "Đã xác nhận"], ["completed", "Hoàn thành"], ["cancelled", "Đã hủy"]];
  const visible = items.filter((item) => filter === "all" || item.status === filter);
  const navClass = "flex items-center gap-3 rounded-lg px-3 py-3 text-[12px] text-slate-600 hover:bg-slate-50";
  return <main className="w-full flex-1 bg-[#f7f9fe] px-4 py-7 sm:px-6 lg:px-9 lg:py-9"><div className="mx-auto max-w-[1180px]">
    <nav aria-label="Đường dẫn" className="mb-6 flex flex-wrap items-center gap-2 text-[11px] text-slate-500"><Link to="/" className="hover:text-sky-700">UniHome</Link><span>›</span><Link to="/account" className="hover:text-sky-700">Quản lý tài khoản</Link><span>›</span><span aria-current="page" className="font-medium text-slate-700">Yêu cầu liên hệ đã gửi</span></nav>
    <div className="grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-7">
      <aside className="rounded-xl border border-[#e1e8f2] bg-white p-4 shadow-sm"><div className="flex flex-col items-center border-b border-slate-100 py-2 pb-5 text-center">{user.avatar ? <img src={user.avatar} alt={user.name} className="size-[76px] rounded-full object-cover ring-1 ring-slate-200" /> : <span className="grid size-[76px] place-items-center rounded-full bg-gradient-to-br from-sky-100 to-blue-200 text-xl font-bold text-sky-700">{user.name.trim().split(/\s+/).slice(-2).map((word) => word[0]).join("").toUpperCase()}</span>}<h2 className="mt-3 text-sm font-semibold text-[#19304c]">{user.name}</h2><p className="mt-1 max-w-full break-all text-[11px] text-slate-500">{user.email}</p><span className="mt-2 rounded-full bg-sky-50 px-2.5 py-1 text-[10px] text-sky-700">{user.role === "admin" ? "Admin" : "Người tìm phòng"}</span></div>
        <nav aria-label="Tài khoản cá nhân" className="mt-4 space-y-1"><Link to="/account" className={navClass}><Icon name="user" className="size-4!" />Thông tin cá nhân<Icon name="arrow" className="ml-auto size-3!" /></Link><Link to="/?page=favorites" className={navClass}><Icon name="heart" className="size-4!" />Phòng yêu thích<span className="ml-auto rounded-full bg-blue-100 px-2 py-0.5 text-[10px] text-blue-900">{readSavedRooms().length}</span></Link><Link to="/appointments" aria-current="page" className="flex items-center gap-3 rounded-lg border-l-2 border-sky-600 bg-[#def0ff] px-3 py-3 text-[12px] font-semibold text-sky-800"><Icon name="document" className="size-4!" />Yêu cầu liên hệ đã gửi<span className="ml-auto rounded-full bg-sky-700 px-2 py-0.5 text-[10px] text-white">{items.length}</span></Link><button type="button" onClick={onLogout} className={`${navClass} w-full text-red-600 hover:bg-red-50`}><Icon name="login" className="size-4!" />Đăng xuất</button></nav>
        <div className="mt-5 rounded-xl border border-blue-100 bg-[#eff4ff] p-3"><h2 className="flex items-center gap-1.5 text-xs font-semibold text-sky-700"><Icon name="sparkles" className="size-4!" />Gợi ý từ UniHome</h2><p className="mt-2 text-[11px] leading-5 text-slate-500">Kiểm tra ghi chú từ Ban quản lý và trạng thái xác nhận trước khi đến xem phòng.</p><Link to="/#ai-assistant" className="mt-3 flex items-center justify-center gap-1 rounded-lg border border-blue-100 bg-white px-2 py-2 text-[11px] font-medium text-sky-700"><Icon name="bot" className="size-3.5!" />Tìm phòng cùng trợ lý</Link></div>
      </aside>
      <section className="min-w-0 space-y-5" aria-busy={loading}>
        <div className="rounded-xl border border-[#e1e8f2] bg-white p-5 shadow-sm"><div className="flex items-start gap-2"><Icon name="document" className="mt-0.5 size-5! shrink-0 text-sky-700" /><div><h1 className="text-lg leading-7 font-bold text-[#182e49]">Yêu cầu liên hệ & Đặt lịch xem phòng đã gửi</h1><p className="mt-1 text-xs leading-5 text-slate-500">Theo dõi tình trạng phản hồi từ Ban quản lý tòa nhà UniHome.</p></div></div><div className="mt-4 flex flex-wrap gap-2">{tabs.map(([value, label]) => <button disabled={busyId !== null} key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)} className={`rounded-lg px-3 py-2 text-[11px] ${filter === value ? "bg-[#006f9e] font-semibold text-white" : "bg-[#f0f4ff] text-slate-600 hover:bg-blue-100"}`}>{label} ({loading ? "…" : value === "all" ? items.length : items.filter((item) => item.status === value).length})</button>)}<button disabled={loading || busyId !== null} type="button" onClick={() => setRetry((value) => value + 1)} className="ml-auto rounded-lg border border-[#dfe7f2] px-3 py-2 text-[11px] text-sky-700 disabled:opacity-50">Làm mới</button></div></div>
        {error && <div role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}<button type="button" onClick={() => setRetry((value) => value + 1)} className="ml-3 underline">Thử lại</button></div>}{message && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-xs text-emerald-700">{message}</p>}
        {loading ? <div role="status" className="space-y-4"><span className="sr-only">Đang tải yêu cầu liên hệ…</span>{[1, 2, 3].map((id) => <div key={id} aria-hidden="true" className="h-52 animate-pulse rounded-xl border border-slate-200 bg-white p-5"><div className="h-4 w-1/2 rounded bg-slate-100" /><div className="mt-6 h-24 rounded bg-slate-100" /></div>)}</div> : visible.length ? visible.map((item) => <RequestCard key={item._id} item={item} busy={busyId !== null} onCancel={cancel} />) : !error && <div className="rounded-xl border border-[#e1e8f2] bg-white px-5 py-12 text-center"><Icon name="document" className="mx-auto size-10! text-blue-200" /><h2 className="mt-4 text-sm font-semibold text-[#19314f]">{items.length ? "Chưa có yêu cầu ở trạng thái này" : "Bạn chưa gửi yêu cầu liên hệ nào"}</h2><p className="mt-2 text-xs leading-6 text-slate-500">Chọn phòng phù hợp và gửi yêu cầu xem phòng để theo dõi tại đây.</p><Link to="/" className="mt-5 inline-block rounded-lg bg-sky-700 px-4 py-2.5 text-xs font-semibold text-white hover:bg-sky-800">Khám phá phòng</Link></div>}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-100 bg-[#e8f0ff] p-4"><div className="flex items-start gap-2"><Icon name="calendar" className="mt-0.5 size-5! text-sky-700" /><div><h2 className="text-xs font-semibold text-[#1c3857]">Cần thay đổi lịch hẹn?</h2><p className="mt-1 text-[11px] leading-5 text-slate-500">Hủy yêu cầu hiện tại và gửi lại khung giờ phù hợp trên trang phòng.</p></div></div><Link to="/?page=favorites" className="text-[11px] font-semibold text-sky-700 hover:underline">Xem phòng yêu thích →</Link></div>
      </section>
    </div>
  </div></main>;
}

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../common/Icon";

export default function NotificationMenu() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const wrapper = useRef(null);
  const button = useRef(null);
  useEffect(() => {
    const controller = new AbortController();
    let busy = false;
    async function load() {
      if (busy || document.visibilityState === "hidden") return;
      busy = true;
      try {
        const response = await fetch("/api/contact-requests/notifications", { credentials: "same-origin", cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error();
        const data = await response.json();
        if (!controller.signal.aborted) { setItems(data.data); setError(""); }
      } catch { if (!controller.signal.aborted) setError("Chưa tải được thông báo. Vui lòng thử lại sau."); }
      finally { busy = false; }
    }
    load();
    const timer = setInterval(load, 15000);
    window.addEventListener("focus", load);
    return () => { controller.abort(); clearInterval(timer); window.removeEventListener("focus", load); };
  }, [open]);
  useEffect(() => {
    if (!open) return;
    function outside(event) { if (!wrapper.current?.contains(event.target)) setOpen(false); }
    function escape(event) { if (event.key === "Escape") { setOpen(false); button.current?.focus(); } }
    document.addEventListener("pointerdown", outside); document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); };
  }, [open]);
  async function read(id) {
    try {
      const response = await fetch(`/api/contact-requests/${id}/read-notification`, { method: "PATCH", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: "{}", signal: AbortSignal.timeout(10000) });
      if (!response.ok) throw new Error();
      setItems((current) => current.map((item) => item.id === id ? { ...item, readAt: new Date().toISOString() } : item));
    } catch { setError("Chưa đánh dấu được thông báo đã đọc."); }
  }
  const unread = items.filter((item) => !item.readAt).length;
  return <div className="relative" ref={wrapper}>
    <button ref={button} type="button" aria-label={`Thông báo${unread ? `, ${unread} chưa đọc` : ""}`} aria-expanded={open} onClick={() => setOpen(!open)} className="relative grid size-10 place-items-center rounded-full text-slate-600 hover:bg-blue-50"><Icon name="bell" className="size-5!" />{unread > 0 && <span className="absolute -top-1 -right-1 rounded-full bg-red-500 px-1.5 text-[10px] text-white">{unread > 99 ? "99+" : unread}</span>}</button>
    {open && <section aria-label="Thông báo" className="absolute right-0 top-full z-50 mt-2 max-h-96 w-[min(360px,calc(100vw-32px))] overflow-y-auto rounded-xl border border-slate-200 bg-white p-3 shadow-lg"><h2 className="p-2 text-sm font-semibold">Thông báo</h2>
      {error && <p role="alert" className="p-2 text-xs text-red-600">{error}</p>}
      {!items.length && !error && <p className="p-3 text-sm text-slate-500">Bạn chưa có thông báo mới.</p>}
      {items.map((item) => <article key={item.id} className={`mb-2 rounded-lg p-3 text-xs ${item.readAt ? "bg-slate-50" : "bg-blue-50"}`}><h3 className="font-semibold text-sky-800">{item.title}</h3><p className="mt-1">{item.roomName}</p><p className="mt-1 text-slate-600">Lịch hẹn: {new Date(item.scheduledAt).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</p>{item.note && <p className="mt-1">Ghi chú: {item.note}</p>}<div className="mt-2 flex justify-between gap-2"><Link to="/appointments" onClick={() => { read(item.id); setOpen(false); }} className="text-sky-700 underline">Xem yêu cầu</Link>{!item.readAt && <button type="button" onClick={() => read(item.id)} className="text-slate-500 underline">Đánh dấu đã đọc</button>}</div></article>)}
    </section>}
  </div>;
}

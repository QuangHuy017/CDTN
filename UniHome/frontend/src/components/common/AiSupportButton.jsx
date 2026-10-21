import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "./Icon";
import { getRooms, parseRoomPrompt } from "../../services/roomService";
import { defaultRegions } from "../home/RoomSearchForm";
import { formatRent } from "../rooms/RoomCard";

const suggestions = ["Phòng dưới 3 triệu ở Hà Đông", "Phòng Cầu Giấy trên 25m²", "Phòng Thanh Xuân dưới 4 triệu"];
const clock = (date) => new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Ho_Chi_Minh" }).format(date);
const greeting = () => ({ id: crypto.randomUUID(), role: "assistant", text: "Xin chào! Tôi là UniHome AI. Bạn muốn tìm phòng như thế nào? Hãy mô tả khu vực, mức giá hoặc diện tích mong muốn nhé!", time: clock(new Date()) });

export default function AiSupportButton() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(() => [greeting()]);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const input = useRef(null); const trigger = useRef(null); const bottom = useRef(null); const request = useRef(null); const recognition = useRef(null);
  function minimize() { recognition.current?.abort(); setOpen(false); requestAnimationFrame(() => trigger.current?.focus()); }
  useEffect(() => {
    if (!open) return;
    input.current?.focus();
    const escape = (event) => { if (event.key === "Escape") { setOpen(false); recognition.current?.abort(); requestAnimationFrame(() => trigger.current?.focus()); } };
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [open]);
  useEffect(() => { if (open) bottom.current?.scrollIntoView({ block: "nearest" }); }, [messages, loading, open]);
  useEffect(() => () => { request.current?.abort(); recognition.current?.abort(); }, []);
  function reset() { request.current?.abort(); recognition.current?.abort(); setLoading(false); setMessages([greeting()]); setPrompt(""); setVoiceMessage(""); input.current?.focus(); }
  function startVoice() {
    if (listening) { recognition.current?.stop(); return; }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { setVoiceMessage("Trình duyệt chưa hỗ trợ giọng nói. Bạn có thể nhập bằng bàn phím."); return; }
    const instance = new SpeechRecognition(); recognition.current = instance; instance.lang = "vi-VN";
    instance.onresult = (event) => { setPrompt(event.results[0][0].transcript.slice(0, 1000)); setVoiceMessage(""); input.current?.focus(); };
    instance.onerror = () => { setListening(false); setVoiceMessage("Chưa nhận được giọng nói. Hãy kiểm tra quyền micro hoặc nhập bằng bàn phím."); };
    instance.onend = () => setListening(false);
    try { instance.start(); setListening(true); setVoiceMessage(""); } catch { setVoiceMessage("Chưa bật được micro. Vui lòng thử lại."); }
  }
  async function send(event) {
    event.preventDefault(); const text = prompt.trim(); if (!text || loading) return;
    recognition.current?.abort(); setPrompt(""); setVoiceMessage("");
    setMessages((current) => [...current, { id: crypto.randomUUID(), role: "user", text, time: clock(new Date()) }]);
    const parsed = parseRoomPrompt(text, defaultRegions);
    if (!parsed.recognized) {
      setMessages((current) => [...current, { id: crypto.randomUUID(), role: "assistant", text: "Bạn cho mình biết khu vực, ngân sách hoặc diện tích nhé. Ví dụ: “Phòng dưới 3 triệu ở Hà Đông”. Hiện mình chưa lọc được theo trường học, khoảng cách, số người hoặc tiện ích.", time: clock(new Date()) }]); input.current?.focus(); return;
    }
    const filters = parsed.filters; const details = [];
    if (filters.khuVuc) details.push(["Khu vực", `${filters.khuVuc}, Hà Nội`]);
    if (filters.price) { const [min, max] = filters.price.split("-"); details.push(["Mức giá", max ? `Tối đa ${formatRent(Number(max))} đ/tháng` : `Từ ${formatRent(Number(min))} đ/tháng`]); }
    if (filters.area) { const [min, max] = filters.area.split("-"); details.push(["Diện tích", max ? `Tối đa ${max} m²` : `Từ ${min} m²`]); }
    const controller = new AbortController(); request.current = controller;
    const timeout = setTimeout(() => controller.abort(new DOMException("Timeout", "TimeoutError")), 15000); setLoading(true);
    try {
      const result = await getRooms(filters, controller.signal);
      if (!controller.signal.aborted && request.current === controller) setMessages((current) => [...current, { id: crypto.randomUUID(), role: "assistant", details, rooms: result.data, total: result.pagination.total, text: "Tôi đã phân tích yêu cầu của bạn:", time: clock(new Date()) }]);
    } catch (error) {
      if (request.current === controller && (!controller.signal.aborted || controller.signal.reason?.name === "TimeoutError")) setMessages((current) => [...current, { id: crypto.randomUUID(), role: "assistant", text: controller.signal.reason?.name === "TimeoutError" ? "Kết nối quá lâu. Bạn thử gửi lại yêu cầu nhé." : error.message, time: clock(new Date()) }]);
    } finally { clearTimeout(timeout); if (request.current === controller) setLoading(false); input.current?.focus(); }
  }
  return <>
    <button ref={trigger} type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="unihome-chat" aria-label="UniHome AI — Mở trợ lý tìm phòng" className={`${open ? "hidden" : "flex"} fixed right-5 bottom-5 z-40 min-h-16 items-center gap-3 rounded-full bg-[#006c9e] py-3 pr-5 pl-3.5 text-white shadow-xl transition hover:bg-[#005681] hover:shadow-xl sm:right-7 sm:bottom-6`}>
      <span className="relative grid size-10 place-items-center rounded-full bg-white/15"><Icon name="bot" className="size-6!" /><span aria-hidden="true" className="absolute -top-0.5 right-0 size-2.5 rounded-full bg-[#6ce9c0] ring-2 ring-[#006c9e]" /></span><span className="text-left"><span className="block text-sm font-semibold">UniHome AI</span><span className="mt-0.5 block text-xs text-sky-100">Hỗ trợ ngay</span></span>
    </button>
    {open && <section id="unihome-chat" role="dialog" aria-label="Trò chuyện với UniHome AI" className="fixed right-3 bottom-3 z-50 flex h-[min(640px,calc(100dvh-24px))] w-[calc(100%-24px)] max-w-[540px] flex-col overflow-hidden rounded-2xl border border-[#dce4ef] bg-[#fbfcff] shadow-[0_12px_50px_#17365425] sm:right-7 sm:bottom-6 sm:h-[min(640px,calc(100dvh-48px))] sm:w-[540px]">
      <header className="flex shrink-0 items-center gap-2.5 border-b border-[#e8edf5] bg-white px-3 py-3 sm:px-4"><span className="relative grid size-9 shrink-0 place-items-center rounded-xl bg-[#006c9e] text-white"><Icon name="bot" className="size-6!" /><span className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2 border-white bg-emerald-400" /></span><div className="min-w-0 flex-1"><h2 className="text-[13px] font-semibold text-[#15314d]">UniHome AI <span className="text-[11px] font-normal text-sky-800">– Trợ lý tìm phòng thông minh</span></h2><p className="mt-0.5 text-[9px] text-slate-500"><span className="text-emerald-700">● Sẵn sàng hỗ trợ</span><span className="mx-1">•</span>Tìm phòng bằng tiếng Việt</p></div><button type="button" onClick={reset} title="Bắt đầu cuộc trò chuyện mới" aria-label="Bắt đầu cuộc trò chuyện mới" className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-sky-700"><Icon name="refresh" className="size-4!" /></button><button type="button" onClick={minimize} aria-label="Thu nhỏ khung chat" title="Thu nhỏ" className="rounded-lg p-2 text-slate-500 hover:bg-blue-50"><Icon name="minus" className="size-4!" /></button></header>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 sm:px-4" role="log" aria-label="Nội dung hội thoại" aria-live="polite" aria-relevant="additions">
        <p className="mx-auto mb-4 w-fit rounded-full bg-[#e7efff] px-3 py-1.5 text-center text-[9px] text-[#7690ad]">Hôm nay · Trợ lý tìm phòng UniHome</p>
        {messages.map((message) => <div key={message.id} className={`mb-4 flex items-start gap-2 ${message.role === "user" ? "justify-end pl-9" : "pr-5"}`}>
          {message.role === "assistant" && <span className="mt-1 grid size-6 shrink-0 place-items-center rounded-lg bg-[#cce6ff] text-[#005c92]"><Icon name="bot" className="size-4!" /></span>}
          <div className="min-w-0 max-w-full"><div className={`rounded-2xl px-3.5 py-3 text-[12px] leading-6 whitespace-pre-wrap ${message.role === "user" ? "rounded-tr-sm bg-[#006e9f] font-medium text-white" : "rounded-tl-sm border border-[#dfe7f6] bg-[#f0f4ff] text-[#173451]"}`}>
            <p className={message.details ? "flex items-center gap-1.5 font-semibold text-sky-700" : ""}>{message.details && <Icon name="sparkles" className="size-4! shrink-0" />}{message.text}</p>
            {message.details && <><dl className="mt-2 space-y-1 rounded-xl border border-[#e5ecf7] bg-white/80 p-3">{message.details.map(([key, value]) => <div key={key} className="flex items-start gap-1.5 text-[11px]"><span className="text-teal-600" aria-hidden="true">⊙</span><dt className="font-semibold">{key}:</dt><dd>{value}</dd></div>)}</dl><p className="mt-2 text-[10px] leading-5 text-slate-500">Đang lọc theo các tiêu chí trên. Số người, tiện ích và khoảng cách chưa được áp dụng.</p><p className="mt-2 text-[11px] font-medium text-sky-800">{message.total ? `Tìm thấy ${message.total} phòng phù hợp${message.total > message.rooms.length ? ` · Hiển thị ${message.rooms.length} phòng giá thấp nhất` : ""}.` : "Chưa có phòng phù hợp. Bạn thử tăng ngân sách hoặc đổi khu vực nhé."}</p>{message.rooms.length > 0 && <div className="mt-2 space-y-2">{message.rooms.map((room) => <Link onClick={minimize} key={room._id} to={`/rooms/${room._id}`} className="block rounded-lg border border-blue-100 bg-white p-2.5 hover:border-sky-400"><span className="block text-[11px] leading-5 font-semibold text-[#173451]">{room.tenPhong}</span><span className="mt-1 flex flex-wrap justify-between gap-1 text-[10px]"><span className="font-semibold text-sky-700">{formatRent(room.giaThue)} đ/tháng</span><span className="text-slate-500">{room.dienTich} m² · {roomStatusesLabel(room.trangThai)}</span></span></Link>)}</div>}</>}
          </div><p className={`mt-1 px-1 text-[9px] text-slate-400 ${message.role === "user" ? "text-right" : ""}`}>{message.time}{message.role === "user" && " ✓✓"}</p></div>
        </div>)}
        {loading && <div role="status" className="mb-3 flex items-center gap-2 text-xs text-sky-700"><Icon name="bot" className="size-5!" /><span className="animate-pulse">Đang tìm phòng phù hợp…</span></div>}<div ref={bottom} />
      </div>
      {showSuggestions && <div className="flex shrink-0 items-center gap-1.5 overflow-x-auto border-y border-[#e7edf7] bg-[#f3f7ff] px-3 py-2"><span className="flex shrink-0 items-center gap-1 text-[9px] text-sky-700"><Icon name="bolt" className="size-3!" />Gợi ý:</span>{suggestions.map((suggestion) => <button disabled={loading} type="button" key={suggestion} onClick={() => { setPrompt(suggestion); input.current?.focus(); }} className="shrink-0 rounded-md border border-[#e0e8f6] bg-white px-2 py-1 text-[10px] text-[#1e3b58] hover:border-sky-400 disabled:opacity-50">{suggestion}</button>)}</div>}
      <form onSubmit={send} className="shrink-0 bg-white px-2.5 pt-2.5 pb-3"><div className="flex items-center gap-1 rounded-xl border border-[#dce4ef] bg-[#f8faff] p-1.5 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-50"><button disabled={loading} type="button" onClick={startVoice} aria-label={listening ? "Dừng ghi âm" : "Nhập bằng giọng nói"} aria-pressed={listening} className={`rounded-lg p-2 hover:bg-blue-50 ${listening ? "animate-pulse text-red-500" : "text-[#315b85]"}`}><Icon name="mic" className="size-4!" /></button><input ref={input} value={prompt} onChange={(event) => setPrompt(event.target.value)} maxLength={1000} aria-label="Yêu cầu tìm phòng" autoComplete="off" placeholder={listening ? "Đang nghe…" : "Nhập yêu cầu tìm phòng bằng tiếng Việt…"} className="min-w-0 flex-1 bg-transparent py-2 text-[11px] text-[#193751] outline-none placeholder:text-slate-400" /><button type="button" onClick={() => setShowSuggestions((value) => !value)} aria-label="Hiện hoặc ẩn gợi ý" aria-expanded={showSuggestions} className="rounded-lg p-2 text-sky-700 hover:bg-blue-50"><Icon name="plusCircle" className="size-4!" /></button><button disabled={loading || !prompt.trim()} type="submit" aria-label="Gửi tin nhắn" className="grid size-8 shrink-0 place-items-center rounded-full bg-[#2475ef] text-white hover:bg-blue-700 disabled:opacity-50"><Icon name="send" className="size-4!" /></button></div>{voiceMessage && <p role="status" className="mt-2 px-1 text-[10px] text-amber-700">{voiceMessage}</p>}<div className="mt-2 flex justify-between gap-2 px-1 text-[9px] text-slate-400"><span>Bộ lọc từ khóa UniHome · Chưa kết nối mô hình AI</span><span className="shrink-0">Nhấn Enter để gửi</span></div></form>
    </section>}
  </>;
}

function roomStatusesLabel(status) { return ({ con_trong: "Còn trống", sap_trong: "Sắp trống", da_thue: "Đã thuê" })[status] || "Chưa cập nhật"; }

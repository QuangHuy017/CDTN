import { useEffect, useRef, useState } from "react";
import Icon from "../common/Icon";

const suggestions = ["Dưới 3tr ở Hà Đông", "Gần ĐH Quốc Gia HN", "Có gác xép, full đồ Cầu Giấy"];

export default function AiSearchPanel({ onSearch, loading }) {
  const [prompt, setPrompt] = useState("");
  const [listening, setListening] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState("");
  const recognition = useRef(null);
  const textarea = useRef(null);
  useEffect(() => () => recognition.current?.abort(), []);

  function startVoice() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { setVoiceMessage("Trình duyệt chưa hỗ trợ nhập giọng nói. Bạn có thể nhập yêu cầu bên trên."); return; }
    if (listening) { recognition.current?.stop(); return; }
    const instance = new SpeechRecognition();
    recognition.current = instance;
    instance.lang = "vi-VN";
    instance.onresult = (event) => { setPrompt(event.results[0][0].transcript); setVoiceMessage(""); };
    instance.onerror = () => { setVoiceMessage("Không thể nhận giọng nói. Kiểm tra quyền micro hoặc nhập bằng bàn phím."); setListening(false); };
    instance.onend = () => setListening(false);
    try { instance.start(); setListening(true); setVoiceMessage(""); } catch { setVoiceMessage("Chưa thể bật micro. Vui lòng thử lại."); }
  }

  return (
    <section id="ai-assistant" className="scroll-mt-6 rounded-xl border border-[#a8cdef] bg-linear-to-b from-[#eef4ff] to-white p-5 shadow-sm lg:p-7" aria-labelledby="ai-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#cce6ff] px-3 py-1 text-[11px] font-semibold text-[#005a94]"><Icon name="bot" className="size-3.5!" />Trợ lý AI Thông Minh</span>
        <span className="flex items-center gap-1.5 text-[11px] text-[#406788]"><span className="size-1.5 rounded-full bg-[#49b99a]" />Tìm theo yêu cầu · Bản thử nghiệm</span>
      </div>
      <h2 id="ai-heading" className="mt-4 flex items-center gap-2 text-lg font-semibold text-[#123754]">Bạn đang tìm phòng như thế nào?<Icon name="sparkles" className="size-5! text-[#0074ba]" /></h2>
      <p className="mt-1 text-xs leading-relaxed text-[#47617c]">Nhập yêu cầu bằng ngôn ngữ tự nhiên đời thường để tìm căn phòng phù hợp với bạn.</p>
      <form className="mt-4 rounded-xl border border-[#dbe3ee] bg-white px-3" onSubmit={(event) => { event.preventDefault(); onSearch(prompt); }}>
        <label className="sr-only" htmlFor="room-prompt">Mô tả căn phòng bạn muốn tìm</label>
        <textarea ref={textarea} id="room-prompt" rows={3} value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Ví dụ: Tôi muốn tìm phòng dưới 4 triệu tại Cầu Giấy, rộng trên 25m², có ban công và máy giặt riêng." className="block min-h-24 w-full resize-y border-0 bg-transparent py-3 text-sm leading-relaxed text-[#233d5b] outline-none placeholder:text-[#8b9bb0]" maxLength={1000} required />
        <div className="flex items-center justify-between gap-2 border-t border-[#edf0f5] py-2">
          <button className="flex items-center gap-2 rounded p-1 text-[11px] text-[#27618e] hover:bg-blue-50" type="button" aria-pressed={listening} onClick={startVoice}><Icon name="mic" className={`size-3.5! ${listening ? "animate-pulse text-red-500" : "text-[#007cc0]"}`} />{listening ? "Đang nghe… Bấm để dừng" : "Hỗ trợ nhập liệu giọng nói"}</button>
          <button disabled={loading} className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[#006b9d] px-4 py-2 text-xs font-semibold text-white hover:bg-[#005881] disabled:opacity-60"><Icon name="sparkles" className="size-4!" />{loading ? "Đang tìm…" : "Tìm bằng AI"}</button>
        </div>
      </form>
      {voiceMessage && <p className="mt-2 text-xs text-[#8a4d1d]" role="status">{voiceMessage}</p>}
      <p className="mt-3 text-[10px] font-medium tracking-wide text-[#2e577a]">GỢI Ý CÂU LỆNH MẪU NHANH:</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {suggestions.map((suggestion) => <button key={suggestion} type="button" onClick={() => { setPrompt(suggestion); textarea.current?.focus(); }} className="flex items-center gap-1 rounded-md border border-[#dce5ef] bg-white px-2.5 py-1.5 text-[11px] text-[#164569] hover:border-sky-400 hover:bg-sky-50"><Icon name="bolt" className="size-3! text-sky-600" />{suggestion}</button>)}
      </div>
      <p className="mt-3 text-[10px] leading-relaxed text-slate-500">Hiện hỗ trợ nhận diện khu vực, giá và diện tích bằng từ khóa; chưa kết nối mô hình AI.</p>
    </section>
  );
}

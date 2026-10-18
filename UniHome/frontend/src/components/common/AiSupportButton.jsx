import Icon from "./Icon";
import { useNavigate } from "react-router-dom";

export default function AiSupportButton() {
  const navigate = useNavigate();
  function openAssistant() {
    const panel = document.getElementById("ai-assistant");
    const prompt = document.getElementById("room-prompt");
    if (!panel) { navigate("/#ai-assistant"); return; }
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    panel?.scrollIntoView({ behavior: reducedMotion ? "instant" : "smooth", block: "center" });
    prompt?.focus({ preventScroll: true });
  }
  return (
    <button type="button" onClick={openAssistant} aria-label="UniHome AI — Mở trợ lý tìm phòng" className="fixed right-5 bottom-5 z-20 flex items-center gap-2.5 rounded-full bg-[#006c9e] py-2.5 pr-4 pl-3 text-white shadow-lg transition hover:bg-[#005681] hover:shadow-xl sm:right-7 sm:bottom-6">
      <span className="relative grid size-8 place-items-center rounded-full bg-white/15"><Icon name="bot" className="size-5!" /><span aria-hidden="true" className="absolute -top-0.5 right-0 size-2 rounded-full bg-[#6ce9c0] ring-2 ring-[#006c9e]" /></span>
      <span className="text-left"><span className="block text-xs leading-tight font-semibold">UniHome AI</span><span className="mt-0.5 block text-[10px] leading-tight text-sky-100">Hỗ trợ ngay</span></span>
    </button>
  );
}

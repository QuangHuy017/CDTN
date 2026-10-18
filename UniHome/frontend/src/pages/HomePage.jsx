import { useEffect, useRef, useState } from "react";
import RoomSearchForm, { defaultRegions } from "../components/home/RoomSearchForm";
import AiSearchPanel from "../components/home/AiSearchPanel";
import RoomSearchResults from "../components/home/RoomSearchResults";
import { getRooms, parseRoomPrompt } from "../services/roomService";
import FeaturedRooms from "../components/home/FeaturedRooms";
import WhyUniHome from "../components/home/WhyUniHome";

export default function HomePage() {
  const [filters, setFilters] = useState({ khuVuc: "Cầu Giấy", price: "3000000-5000000", area: "20-30" });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const request = useRef(null);
  const appliedFilters = useRef(filters);
  useEffect(() => () => request.current?.abort(), []);
  useEffect(() => {
    document.title = "UniHome — Trang chủ | Tìm phòng trọ sinh viên";
    if (window.location.hash === "#ai-assistant") {
      document.getElementById("ai-assistant")?.scrollIntoView();
      document.getElementById("room-prompt")?.focus({ preventScroll: true });
    }
  }, []);

  async function search(criteria, page = 1, description = "") {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    appliedFilters.current = criteria;
    setLoading(true); setError(""); setNote(description);
    const timeout = setTimeout(() => controller.abort(new DOMException("Timeout", "TimeoutError")), 15000);
    try {
      const data = await getRooms({ ...criteria, page }, controller.signal);
      if (request.current === controller && !controller.signal.aborted) setResult(data);
    }
    catch (err) { if (request.current === controller && (!controller.signal.aborted || controller.signal.reason?.name === "TimeoutError")) setError(err.name === "TimeoutError" ? "Kết nối quá lâu. Vui lòng thử lại." : err.message); }
    finally { clearTimeout(timeout); if (request.current === controller) setLoading(false); }
  }

  function searchPrompt(prompt) {
    const parsed = parseRoomPrompt(prompt, defaultRegions);
    if (!parsed.recognized) {
      setNote("Chưa nhận diện được bộ lọc. Hãy ghi rõ khu vực và giá, ví dụ: dưới 3 triệu ở Hà Đông. Tìm theo khoảng cách tới trường chưa được hỗ trợ.");
      return;
    }
    search(parsed.filters, 1, "Đang lọc theo khu vực, giá và diện tích nhận diện được. Các yêu cầu về nội thất, tiện ích hoặc khoảng cách tới trường chưa được áp dụng.");
  }

  return (
    <main id="main-content" className="mx-auto w-full max-w-[1440px] flex-1 space-y-6 px-4 py-7 sm:px-6 lg:px-10 lg:py-9" aria-label="Nội dung trang chủ">
      <RoomSearchForm filters={filters} onChange={setFilters} onSearch={() => search(filters)} regions={defaultRegions} loading={loading} />
      <AiSearchPanel onSearch={searchPrompt} loading={loading} />
      <RoomSearchResults result={result} loading={loading} error={error} note={note} onPage={(page) => search(appliedFilters.current, page, note)} />
      <FeaturedRooms />
      <WhyUniHome />
    </main>
  );
}

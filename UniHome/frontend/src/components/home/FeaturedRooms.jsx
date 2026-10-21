import { readSavedRooms as loadSaved } from "../../services/savedRooms";
import { useEffect, useRef, useState } from "react";
import { getFeaturedRooms } from "../../services/roomService";
import RoomCard from "../rooms/RoomCard";


const storageKey = "unihome:saved-rooms";
export default function FeaturedRooms() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [all, setAll] = useState(false);
  const [retry, setRetry] = useState(0);

  const [saved, setSaved] = useState(loadSaved);
  const [saveMessage, setSaveMessage] = useState("");
  const section = useRef(null);
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(new DOMException("Timeout", "TimeoutError")), 15000);
    setLoading(true); setError("");
    getFeaturedRooms({ page, all }, controller.signal).then((data) => {
      if (!controller.signal.aborted) setResult(data);
    }).catch((error) => {
      if (!controller.signal.aborted || controller.signal.reason?.name === "TimeoutError") setError(controller.signal.reason?.name === "TimeoutError" ? "Kết nối quá lâu. Vui lòng thử lại." : error.message);
    }).finally(() => { clearTimeout(timeout); if (!controller.signal.aborted || controller.signal.reason?.name === "TimeoutError") setLoading(false); });
    return () => { clearTimeout(timeout); controller.abort(); };
  }, [page, all, retry]);

  function toggleSaved(id) {
    const next = saved.includes(id) ? saved.filter((savedId) => savedId !== id) : [...saved, id];
    setSaved(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); setSaveMessage(next.includes(id) ? "Đã lưu phòng yêu thích trên trình duyệt này." : "Đã bỏ lưu phòng."); }
    catch { setSaveMessage("Đã cập nhật trong phiên này; trình duyệt không cho phép lưu lâu dài."); }
  }
  function changePage(next) { setPage(next); section.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }

  return (
    <section ref={section} className="scroll-mt-6" aria-labelledby="featured-heading" aria-busy={loading}>
      <div className="mb-4 flex items-start justify-between gap-4"><div><h2 id="featured-heading" className="text-lg font-semibold text-[#172c49]">{all ? "Tất cả phòng cho thuê" : "Phòng cho thuê nổi bật"}</h2><p className="mt-1 text-xs text-[#626c7d]">{all ? "Khám phá các phòng và tình trạng cho thuê hiện tại." : "Khám phá các phòng còn trống tại những cơ sở UniHome ở Hà Nội."}</p></div><button type="button" onClick={() => { setAll(!all); setPage(1); }} className="shrink-0 rounded py-2 text-xs font-medium text-[#0074af] hover:underline">{all ? "Thu gọn" : "Xem tất cả ›"}</button></div>
      {saveMessage && <p role="status" className="mb-3 text-xs text-sky-700">{saveMessage}</p>}
      {loading ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" role="status"><span className="sr-only">Đang tải phòng nổi bật…</span>{Array.from({ length: 12 }, (_, index) => <div key={index} aria-hidden="true" className="overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="aspect-[1.6] animate-pulse bg-slate-200" /><div className="space-y-3 p-4"><div className="h-4 w-4/5 animate-pulse rounded bg-slate-100" /><div className="h-3 w-3/5 animate-pulse rounded bg-slate-100" /><div className="h-8 animate-pulse rounded bg-slate-100" /></div></div>)}</div> : error ? <div className="rounded-xl border border-slate-200 bg-white p-8 text-center"><p role="alert" className="text-sm text-slate-600">{error}</p><button onClick={() => setRetry(retry + 1)} className="mt-4 rounded-lg bg-sky-700 px-4 py-2 text-sm text-white">Thử lại</button></div> : result?.data.length ? <>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{result.data.map((room) => <RoomCard key={room._id} room={room} saved={saved.includes(room._id)} onSave={() => toggleSaved(room._id)} />)}</div>
        {all && result.pagination.totalPages > 1 && <div className="mt-6 flex items-center justify-center gap-4 text-sm"><button type="button" disabled={page <= 1} onClick={() => changePage(page - 1)} className="rounded-lg border border-slate-200 bg-white px-4 py-2 disabled:opacity-40">Trang trước</button><span>Trang {page}/{result.pagination.totalPages}</span><button type="button" disabled={page >= result.pagination.totalPages} onClick={() => changePage(page + 1)} className="rounded-lg border border-slate-200 bg-white px-4 py-2 disabled:opacity-40">Trang sau</button></div>}
      </> : <p className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">{all ? "Chưa có phòng trong hệ thống." : "Hiện chưa có phòng còn trống. Bạn có thể chọn Xem tất cả để xem các phòng khác."}</p>}

    </section>
  );
}

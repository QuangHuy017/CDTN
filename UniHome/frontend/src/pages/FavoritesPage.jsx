import { readSavedRooms as readSaved } from "../services/savedRooms";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import FavoriteRoomCard from "../components/rooms/FavoriteRoomCard";
import Icon from "../components/common/Icon";
import { getRoomDetails } from "../services/roomService";

const storageKey = "unihome:saved-rooms";
export default function FavoritesPage({ user, onLogout }) {
  const [saved, setSaved] = useState(readSaved);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [missing, setMissing] = useState(0);
  const [retry, setRetry] = useState(0);
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    document.title = "Phòng yêu thích | UniHome";
    function sync(event) {
      if (event.key === storageKey || event.key === null) setSaved(readSaved());
    }
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(new DOMException("Timeout", "TimeoutError")), 15000);
    setLoading(true);
    setError("");
    setMissing(0);
    async function load() {
      const results = await Promise.allSettled(saved.map((id) => getRoomDetails(id, controller.signal)));
      if (controller.signal.aborted) {
        if (controller.signal.reason?.name === "TimeoutError") {
          setError("Kết nối quá lâu. Vui lòng thử lại.");
          setLoading(false);
        }
        return;
      }
      setRooms(results.filter((result) => result.status === "fulfilled").map((result) => result.value));
      setMissing(results.filter((result) => result.status === "rejected" && result.reason?.status === 404).length);
      if (results.some((result) => result.status === "rejected" && result.reason?.status !== 404)) {
        setError("Chưa tải được một số phòng yêu thích. Vui lòng thử lại.");
      }
      setLoading(false);
    }
    load().finally(() => clearTimeout(timeout));
    return () => { clearTimeout(timeout); controller.abort(); };
  }, [saved, retry]);

  function removeSaved(id) {
    const next = saved.filter((value) => value !== id);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
      setSaved(next);
      setMessage("Đã bỏ lưu phòng.");
    } catch {
      setMessage("Không thể bỏ lưu phòng vì trình duyệt không cho phép cập nhật bộ nhớ. Vui lòng thử lại.");
    }
  }

  const filtered = rooms.filter((room) => filter === "all" || room.trangThai === filter).sort((a, b) => {
    if (sort === "priceAsc") return a.giaThue - b.giaThue;
    if (sort === "priceDesc") return b.giaThue - a.giaThue;
    if (sort === "area") return b.dienTich - a.dienTich;
    return sort === "oldest" ? saved.indexOf(a._id) - saved.indexOf(b._id) : saved.indexOf(b._id) - saved.indexOf(a._id);
  });
  const filters = [["all", "Tất cả"], ["con_trong", "Còn trống"], ["sap_trong", "Sắp trống"], ["da_thue", "Đã thuê"]];
  const navClass = "flex items-center gap-3 rounded-lg px-3 py-3 text-[13px] text-slate-600 hover:bg-slate-50";
  return (
    <main className="w-full flex-1 bg-[#f7f9fe] px-4 py-7 sm:px-6 lg:px-9 lg:py-9">
    <div className="mx-auto max-w-[1180px]">
      <nav aria-label="Đường dẫn" className="mb-6 flex items-center gap-2 text-[11px] text-slate-500"><Link to={user ? "/account" : "/login"} className="hover:text-sky-700">Tài khoản</Link><span aria-hidden="true">›</span><span aria-current="page" className="font-medium text-slate-700">Phòng yêu thích</span></nav>
      <div className="grid items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-7">
        <aside className="rounded-xl border border-[#e3e9f2] bg-white p-4 shadow-sm">
          <div className="flex flex-col items-center border-b border-slate-100 pb-5 text-center">
            {user?.avatar ? <img src={user.avatar} alt={`Ảnh đại diện ${user.name}`} className="size-[76px] rounded-full border-2 border-white object-cover ring-1 ring-slate-200" /> : <span className="grid size-[76px] place-items-center rounded-full bg-gradient-to-br from-sky-100 to-blue-200 text-2xl font-bold text-sky-700">{user?.name?.trim().split(/\s+/).slice(-2).map((word) => word[0]).join("").toUpperCase() || <Icon name="user" className="size-9!" />}</span>}
            <h2 className="mt-3 text-base font-semibold text-[#172c49]">{user?.name || "Khách truy cập"}</h2>
            <p className="mt-1 max-w-full break-all text-[11px] text-slate-500">{user?.email || "Phòng đã lưu trên trình duyệt này"}</p>
            {user && <span className="mt-2 rounded-full bg-sky-100 px-3 py-1 text-[10px] font-medium text-sky-800">{user.role === "admin" ? "Admin" : "Người tìm phòng"}</span>}
          </div>
          <nav aria-label="Tài khoản cá nhân" className="mt-3 space-y-1">
            <Link to="/account" className={navClass}><Icon name="user" className="size-4!" />Thông tin cá nhân</Link>
            <Link to="/?page=favorites" aria-current="page" className="flex items-center gap-3 rounded-lg bg-[#cfe7ff] px-3 py-3 text-[13px] font-semibold text-[#154761]"><Icon name="heart" className="size-4! fill-sky-700! text-sky-700" />Phòng yêu thích<span className="ml-auto rounded-full bg-sky-700 px-2 py-0.5 text-[10px] text-white">{saved.length}</span></Link>
            <Link to="/appointments" className={navClass}><Icon name="calendar" className="size-4!" />Yêu cầu liên hệ đã gửi</Link>
            {user ? <button type="button" onClick={onLogout} className={`${navClass} w-full text-red-600 hover:bg-red-50`}><Icon name="login" className="size-4!" />Đăng xuất</button> : <Link to="/login" className={navClass}><Icon name="login" className="size-4!" />Đăng nhập</Link>}
          </nav>
          <div className="mt-5 rounded-lg border border-blue-100 bg-[#f0f4ff] p-3"><p className="flex items-center gap-1.5 text-xs font-semibold text-sky-700"><Icon name="pin" className="size-3.5!" />Mẹo tìm phòng</p><p className="mt-2 text-[11px] leading-5 text-slate-500">Phòng yêu thích có thể thay đổi tình trạng. Hãy kiểm tra chi tiết và liên hệ cơ sở trước khi đến xem.</p></div>
        </aside>
        <section className="min-w-0 space-y-5" aria-busy={loading}>
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#e4eaf3] pb-5"><div><h1 className="text-xl leading-snug font-bold tracking-tight text-[#172c49] sm:text-2xl">Danh sách phòng trọ đã lưu ({saved.length} phòng)</h1><p className="mt-2 text-xs leading-5 text-slate-500">Xem giá, tình trạng phòng và lên lịch xem phòng bạn yêu thích.</p></div><Link to="/" className="flex items-center gap-1.5 rounded-lg border border-[#dfe7f2] bg-white px-3 py-2.5 text-xs font-medium text-sky-700 hover:bg-sky-50"><Icon name="search" className="size-3.5!" />Tìm thêm phòng khác</Link></div>
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#e3e9f2] bg-white px-3 py-3.5"><div className="flex flex-wrap items-center gap-2"><span className="mr-1 text-[11px] text-slate-500">Bộ lọc:</span>{filters.map(([value, label]) => <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)} className={`rounded-lg border px-2.5 py-1.5 text-[11px] ${filter === value ? "border-[#006c9e] bg-[#006c9e] text-white" : value === "con_trong" ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "border-[#e0e7f3] bg-[#f0f4ff] text-slate-600 hover:bg-blue-100"}`}>{value !== "all" && <span aria-hidden="true">● </span>}{label} ({loading ? "…" : value === "all" ? rooms.length : rooms.filter((room) => room.trangThai === value).length})</button>)}</div><label className="flex items-center gap-2 text-[11px] text-slate-500">Sắp xếp:<select value={sort} onChange={(event) => setSort(event.target.value)} className="rounded-lg border border-[#dfe7f2] bg-white px-2 py-2 text-[11px] text-[#253b57] outline-none focus:border-sky-500"><option value="newest">Mới lưu gần đây</option><option value="oldest">Lưu lâu nhất</option><option value="priceAsc">Giá tăng dần</option><option value="priceDesc">Giá giảm dần</option><option value="area">Diện tích lớn nhất</option></select></label></div>
      {message && <p role="status" className="text-sm text-sky-700">{message}</p>}
      {error && <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}<button type="button" onClick={() => setRetry((value) => value + 1)} className="ml-3 font-semibold underline">Thử lại</button></div>}
      {loading ? <p role="status" className="py-10 text-center text-sm text-slate-500">Đang tải phòng yêu thích…</p> : <>
        {missing > 0 && <p className="text-sm text-slate-500">{missing} phòng đã lưu không còn tồn tại.</p>}
        {filtered.length > 0 ? <div className="grid gap-5 sm:grid-cols-2">{filtered.map((room) => <FavoriteRoomCard key={room._id} room={room} onRemove={() => removeSaved(room._id)} />)}</div> : !error && <div className="rounded-xl border border-slate-200 bg-white p-10 text-center"><Icon name="heart" className="mx-auto mb-4 size-10! text-blue-200" /><p className="text-sm text-slate-600">{rooms.length ? "Không có phòng phù hợp với bộ lọc này." : saved.length ? "Không còn phòng đã lưu nào để hiển thị." : "Bạn chưa lưu phòng yêu thích nào."}</p>{rooms.length ? <button type="button" onClick={() => setFilter("all")} className="mt-4 rounded-lg bg-sky-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-sky-800">Xem tất cả phòng đã lưu</button> : <Link to="/" className="mt-4 inline-block rounded-lg bg-sky-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-sky-800">Khám phá phòng</Link>}</div>}
      </>}
      <div className="rounded-xl border border-dashed border-[#dbe4f2] bg-white px-5 py-7 text-center"><span className="mx-auto grid size-10 place-items-center rounded-full bg-sky-100 text-sky-600"><Icon name="bot" className="size-5!" /></span><h2 className="mt-3 text-sm font-semibold text-[#19324f]">Bạn muốn mở rộng khu vực tìm kiếm?</h2><p className="mx-auto mt-2 max-w-md text-[11px] leading-5 text-slate-500">Mô tả khu vực và ngân sách để trợ lý UniHome giúp bạn lọc các phòng phù hợp.</p><Link to="/#ai-assistant" className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-sky-700 hover:underline">Hỏi trợ lý UniHome ngay<Icon name="arrow" className="size-3.5!" /></Link></div>
        </section>
      </div>
    </div>
    </main>
  );
}

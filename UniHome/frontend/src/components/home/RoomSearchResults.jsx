import { Link } from "react-router-dom";

export default function RoomSearchResults({ result, loading, error, note, onPage }) {
  if (!result && !loading && !error && !note) return null;
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 lg:p-7" aria-labelledby="results-heading" aria-busy={loading}>
      <h2 id="results-heading" className="text-lg font-semibold">Kết quả tìm phòng</h2>
      {note && <p className="mt-2 text-sm text-slate-600" role="status">{note}</p>}
      {loading ? <p className="mt-4 text-sm text-sky-700" role="status">Đang tải các phòng phù hợp…</p> : error ? <p className="mt-4 text-sm text-red-600" role="alert">{error}</p> : result && <>
        <p className="mt-2 text-sm text-slate-500" role="status">Tìm thấy {result.pagination.total} phòng phù hợp.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {result.data.map((room) => <article key={room._id} className="overflow-hidden rounded-xl border border-slate-200">
            {room.hinhAnh?.[0] && <img src={room.hinhAnh[0]} alt={room.tenPhong} className="aspect-[16/10] w-full object-cover" loading="lazy" />}
            <div className="space-y-2 p-4"><h3 className="text-sm font-semibold"><Link to={`/rooms/${room._id}`} className="hover:text-blue-600">{room.tenPhong}</Link></h3><p className="text-xs text-slate-500">{room.maCoSo} · {room.dienTich} m² · {room.trangThai === "con_trong" ? "Còn trống" : room.trangThai === "da_thue" ? "Đã thuê" : "Sắp trống"}</p><p className="font-bold text-sky-700">{Number(room.giaThue).toLocaleString("vi-VN")} <span className="text-xs font-normal">đ/tháng</span></p><Link to={`/rooms/${room._id}`} className="inline-block rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700">Xem chi tiết →</Link></div>
          </article>)}
        </div>
        {result.pagination.totalPages > 1 && <div className="mt-5 flex items-center justify-center gap-4 text-sm"><button disabled={result.pagination.page <= 1} onClick={() => onPage(result.pagination.page - 1)} className="rounded-lg border border-slate-200 px-3 py-2 disabled:opacity-40">Trang trước</button><span>Trang {result.pagination.page}/{result.pagination.totalPages}</span><button disabled={result.pagination.page >= result.pagination.totalPages} onClick={() => onPage(result.pagination.page + 1)} className="rounded-lg border border-slate-200 px-3 py-2 disabled:opacity-40">Trang sau</button></div>}
      </>}
    </section>
  );
}

import { readSavedRooms as readFavorites } from "../services/savedRooms";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getRoomDetails } from "../services/roomService";
import Icon from "../components/common/Icon";
import { roomStatuses } from "../components/rooms/RoomCard";
import RoomGallery from "../components/rooms/RoomGallery";
import RoomCosts from "../components/rooms/RoomCosts";
import RoomVisitCard from "../components/rooms/RoomVisitCard";

function DetailContent({ room }) {
  const [favorites, setFavorites] = useState(readFavorites);
  const [message, setMessage] = useState("");
  const building = room.building;
  const status = roomStatuses[room.trangThai] || { label: "Chưa cập nhật", color: "bg-slate-100 text-slate-600" };
  const amenities = [...new Set([...(room.tienIch || []), ...(building?.tienIchChung || [])])];
  const saved = favorites.includes(room._id);
  const coordinates = building?.toaDo?.coordinates;
  const hasCoordinates = Array.isArray(coordinates) && coordinates.length === 2 && coordinates.every(Number.isFinite) && Math.abs(coordinates[0]) <= 180 && Math.abs(coordinates[1]) <= 90;
  const mapQuery = hasCoordinates ? `${coordinates[1]},${coordinates[0]}` : building?.diaChi;
  const mapUrl = mapQuery ? `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}` : null;

  function saveRoom() {
    const next = saved ? favorites.filter((id) => id !== room._id) : [...favorites, room._id];
    setFavorites(next);
    try { localStorage.setItem("unihome:saved-rooms", JSON.stringify(next)); setMessage(saved ? "Đã bỏ lưu phòng." : "Đã lưu phòng trên trình duyệt này."); }
    catch { setMessage("Đã cập nhật trong phiên này; trình duyệt không cho phép lưu lâu dài."); }
  }
  async function shareRoom() {
    try {
      if (navigator.share) await navigator.share({ title: room.tenPhong, url: window.location.href });
      else { await navigator.clipboard.writeText(window.location.href); setMessage("Đã sao chép đường dẫn phòng."); }
    } catch (error) { if (error.name !== "AbortError") setMessage("Bạn có thể sao chép đường dẫn trên thanh địa chỉ để chia sẻ."); }
  }

  const facts = [
    { label: "Diện tích sử dụng", value: `${room.dienTich} m²`, icon: "area" },
    { label: "Số người ở tối đa", value: room.soNguoiToiDa != null ? `${room.soNguoiToiDa} người` : "Chưa cập nhật", icon: "user" },
    { label: "Vị trí phòng", value: room.tang != null ? `Tầng ${room.tang}${building?.soTang ? ` / ${building.soTang} tầng` : ""}` : "Chưa cập nhật", icon: "building" },
    { label: "Loại hình", value: room.loaiPhong === "phong_tro" ? "Phòng trọ" : room.loaiPhong || "Chưa cập nhật", icon: "pin" },
  ];
  return (
    <>
      <nav aria-label="Đường dẫn trang" className="mb-6 flex flex-wrap items-center gap-2 text-[11px] text-slate-500"><Link to="/" className="hover:text-blue-600">⌂ Trang chủ</Link><span aria-hidden="true">›</span><Link to="/?page=rooms" className="hover:text-blue-600">Tìm phòng trọ</Link>{building?.khuVuc && <><span aria-hidden="true">›</span><span>{building.khuVuc}</span></>}<span aria-hidden="true">›</span><span className="max-w-72 truncate font-medium text-slate-800" aria-current="page">{room.tenPhong}</span></nav>
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div className="max-w-4xl"><div className="mb-3 flex flex-wrap items-center gap-3"><span className={`rounded-full px-3 py-1 text-[11px] font-medium ${status.color}`}>● {status.label}</span><span className="text-[11px] text-slate-400">Mã tin: {room.maPhong}</span></div><h1 className="text-2xl leading-snug font-bold tracking-tight text-[#14243e] lg:text-[30px]">{room.tenPhong}</h1><p className="mt-3 flex flex-wrap items-center gap-2 text-xs leading-relaxed text-slate-500"><Icon name="pin" className="size-4! text-blue-600" />{building?.diaChi || room.maCoSo}{mapUrl && <a href="#room-location" className="text-blue-600 hover:underline">· Xem vị trí trên bản đồ ↗</a>}</p></div>
        <div className="flex shrink-0 gap-2"><button onClick={shareRoom} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-600 hover:bg-blue-50">Chia sẻ ↗</button><button onClick={saveRoom} aria-pressed={saved} className={`flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs hover:bg-blue-50 ${saved ? "text-rose-500" : "text-slate-600"}`}><Icon name="heart" className={`size-3.5! ${saved ? "fill-rose-100!" : ""}`} />{saved ? "Đã lưu" : "Lưu tin"}</button></div>
      </div>
      {message && <p role="status" className="mb-4 text-xs text-blue-700">{message}</p>}
      <RoomGallery room={room} />
      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_370px]">
        <div className="min-w-0 space-y-6">
          <section aria-label="Thông số phòng" className="grid grid-cols-2 gap-y-5 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-4">{facts.map((fact) => <div key={fact.label} className="flex items-center gap-3 px-2"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600"><Icon name={fact.icon} className="size-[19px]!" /></span><div><p className="text-[10px] text-slate-500">{fact.label}</p><p className="mt-1 text-xs leading-relaxed font-bold">{fact.value}</p></div></div>)}</section>
          <RoomCosts room={room} />
          <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:p-6" aria-labelledby="amenities-heading"><div className="flex items-center justify-between gap-3"><h2 id="amenities-heading" className="border-l-4 border-blue-600 pl-3 text-base font-bold">Nội thất & Tiện ích sẵn có</h2><span className="text-[10px] text-slate-400">{amenities.length} tiện ích</span></div>{amenities.length ? <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">{amenities.map((amenity) => <li key={amenity} className="flex items-center gap-2 rounded-xl border border-slate-100 bg-[#f8faff] p-3 text-xs leading-relaxed"><span className="grid size-7 shrink-0 place-items-center rounded-lg bg-white text-blue-600">✓</span>{amenity}</li>)}</ul> : <p className="mt-4 text-sm text-slate-500">Tiện ích đang được cập nhật.</p>}</section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:p-6" aria-labelledby="description-heading"><h2 id="description-heading" className="border-l-4 border-blue-600 pl-3 text-base font-bold">Mô tả chi tiết phòng</h2><p className="mt-5 text-sm leading-7 whitespace-pre-line text-slate-600">{room.moTa || "Thông tin mô tả phòng đang được cập nhật."}</p>{building?.noiQuy?.length > 0 && <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/60 p-4"><h3 className="text-sm font-semibold text-blue-800">Nội quy tại cơ sở</h3><ul className="mt-3 space-y-2 text-xs leading-relaxed text-slate-600">{building.noiQuy.map((rule) => <li key={rule}>• {rule}</li>)}</ul></div>}</section>
          <section id="room-location" className="scroll-mt-6 rounded-2xl border border-slate-200 bg-white p-5 lg:p-6" aria-labelledby="location-heading"><div className="flex items-center justify-between gap-4"><h2 id="location-heading" className="border-l-4 border-blue-600 pl-3 text-base font-bold">Vị trí phòng & Bản đồ giao thông</h2>{mapUrl && <a href={mapUrl} target="_blank" rel="noreferrer" className="shrink-0 text-[10px] text-blue-600 hover:underline">Mở trên Google Maps ↗</a>}</div>{mapQuery ? <iframe title={`Bản đồ vị trí ${room.tenPhong}`} src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=16&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="mt-5 h-72 w-full rounded-xl border border-slate-200" /> : <p className="mt-4 text-sm text-slate-500">Vị trí đang được cập nhật.</p>}<p className="mt-3 text-xs text-slate-500">{building?.diaChi}</p></section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:p-6" aria-labelledby="reviews-heading"><h2 id="reviews-heading" className="border-l-4 border-blue-600 pl-3 text-base font-bold">Đánh giá từ khách thuê</h2><p className="mt-5 rounded-xl bg-slate-50 p-5 text-sm text-slate-500">Phòng này chưa có đánh giá được đăng tải.</p></section>
        </div>
        <RoomVisitCard room={room} />
      </div>
    </>
  );
}

export default function RoomDetailPage() {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!loading && room && window.location.hash === "#visit-room") {
      const frame = requestAnimationFrame(() => document.getElementById("visit-room")?.scrollIntoView({ behavior: "smooth", block: "start" }));
      return () => cancelAnimationFrame(frame);
    }
  }, [loading, room]);
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(new DOMException("Timeout", "TimeoutError")), 15000);
    setLoading(true); setError(""); setRoom(null);
    document.title = "Chi tiết phòng | UniHome";
    getRoomDetails(id, controller.signal).then((data) => { if (!controller.signal.aborted) { setRoom(data); document.title = `${data.tenPhong} | UniHome`; } }).catch((error) => {
      if (!controller.signal.aborted || controller.signal.reason?.name === "TimeoutError") setError(controller.signal.reason?.name === "TimeoutError" ? "Kết nối quá lâu. Vui lòng thử lại." : error.message);
    }).finally(() => { clearTimeout(timeout); if (!controller.signal.aborted || controller.signal.reason?.name === "TimeoutError") setLoading(false); });
    return () => { clearTimeout(timeout); controller.abort(); };
  }, [id, retry]);
  return (
    <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8" aria-busy={loading}>
      {loading ? <div role="status" className="space-y-5"><p className="text-sm text-slate-500">Đang tải thông tin phòng…</p><div className="h-14 w-3/4 animate-pulse rounded-xl bg-slate-200" /><div className="h-[450px] animate-pulse rounded-2xl bg-slate-200" /></div> : error ? <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center"><h1 className="text-xl font-bold">Chưa thể hiển thị phòng</h1><p role="alert" className="mt-3 text-sm text-slate-500">{error}</p><div className="mt-6 flex justify-center gap-4"><Link to="/" className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white">Về trang chủ</Link><button onClick={() => setRetry(retry + 1)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm">Thử lại</button></div></div> : room && <DetailContent key={room._id} room={room} />}
    </main>
  );
}

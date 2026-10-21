import { useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../common/Icon";
import { formatRent, roomStatuses } from "./RoomCard";

export default function FavoriteRoomCard({ room, onRemove }) {
  const [failed, setFailed] = useState(false);
  const status = roomStatuses[room.trangThai] || { label: "Chưa cập nhật" };
  const available = room.trangThai === "con_trong";
  const address = room.building?.diaChi || room.maCoSo;
  return <article className="flex h-full flex-col overflow-hidden rounded-xl border border-[#e0e6ef] bg-white transition-shadow hover:shadow-md">
    <div className="relative aspect-[1.6] overflow-hidden bg-slate-100">
      <Link to={`/rooms/${room._id}`} className="block size-full" aria-label={`Xem ${room.tenPhong}`}>
        {room.hinhAnh?.[0] && !failed ? <img src={room.hinhAnh[0]} alt={room.tenPhong} onError={() => setFailed(true)} loading="lazy" className="size-full object-cover transition-transform duration-300 hover:scale-105" /> : <span className="flex size-full flex-col items-center justify-center gap-2 text-xs text-slate-400"><Icon name="building" className="size-10!" />Chưa có hình ảnh</span>}
      </Link>
      <span className={`absolute top-3 left-3 rounded border bg-white/95 px-2 py-1 text-[10px] font-medium ${available ? "border-emerald-200 text-emerald-700" : "border-slate-200 text-slate-600"}`}>● {status.label}</span>
      <button type="button" onClick={onRemove} aria-label={`Bỏ lưu ${room.tenPhong}`} aria-pressed="true" className="absolute top-3 right-3 grid size-8 place-items-center rounded-full bg-white/95 text-red-600 shadow-sm transition hover:scale-110 hover:bg-red-50"><Icon name="heart" className="size-[17px]! fill-red-600!" /></button>
      <span className="absolute bottom-2 left-2 rounded bg-slate-900/65 px-2 py-1 text-[10px] text-white">Mã phòng: {room.maPhong}</span>
    </div>
    <div className="flex flex-1 flex-col p-3.5 sm:p-4">
      <h2><Link to={`/rooms/${room._id}`} className="line-clamp-2 text-[13px] leading-5 font-semibold text-[#162b47] hover:text-sky-700">{room.tenPhong}</Link></h2>
      <p className="mt-1.5 flex items-start gap-1 text-[10px] leading-5 text-slate-500"><Icon name="pin" className="mt-0.5 size-3! shrink-0" /><span className="line-clamp-1" title={address}>{address}</span></p>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-y border-slate-100 py-3"><p className="text-[23px] leading-none font-bold tracking-tight text-[#0075a8]">{formatRent(room.giaThue)}<span className="ml-1 text-[10px] font-normal tracking-normal text-slate-500">đ/tháng</span></p><span className="flex items-center gap-1 text-[10px] text-slate-600"><Icon name="area" className="size-3!" />{room.dienTich} m²{room.tang != null && ` · Tầng ${room.tang}`}</span></div>
      <ul className="my-3 flex min-h-6 flex-wrap gap-1.5" aria-label="Tiện ích">{(room.tienIch || []).slice(0, 3).map((item) => <li key={item} className="rounded bg-[#f0f4fc] px-2 py-1 text-[10px] text-slate-600">{item}</li>)}</ul>
      <div className="mt-auto flex gap-2"><Link to={`/rooms/${room._id}`} className="flex flex-1 items-center justify-center rounded-lg border border-[#dfe7f2] px-3 py-2.5 text-xs font-medium text-[#18304d] hover:bg-slate-50">Xem chi tiết</Link>{available && <Link to={`/rooms/${room._id}#visit-room`} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#006c9e] px-3 py-2.5 text-xs font-medium text-white hover:bg-sky-800"><Icon name="calendar" className="size-3.5!" />Đặt lịch xem</Link>}</div>
    </div>
  </article>;
}

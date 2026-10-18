import { Link } from "react-router-dom";
import { useState } from "react";
import Icon from "../common/Icon";

export const formatRent = (value) => new Intl.NumberFormat("vi-VN").format(value);
export const roomStatuses = {
  con_trong: { label: "Còn trống", color: "bg-[#85f5cb] text-[#064b3a]" },
  sap_trong: { label: "Sắp trống", color: "bg-[#ffdbdb] text-[#b32129]" },
  da_thue: { label: "Đã thuê", color: "bg-slate-200 text-slate-700" },
};

export default function RoomCard({ room, saved, onSave }) {
  const [failedImage, setFailedImage] = useState(false);
  const status = roomStatuses[room.trangThai] || { label: "Chưa cập nhật", color: "bg-slate-100 text-slate-600" };
  const address = room.building?.diaChi || room.building?.khuVuc || room.maCoSo;
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-[#e0e5ee] bg-white shadow-[0_1px_2px_#162d4910] transition-shadow hover:shadow-md">
      <div className="relative aspect-[1.6] overflow-hidden bg-slate-100">
        <Link className="block size-full text-slate-400" to={`/rooms/${room._id}`} aria-label={`Xem ảnh và chi tiết ${room.tenPhong}`}>
          {room.hinhAnh?.[0] && !failedImage ? <img className="size-full object-cover transition-transform duration-300 hover:scale-[1.03]" src={room.hinhAnh[0]} alt={room.tenPhong} loading="lazy" onError={() => setFailedImage(true)} /> : <span className="flex size-full flex-col items-center justify-center gap-2 text-xs"><Icon name="building" className="size-10!" />Chưa có hình ảnh</span>}
        </Link>
        <span className={`pointer-events-none absolute top-3 left-3 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${status.color}`}><span className="size-1.5 rounded-full bg-current" />{status.label}</span>
        <button type="button" className={`absolute top-3 right-3 grid size-8 place-items-center rounded-full bg-white/95 shadow-sm transition hover:scale-105 ${saved ? "text-rose-500" : "text-slate-600"}`} aria-label={saved ? `Bỏ lưu ${room.tenPhong}` : `Lưu ${room.tenPhong}`} aria-pressed={saved} onClick={onSave}><Icon name="heart" className={`size-[18px]! ${saved ? "fill-rose-100!" : ""}`} /></button>
        <span className="pointer-events-none absolute bottom-2 left-2 rounded bg-[#26374dcc] px-2 py-1 font-mono text-[10px] text-white">Mã: {room.maPhong}</span>
      </div>
      <div className="flex-1 p-4">
        <h3><Link to={`/rooms/${room._id}`} className="block w-full truncate text-left text-sm font-semibold text-[#142a47] hover:text-sky-700" title={room.tenPhong}>{room.tenPhong}</Link></h3>
        <p className="mt-1.5 flex items-start gap-1 text-[11px] leading-relaxed text-[#556174]"><Icon name="pin" className="mt-0.5 size-3! shrink-0 text-[#0078b6]" /><span className="line-clamp-1" title={address}>{address}</span></p>
        <ul className="mt-3 flex min-h-11 flex-wrap content-start gap-1.5" aria-label="Tiện ích phòng">
          {(room.tienIch || []).slice(0, 3).map((amenity) => <li key={amenity} className="rounded border border-[#e0e7f3] bg-[#eff4ff] px-1.5 py-0.5 text-[10px] text-[#4b586b]">{amenity}</li>)}
        </ul>
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-[#edf0f5] px-4 py-3">
        <div><p className="text-lg leading-tight font-bold tracking-tight text-[#0072ac]">{formatRent(room.giaThue)} <span className="text-[10px] font-normal tracking-normal text-slate-600">đ/tháng</span></p><p className="mt-1 flex items-center gap-1 text-[10px] text-[#42516a]"><Icon name="area" className="size-3!" />{room.dienTich} m²{room.tang != null ? ` · Tầng ${room.tang}` : ""}</p></div>
        <Link to={`/rooms/${room._id}`} className="flex shrink-0 items-center gap-1 rounded-md bg-[#e5efff] px-2.5 py-2 text-xs font-medium text-[#0072ac] hover:bg-blue-100">Xem chi tiết<Icon name="arrow" className="size-3.5!" /></Link>
      </div>
    </article>
  );
}

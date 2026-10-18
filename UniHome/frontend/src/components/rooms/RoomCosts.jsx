import Icon from "../common/Icon";
import { formatRent } from "./RoomCard";

export default function RoomCosts({ room }) {
  const building = room.building;
  const electricity = room.giaDien ?? building?.giaDien;
  const water = room.giaNuoc ?? building?.giaNuoc;
  const deposit = building?.tienCocThang;
  const rows = [
    { name: "Tiền điện sinh hoạt", price: electricity != null ? `${formatRent(electricity)} đ / kWh` : "Chưa cập nhật", note: "Theo mức giá của cơ sở", icon: "bolt" },
    { name: "Tiền nước sinh hoạt", price: water != null ? `${formatRent(water)} đ${building?.donViNuoc ? ` / ${building.donViNuoc}` : ""}` : "Chưa cập nhật", note: "Theo đơn vị tính do cơ sở công bố", icon: "money" },
    { name: "Internet & dịch vụ chung", price: "Liên hệ cơ sở", note: "Chưa có đơn giá trong thông tin phòng", icon: "bot" },
    { name: "Tiền đặt cọc phòng", price: deposit != null ? `${formatRent(room.giaThue * deposit)} đ` : "Chưa cập nhật", note: deposit != null ? `Tương đương ${deposit} tháng tiền thuê` : "Xác nhận khi ký hợp đồng", icon: "shield" },
    { name: "Thời hạn hợp đồng", price: "Thỏa thuận", note: "Trao đổi trực tiếp với cơ sở", icon: "document" },
  ];
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:p-6" aria-labelledby="costs-heading">
      <h2 id="costs-heading" className="border-l-4 border-blue-600 pl-3 text-base font-bold">Chi phí sinh hoạt & Hợp đồng</h2>
      <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[450px] text-left text-xs"><thead className="bg-slate-50 text-[10px] font-medium tracking-wide text-slate-500"><tr><th className="p-3 font-medium">KHOẢN MỤC CHI PHÍ</th><th className="p-3 font-medium">ĐƠN GIÁ ÁP DỤNG</th><th className="p-3 text-right font-medium">GHI CHÚ / PHƯƠNG THỨC TÍNH</th></tr></thead><tbody>{rows.map((row) => <tr key={row.name} className="border-b border-slate-100 last:border-0"><td className="p-3"><span className="flex items-center gap-2"><Icon name={row.icon} className="size-4! text-blue-500" />{row.name}</span></td><td className="p-3 font-semibold">{row.price}</td><td className="p-3 text-right leading-relaxed text-slate-500">{row.note}</td></tr>)}</tbody></table></div>
    </section>
  );
}

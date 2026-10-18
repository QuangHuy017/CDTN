import Icon from "../common/Icon";

export const defaultRegions = ["Cầu Giấy", "Thanh Xuân", "Hà Đông", "Hoàng Mai", "Nam Từ Liêm"];

export default function RoomSearchForm({ filters, onChange, onSearch, regions, loading }) {
  const selectClass = "h-11 w-full rounded-lg border border-[#dce3ed] bg-white px-3 text-sm text-[#1d3856] outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100";
  return (
    <section className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm lg:p-7" aria-labelledby="search-heading">
      <h1 id="search-heading" className="text-2xl leading-tight font-bold tracking-tight text-[#0c203b] lg:text-[32px]">UniHome – Tìm phòng trọ phù hợp với bạn</h1>
      <p className="mt-2 text-sm text-[#50647f]">Tìm kiếm phòng cho thuê nhanh chóng, dễ dàng với sự hỗ trợ của trí tuệ nhân tạo.</p>
      <form className="mt-6 grid items-end gap-4 sm:grid-cols-2 lg:grid-cols-4" onSubmit={(event) => { event.preventDefault(); onSearch(); }}>
        <label className="space-y-1.5 text-xs text-[#163b61]">
          <span className="flex items-center gap-1"><Icon name="pin" className="size-3.5! text-[#0074c8]" />Địa điểm</span>
          <select className={selectClass} value={filters.khuVuc} onChange={(event) => onChange({ ...filters, khuVuc: event.target.value })}>
            <option value="">Tất cả khu vực</option>
            {regions.map((region) => <option key={region} value={region}>Quận {region}</option>)}
          </select>
        </label>
        <label className="space-y-1.5 text-xs text-[#163b61]">
          <span className="flex items-center gap-1"><Icon name="money" className="size-3.5! text-[#0074c8]" />Khoảng giá</span>
          <select className={selectClass} value={filters.price} onChange={(event) => onChange({ ...filters, price: event.target.value })}>
            <option value="">Tất cả mức giá</option><option value="0-3000000">Dưới 3 triệu</option><option value="3000000-5000000">3 - 5 triệu</option><option value="5000000-8000000">5 - 8 triệu</option><option value="8000000-">Trên 8 triệu</option>
          </select>
        </label>
        <label className="space-y-1.5 text-xs text-[#163b61]">
          <span className="flex items-center gap-1"><Icon name="area" className="size-3.5! text-[#0074c8]" />Diện tích</span>
          <select className={selectClass} value={filters.area} onChange={(event) => onChange({ ...filters, area: event.target.value })}>
            <option value="">Tất cả diện tích</option><option value="0-20">Dưới 20 m²</option><option value="20-30">20 - 30 m²</option><option value="30-40">30 - 40 m²</option><option value="40-">Trên 40 m²</option>
          </select>
        </label>
        <button className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#006b9d] px-5 text-sm font-semibold text-white transition hover:bg-[#005881] disabled:opacity-60" disabled={loading}><Icon name="search" className="size-4!" />{loading ? "Đang tìm…" : "Tìm phòng"}</button>
      </form>
    </section>
  );
}

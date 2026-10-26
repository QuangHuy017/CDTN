import { useState } from "react";

const defaults = ["Wifi", "Nhà vệ sinh riêng", "Điều hòa", "Bình nóng lạnh", "Giường", "Tủ quần áo", "Bàn học", "Ban công", "Máy giặt chung", "Máy giặt riêng", "Tủ lạnh", "Khu bếp", "Chỗ để xe", "Thang máy", "Camera an ninh", "Giờ giấc tự do"];

export default function AmenityPicker({ value, onChange }) {
  const [custom, setCustom] = useState("");
  const [extra, setExtra] = useState([]);
  const options = [...new Set([...defaults, ...extra, ...value])];
  function add() {
    const name = custom.trim(); if (!name) return;
    setExtra((items) => [...new Set([...items, name])]);
    onChange([...new Set([...value, name])]); setCustom("");
  }
  return <fieldset className="rounded-xl border border-slate-200 p-4 sm:col-span-2"><legend className="px-1 text-xs font-semibold">Tiện ích của phòng ({value.length} đã chọn)</legend>
    <div className="grid gap-2 sm:grid-cols-2">{options.map((name) => <label key={name} className={`flex cursor-pointer items-center gap-2 rounded-lg border p-2.5 text-xs ${value.includes(name) ? "border-sky-300 bg-sky-50 text-sky-800" : "border-slate-200 text-slate-600"}`}><input type="checkbox" checked={value.includes(name)} onChange={(event) => onChange(event.target.checked ? [...value, name] : value.filter((item) => item !== name))} className="size-4 accent-sky-700" /><span>{name}</span></label>)}</div>
    <div className="mt-3 flex gap-2"><input aria-label="Tiện ích khác" maxLength={300} className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs" value={custom} onChange={(event) => setCustom(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); add(); } }} placeholder="Thêm tiện ích khác…" /><button type="button" onClick={add} disabled={!custom.trim()} className="rounded-lg border border-slate-200 px-3 py-2 text-xs disabled:opacity-40">Thêm</button></div>
  </fieldset>;
}

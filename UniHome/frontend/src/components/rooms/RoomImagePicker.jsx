import { useEffect, useMemo, useState } from "react";

export default function RoomImagePicker({ urls, files, onUrlsChange, onFilesChange }) {
  const [error, setError] = useState("");
  const previews = useMemo(() => files.map((file) => ({ file, url: URL.createObjectURL(file) })), [files]);
  useEffect(() => () => previews.forEach((item) => URL.revokeObjectURL(item.url)), [previews]);
  const existing = urls.split("\n").map((url) => url.trim()).filter(Boolean);
  function select(event) {
    const selected = Array.from(event.target.files || []); event.target.value = ""; setError("");
    if (files.length + selected.length > 10 || existing.length + files.length + selected.length > 100) { setError("Chọn tối đa 10 ảnh mới mỗi lần lưu, tổng cộng tối đa 100 ảnh/phòng."); return; }
    if (selected.some((file) => !["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024)) { setError("Chọn ảnh JPG, PNG hoặc WebP, mỗi ảnh tối đa 5 MB."); return; }
    onFilesChange([...files, ...selected]);
  }
  return <fieldset className="rounded-xl border border-slate-200 p-4 sm:col-span-2"><legend className="px-1 text-xs font-semibold">Ảnh phòng ({existing.length + files.length})</legend>
    <label className="block text-xs font-medium text-sky-800">Chọn nhiều ảnh từ máy<input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={select} className="mt-2 block w-full text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-sky-50 file:px-3 file:py-2 file:font-semibold file:text-sky-800" /></label>
    <p className="mt-2 text-[11px] leading-5 text-slate-500">Có thể chọn nhiều file cùng lúc. Tối đa 10 ảnh mới/lần lưu, 5 MB/ảnh. Ảnh được tải lên khi bấm Lưu phòng; ảnh đầu tiên là ảnh đại diện.</p>
    {error && <p role="alert" className="mt-2 text-xs text-red-600">{error}</p>}
    {(existing.length > 0 || files.length > 0) && <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">{existing.map((url, index) => <div key={`${url}-${index}`} className="overflow-hidden rounded-lg border border-slate-200"><img src={url} alt={`Ảnh phòng ${index + 1}`} className="aspect-[4/3] w-full object-cover" /><button type="button" onClick={() => onUrlsChange(existing.filter((_, i) => i !== index).join("\n"))} className="w-full py-2 text-[11px] text-red-600" aria-label={`Bỏ ảnh hiện có ${index + 1}`}>Bỏ ảnh</button></div>)}{previews.map(({ file, url }, index) => <div key={url} className="overflow-hidden rounded-lg border border-sky-200"><img src={url} alt={`Ảnh mới ${index + 1}: ${file.name}`} className="aspect-[4/3] w-full object-cover" /><p className="truncate px-2 pt-1 text-[10px] text-slate-500">{file.name}</p><button type="button" onClick={() => onFilesChange(files.filter((_, i) => i !== index))} className="w-full py-2 text-[11px] text-red-600" aria-label={`Bỏ ảnh mới ${index + 1}`}>Bỏ ảnh</button></div>)}</div>}
    <details className="mt-3"><summary className="cursor-pointer text-xs text-slate-500">Hoặc nhập đường dẫn ảnh</summary><label className="mt-2 block text-xs">Đường dẫn ảnh (mỗi dòng một ảnh)<textarea rows={3} value={urls} onChange={(event) => onUrlsChange(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs" /></label></details>
  </fieldset>;
}

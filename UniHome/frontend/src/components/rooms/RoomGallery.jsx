import { useEffect, useRef, useState } from "react";
import Icon from "../common/Icon";

function GalleryImage({ src, alt, className = "" }) {
  const [failed, setFailed] = useState(false);
  return src && !failed ? <img src={src} alt={alt} className={`size-full object-cover ${className}`} onError={() => setFailed(true)} /> : <span className="flex size-full flex-col items-center justify-center gap-2 bg-slate-100 text-xs text-slate-400"><Icon name="building" className="size-10!" />Chưa có hình ảnh</span>;
}

function ImageViewer({ images, initial, name, onClose }) {
  const dialog = useRef(null);
  const [index, setIndex] = useState(initial);
  useEffect(() => {
    const previous = document.activeElement;
    dialog.current.showModal();
    const element = dialog.current;
    return () => { element.close(); previous?.focus(); };
  }, []);
  return (
    <dialog ref={dialog} onCancel={(event) => { event.preventDefault(); onClose(); }} aria-label={`Hình ảnh ${name}`} className="fixed inset-0 m-auto w-[calc(100%_-_32px)] max-w-5xl overflow-hidden rounded-2xl bg-white p-4 text-slate-800 shadow-2xl backdrop:bg-slate-950/75">
      <div className="mb-3 flex items-center justify-between gap-3"><p className="truncate text-sm font-semibold">{name} · {index + 1}/{images.length}</p><button onClick={onClose} aria-label="Đóng bộ ảnh" className="rounded-full bg-slate-100 p-2"><Icon name="close" /></button></div>
      <div className="h-[65vh]"><GalleryImage key={index} src={images[index]} alt={`${name}, ảnh ${index + 1}`} className="object-contain!" /></div>
      {images.length > 1 && <div className="mt-4 flex justify-between"><button className="rounded-lg bg-slate-100 px-4 py-2 text-sm" onClick={() => setIndex((index + images.length - 1) % images.length)}>← Ảnh trước</button><button className="rounded-lg bg-blue-50 px-4 py-2 text-sm text-blue-700" onClick={() => setIndex((index + 1) % images.length)}>Ảnh sau →</button></div>}
    </dialog>
  );
}

export default function RoomGallery({ room }) {
  const [selected, setSelected] = useState(null);
  const images = room.hinhAnh || [];
  return (
    <section aria-label="Hình ảnh phòng" className="rounded-2xl border border-slate-200 bg-white p-1.5">
      <div className="grid h-[280px] grid-cols-1 gap-1.5 overflow-hidden rounded-xl sm:h-[400px] sm:grid-cols-4 lg:h-[470px]">
        <button disabled={!images.length} onClick={() => setSelected(0)} className="relative overflow-hidden sm:col-span-2" aria-label="Mở ảnh chính của phòng"><GalleryImage src={images[0]} alt={room.tenPhong} /><span className="absolute bottom-3 left-3 rounded-full bg-slate-900/70 px-3 py-1.5 text-[10px] text-white">Hình ảnh phòng từ UniHome</span></button>
        <button disabled={images.length < 2} onClick={() => setSelected(1)} className="hidden overflow-hidden sm:block" aria-label="Mở ảnh thứ hai"><GalleryImage src={images[1]} alt={`${room.tenPhong}, ảnh 2`} /></button>
        <div className="hidden grid-rows-2 gap-1.5 sm:grid">
          <button disabled={images.length < 3} onClick={() => setSelected(2)} className="min-h-0 overflow-hidden" aria-label="Mở ảnh thứ ba"><GalleryImage src={images[2]} alt={`${room.tenPhong}, ảnh 3`} /></button>
          <button disabled={!images.length} onClick={() => setSelected(Math.min(3, images.length - 1))} className="relative min-h-0 overflow-hidden" aria-label={`Xem tất cả ${images.length} ảnh`}><GalleryImage src={images[3] || images[0]} alt={`${room.tenPhong}, ảnh bổ sung`} /><span className="absolute inset-0 flex items-center justify-center bg-slate-950/45 text-xs font-medium text-white">▧ Xem tất cả {images.length} ảnh</span></button>
        </div>
      </div>
      {selected !== null && <ImageViewer images={images} initial={selected} name={room.tenPhong} onClose={() => setSelected(null)} />}
    </section>
  );
}

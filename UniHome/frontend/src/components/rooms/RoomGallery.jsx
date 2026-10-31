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
    <section aria-label="Hình ảnh phòng" className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
      <div className={`grid h-[280px] min-h-0 gap-2 overflow-hidden rounded-xl sm:h-[360px] lg:h-[420px] ${images.length > 1 ? "sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]" : "grid-cols-1"}`}>
        <button disabled={!images.length} onClick={() => setSelected(0)} className="group relative min-h-0 min-w-0 overflow-hidden bg-slate-100" aria-label="Mở ảnh chính của phòng">
          <GalleryImage key={images[0]} src={images[0]} alt={room.tenPhong} className="transition-transform duration-500 group-hover:scale-[1.03]" />
          <span className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/60 to-transparent" />
          <span className="absolute bottom-4 left-4 text-xs font-medium text-white">Hình ảnh thực tế phòng</span>
        </button>
        {images.length > 1 && <div className={`hidden min-h-0 min-w-0 gap-2 sm:grid ${images.length > 2 ? "grid-rows-[minmax(0,1fr)_minmax(0,1fr)]" : "grid-rows-[minmax(0,1fr)]"}`}>
          {images.slice(1, 3).map((src, index) => <button key={`${src}-${index}`} onClick={() => setSelected(index + 1)} className="group relative min-h-0 min-w-0 overflow-hidden bg-slate-100" aria-label={`Mở ảnh thứ ${index + 2}`}>
            <GalleryImage src={src} alt={`${room.tenPhong}, ảnh ${index + 2}`} className="transition-transform duration-500 group-hover:scale-[1.03]" />
            {index === 1 && images.length > 3 && <span className="absolute right-3 bottom-3 rounded-lg bg-slate-950/65 px-3 py-2 text-xs font-medium text-white">+{images.length - 3} ảnh</span>}
          </button>)}
        </div>}
      </div>
      {selected !== null && <ImageViewer images={images} initial={selected} name={room.tenPhong} onClose={() => setSelected(null)} />}
    </section>
  );
}

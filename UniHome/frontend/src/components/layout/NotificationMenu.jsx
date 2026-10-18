import { useEffect, useId, useRef, useState } from "react";
import Icon from "../common/Icon";
export default function NotificationMenu() {
  const [open, setOpen] = useState(false);
  const wrapper = useRef(null);
  const button = useRef(null);
  const panelId = useId();
  const titleId = useId();
  useEffect(() => {
    if (!open) return;
    function onPointerDown(event) {
      if (!wrapper.current?.contains(event.target)) setOpen(false);
    }
    function onKeyDown(event) {
      if (event.key === "Escape") { setOpen(false); button.current?.focus(); }
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);
  return (
    <div className="notification-wrap" ref={wrapper}>
      <button ref={button} className="notification-button" type="button" aria-label="Xem thông báo" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen(!open)}><Icon name="bell" /></button>
      <section className="notification-panel" id={panelId} aria-labelledby={titleId} hidden={!open}>
        <h2 id={titleId}>Thông báo</h2>
        <div className="notification-empty"><Icon name="bell" /><p>Bạn chưa có thông báo mới.</p></div>
      </section>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
const emptyRooms = [];

export function buildingPosition(building) {
  const c = building?.toaDo?.coordinates;
  return Array.isArray(c) && c.length === 2 && c.every(Number.isFinite) && Math.abs(c[0]) <= 180 && Math.abs(c[1]) <= 90 ? [c[1], c[0]] : null;
}

export default function BuildingMap({ buildings, center, radiusKm, onPick, rooms = emptyRooms, labels = false, selectedCode, onSelect, className = "h-[440px] rounded-xl" }) {
  const container = useRef(null), map = useRef(null), layers = useRef(null), pick = useRef(onPick);
  const [tileError, setTileError] = useState(false);
  pick.current = onPick;
  useEffect(() => {
    const instance = L.map(container.current, { zoomAnimation: false, fadeAnimation: false }).setView([21.0285, 105.8542], 12);
    map.current = instance;
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' })
      .on("loading", () => setTileError(false)).on("tileerror", () => setTileError(true)).addTo(instance);
    layers.current = L.featureGroup().addTo(instance);
    instance.on("click", (event) => pick.current?.([event.latlng.lat, event.latlng.lng]));
    const observer = new ResizeObserver(() => instance.invalidateSize());
    observer.observe(container.current);
    return () => { observer.disconnect(); instance.remove(); map.current = null; };
  }, []);
  useEffect(() => {
    const group = layers.current;
    group.clearLayers();
    for (const building of buildings) {
      const position = buildingPosition(building);
      if (!position) continue;
      const popup = document.createElement("div");
      const heading = document.createElement("strong"); heading.textContent = building.tenCoSo; popup.append(heading);
      const address = document.createElement("p"); address.textContent = building.diaChi; popup.append(address);
      for (const room of rooms.filter((item) => item.maCoSo === building.maCoSo)) {
        const link = document.createElement("a"); link.href = `/rooms/${room._id}`; link.textContent = `${room.tenPhong} · ${new Intl.NumberFormat("vi-VN").format(room.giaThue)} đ/tháng`; link.style.display = "block"; popup.append(link);
      }
      const marker = L.marker(position, { title: building.tenCoSo, icon: L.divIcon({ className: "", html: '<span style="display:block;background:#0369a1;color:white;border:2px solid white;border-radius:50%;width:28px;height:28px;text-align:center;line-height:24px;box-shadow:0 2px 6px #0005">⌂</span>', iconSize: [28, 28], iconAnchor: [14, 14] }) }).addTo(group);
      if (labels) {
        const label = document.createElement("div");
        const title = document.createElement("strong"); title.textContent = building.tenCoSo; label.append(title);
        const hint = document.createElement("span"); hint.textContent = "Xem phòng →"; hint.style.cssText = "display:block;font-size:11px;margin-top:4px;color:#0284c7"; label.append(hint);
        marker.bindTooltip(label, { permanent: true, interactive: true, direction: "top", offset: [0, -18], className: `unihome-map-label ${selectedCode === building.maCoSo ? "is-selected" : ""}` });
        marker.getTooltip().on("click", () => onSelect?.(building.maCoSo));
        marker.on("click", () => onSelect?.(building.maCoSo));
      } else marker.bindPopup(popup, { maxHeight: 240 });
    }
    if (center) {
      L.circleMarker(center, { radius: 7, color: "#e11d48", fillOpacity: 1 }).bindTooltip("Điểm tìm kiếm").addTo(group);
      if (radiusKm) L.circle(center, { radius: radiusKm * 1000, color: "#0284c7", weight: 2, fillOpacity: 0.08 }).addTo(group);
    }
    if (group.getLayers().length) map.current.fitBounds(group.getBounds(), { paddingTopLeft: labels ? [90, 100] : [25, 25], paddingBottomRight: labels ? [90, 75] : [25, 25], maxZoom: 16, animate: false });
    const selected = buildings.find((building) => building.maCoSo === selectedCode);
    if (selected && buildingPosition(selected)) map.current.setView(buildingPosition(selected), 15, { animate: false });
  }, [buildings, rooms, center, radiusKm, labels, selectedCode, onSelect]);
  return <div className="relative h-full"><div ref={container} role="region" aria-label="Bản đồ OpenStreetMap các tòa nhà" className={`relative z-0 w-full ${className}`} />{tileError && <p role="status" className="absolute bottom-8 left-3 z-[400] rounded bg-white p-2 text-xs text-amber-700">Chưa tải được nền bản đồ. Hãy kiểm tra kết nối Internet.</p>}</div>;
}

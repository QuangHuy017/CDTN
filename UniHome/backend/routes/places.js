const express = require("express");
const Building = require("../models/Building");
const { rateLimit } = require("express-rate-limit");
const cache = new Map();
let busy = false, lastRequest = 0;
function distanceKm(a, b) {
  const rad = (n) => n * Math.PI / 180;
  const dLat = rad(b[1] - a[1]), dLng = rad(b[0] - a[0]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a[1])) * Math.cos(rad(b[1])) * Math.sin(dLng / 2) ** 2;
  return 6371.0088 * 2 * Math.asin(Math.sqrt(Math.min(1, h)));
}
module.exports = function places({ buildings = Building, fetcher = fetch } = {}) {
  const router = express.Router();
  router.use(rateLimit({ windowMs: 60000, limit: 30, message: { message: "Bạn tìm quá nhanh. Vui lòng thử lại sau một phút." } }));
  router.get("/search", async (req, res) => {
    const q = req.query.q;
    if (typeof q !== "string" || q.trim().length < 3 || q.length > 200) return res.status(400).json({ message: "Nhập tên trường hoặc địa điểm từ 3 đến 200 ký tự." });
    const key = q.trim().toLowerCase();
    const saved = cache.get(key);
    if (saved && saved.until > Date.now()) return res.json({ data: saved.data });
    if (busy || Date.now() - lastRequest < 1000) return res.status(429).json({ message: "Vui lòng chờ một giây rồi tìm lại." });
    busy = true; lastRequest = Date.now();
    try {
      const url = new URL(process.env.PHOTON_SEARCH_URL || "https://photon.komoot.io/api/");
      url.search = new URLSearchParams({ q: q.trim(), limit: "5", bbox: "102,8,110,24" }).toString();
      const normalized = q.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/gi, "d").toLowerCase();
      // Addresses can contain university names; only restrict searches starting with a school name.
      if (/^(?:truong\s+)?(?:dai hoc\b|dh\b|university\b|hoc vien\b)/.test(normalized.trim())) url.searchParams.append("osm_tag", "amenity:university");
      const response = await fetcher(url, { signal: AbortSignal.timeout(10000), headers: { "User-Agent": "UniHome/1.0 university housing search" } });
      if (!response.ok) throw new Error("Geocoder unavailable");
      const result = await response.json();
      if (!Array.isArray(result.features)) throw new Error("Invalid geocoder response");
      const data = result.features.filter((item) => item.geometry?.type === "Point" && validPoint(item.geometry.coordinates)).map((item) => ({
        id: `${item.properties.osm_type}-${item.properties.osm_id}`,
        name: item.properties.name || [item.properties.housenumber, item.properties.street].filter(Boolean).join(" ") || q.trim(),
        address: [...new Set([[item.properties.housenumber, item.properties.street].filter(Boolean).join(" "), item.properties.locality, item.properties.district, item.properties.city, item.properties.state, item.properties.country].filter(Boolean))].join(", "),
        coordinates: item.geometry.coordinates
      }));
      if (cache.size >= 200) cache.delete(cache.keys().next().value);
      cache.set(key, { data, until: Date.now() + 86400000 });
      res.json({ data });
    } catch { res.status(502).json({ message: "Chưa tra cứu được vị trí trên bản đồ. Vui lòng thử lại sau." }); }
    finally { busy = false; }
  });
  router.get("/nearby-buildings", async (req, res) => {
    const read = (key, max) => typeof req.query[key] === "string" && req.query[key].trim() && Number.isFinite(Number(req.query[key])) && Math.abs(Number(req.query[key])) <= max;
    if (!read("lat", 90) || !read("lng", 180)) return res.status(400).json({ message: "Tọa độ không hợp lệ." });
    const center = [Number(req.query.lng), Number(req.query.lat)];
    const data = (await buildings.find({}).lean()).filter((building) => validPoint(building.toaDo?.coordinates)).map((building) => ({ ...building, distanceKm: distanceKm(center, building.toaDo.coordinates) })).filter((building) => building.distanceKm <= 5).sort((a, b) => a.distanceKm - b.distanceKm);
    res.json({ data, radiusKm: 5 });
  });
  return router;
};
function validPoint(point) { return Array.isArray(point) && point.length === 2 && point.every(Number.isFinite) && Math.abs(point[0]) <= 180 && Math.abs(point[1]) <= 90; }
module.exports.distanceKm = distanceKm;

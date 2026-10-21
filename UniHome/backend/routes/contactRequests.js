const express = require("express");
const ContactRequest = require("../models/ContactRequest");
const Room = require("../models/Room");
const Building = require("../models/Building");
const { rateLimit } = require("express-rate-limit");

module.exports = function contactRequests({ authenticate, authorize, models = { ContactRequest, Room, Building } }) {
  const router = express.Router();
  const Requests = models.ContactRequest;
  router.use(authenticate);
  router.get("/", async (req, res) => {
    const data = await Requests.find({ userId: req.user._id }).sort({ createdAt: -1, _id: -1 }).lean();
    res.json({ data });
  });
  router.post("/", rateLimit({ windowMs: 15 * 60000, limit: 20, standardHeaders: "draft-8", legacyHeaders: false }), async (req, res) => {
    const body = req.body;
    if (!body || typeof body !== "object" || Array.isArray(body) || Object.keys(body).some((key) => !["roomId", "name", "phone", "date", "time", "note"].includes(key))) return res.status(400).json({ message: "Dữ liệu yêu cầu không hợp lệ." });
    const { roomId, name, phone, date, time, note = "" } = body;
    const normalizedPhone = typeof phone === "string" ? phone.replace(/[\s().-]/g, "").replace(/^\+84/, "0") : "";
    if (!Number.isSafeInteger(roomId) || roomId < 1 || typeof name !== "string" || !name.trim() || name.length > 100 || !/^0[35789]\d{8}$/.test(normalizedPhone) || typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !["09:00", "10:00", "14:00", "16:00", "18:00"].includes(time) || typeof note !== "string" || note.length > 500) return res.status(400).json({ message: "Kiểm tra họ tên, số điện thoại và thời gian xem phòng." });
    const scheduledAt = new Date(`${date}T${time}:00+07:00`);
    if (!Number.isFinite(scheduledAt.getTime()) || new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) !== date || scheduledAt <= new Date()) return res.status(400).json({ message: "Hãy chọn ngày và giờ hợp lệ trong tương lai." });
    const room = await models.Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "Phòng không còn tồn tại." });
    if (room.trangThai === "da_thue") return res.status(409).json({ message: "Phòng đã được thuê. Vui lòng chọn phòng khác." });
    const building = await models.Building.findOne({ maCoSo: room.maCoSo });
    try {
      const data = await Requests.create({ userId: req.user._id, roomId, name: name.trim(), phone: normalizedPhone, scheduledAt, note: note.trim(), room: { name: room.tenPhong, code: room.maPhong, address: building?.diaChi || room.maCoSo, image: room.hinhAnh?.[0] || "", price: room.giaThue } });
      res.status(201).json({ data });
    } catch (error) {
      if (error.code === 11000) return res.status(409).json({ message: "Bạn đã gửi yêu cầu cho phòng và khung giờ này." });
      throw error;
    }
  });
  router.param("id", (req, res, next, value) => {
    if (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value))) return res.status(400).json({ message: "ID không hợp lệ." });
    next();
  });
  router.patch("/:id/cancel", async (req, res) => {
    const data = await Requests.findOneAndUpdate({ _id: Number(req.params.id), userId: req.user._id, status: { $in: ["pending", "confirmed"] } }, { $set: { status: "cancelled" } }, { returnDocument: "after", runValidators: true });
    if (!data) return res.status(409).json({ message: "Không thể hủy: yêu cầu không tồn tại, đã hủy hoặc đã hoàn thành." });
    res.json({ data });
  });
  router.patch("/:id/status", authorize("admin"), async (req, res) => {
    const body = req.body;
    if (!body || Object.keys(body).some((key) => !["status", "managerNote"].includes(key)) || !["confirmed", "completed", "cancelled"].includes(body.status) || (body.managerNote !== undefined && (typeof body.managerNote !== "string" || body.managerNote.length > 1000))) return res.status(400).json({ message: "Trạng thái hoặc ghi chú không hợp lệ." });
    const prior = body.status === "completed" ? ["confirmed"] : body.status === "confirmed" ? ["pending"] : ["pending", "confirmed"];
    const data = await Requests.findOneAndUpdate({ _id: Number(req.params.id), status: { $in: prior } }, { $set: { status: body.status, ...(body.managerNote !== undefined ? { managerNote: body.managerNote.trim() } : {}) } }, { returnDocument: "after", runValidators: true });
    if (!data) return res.status(409).json({ message: "Không thể chuyển trạng thái yêu cầu này." });
    res.json({ data });
  });
  return router;
};

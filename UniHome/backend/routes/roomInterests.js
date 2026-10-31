const express = require("express");
const Room = require("../models/Room");
const RoomInterest = require("../models/RoomInterest");

module.exports = function roomInterests({ authenticate, authorize, users, models = { Room, RoomInterest } }) {
  const router = express.Router({ mergeParams: true });
  router.use(authenticate);
  router.use(async (req, res, next) => {
    const id = req.params.roomId;
    if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) return res.status(400).json({ message: "ID phòng không hợp lệ." });
    req.interestRoom = await models.Room.findById(Number(id));
    if (!req.interestRoom) return res.status(404).json({ message: "Phòng không còn tồn tại." });
    next();
  });
  router.get("/", async (req, res) => {
    res.set("Cache-Control", "no-store");
    res.json({ registered: !!await models.RoomInterest.exists({ roomId: req.interestRoom._id, userId: req.user._id }) });
  });
  router.post("/", async (req, res) => {
    if (req.interestRoom.trangThai !== "sap_trong") return res.status(409).json({ message: "Chỉ đăng ký quan tâm khi phòng đang sắp trống." });
    try {
      await models.RoomInterest.create({ roomId: req.interestRoom._id, userId: req.user._id });
      res.status(201).json({ registered: true, message: "Đã đăng ký quan tâm phòng." });
    } catch (error) {
      if (error.code === 11000) return res.json({ registered: true, message: "Bạn đã đăng ký quan tâm phòng này." });
      throw error;
    }
  });
  router.delete("/", async (req, res) => {
    await models.RoomInterest.deleteOne({ roomId: req.interestRoom._id, userId: req.user._id });
    res.json({ registered: false, message: "Đã hủy đăng ký quan tâm." });
  });
  router.get("/registrations", authorize("admin"), async (req, res) => {
    res.set("Cache-Control", "no-store");
    const page = req.query.page === undefined ? 1 : Number(req.query.page);
    if (!Number.isSafeInteger(page) || page < 1 || page > 1000000) return res.status(400).json({ message: "Trang không hợp lệ." });
    const filter = { roomId: req.interestRoom._id };
    const [rows, total] = await Promise.all([models.RoomInterest.find(filter).sort({ createdAt: -1, _id: -1 }).skip((page - 1) * 10).limit(10).lean(), models.RoomInterest.countDocuments(filter)]);
    const accounts = rows.length ? await users.find({ _id: { $in: rows.map((row) => row.userId) } }).select("_id hoTen email soDienThoai").lean() : [];
    const byId = new Map(accounts.map((user) => [user._id, user]));
    res.json({ data: rows.map((row) => ({ _id: row._id, createdAt: row.createdAt, name: byId.get(row.userId)?.hoTen || "Tài khoản không còn tồn tại", email: byId.get(row.userId)?.email || "", phone: byId.get(row.userId)?.soDienThoai || "" })), pagination: { page, total, totalPages: Math.ceil(total / 10) } });
  });
  return router;
};

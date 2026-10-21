const express = require("express");
const Room = require("../models/Room");
const Building = require("../models/Building");
const User = require("../models/User");
const ContactRequest = require("../models/ContactRequest");
const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

module.exports = function admin({ authenticate, authorize, models = { Room, Building, User, ContactRequest } }) {
  const router = express.Router();
  router.use(authenticate, authorize("admin"));
  router.use((req, res, next) => { res.set("Cache-Control", "no-store"); next(); });
  function pageOf(req) {
    const page = req.query.page === undefined ? 1 : Number(req.query.page);
    if (!Number.isSafeInteger(page) || page < 1 || page > 1000000) throw Object.assign(new Error("Trang không hợp lệ."), { status: 400 });
    return page;
  }
  function queryOf(req, fields) {
    if (req.query.q === undefined) return {};
    if (typeof req.query.q !== "string" || req.query.q.length > 200) throw Object.assign(new Error("Từ khóa tối đa 200 ký tự."), { status: 400 });
    const regex = new RegExp(escape(req.query.q.trim()), "i");
    return { $or: fields.map((field) => ({ [field]: regex })) };
  }
  router.get("/dashboard", async (req, res) => {
    const [total, available, rented, upcoming, requests, pending, users, buildings] = await Promise.all([
      models.Room.countDocuments(), models.Room.countDocuments({ trangThai: "con_trong" }), models.Room.countDocuments({ trangThai: "da_thue" }), models.Room.countDocuments({ trangThai: "sap_trong" }), models.ContactRequest.countDocuments(), models.ContactRequest.countDocuments({ status: "pending" }), models.User.countDocuments(), models.Building.countDocuments()
    ]);
    res.json({ data: { total, available, rented, upcoming, requests, pending, users, buildings } });
  });
  router.get("/rooms", async (req, res) => {
    const page = pageOf(req); const limit = 5;
    const filter = queryOf(req, ["tenPhong", "maPhong", "maCoSo"]);
    if (req.query.q?.trim()) {
      const matching = await models.Building.find({ $or: ["diaChi", "khuVuc", "tenCoSo"].map((field) => ({ [field]: new RegExp(escape(req.query.q.trim()), "i") })) }).select("maCoSo").lean();
      filter.$or.push({ maCoSo: { $in: matching.map((building) => building.maCoSo) } });
    }
    if (req.query.status && req.query.status !== "all") {
      if (!["con_trong", "da_thue", "sap_trong"].includes(req.query.status)) return res.status(400).json({ message: "Trạng thái không hợp lệ." });
      filter.trangThai = req.query.status;
    }
    const [rooms, total] = await Promise.all([models.Room.find(filter).sort({ updatedAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit).lean(), models.Room.countDocuments(filter)]);
    const buildings = await models.Building.find({ maCoSo: { $in: [...new Set(rooms.map((room) => room.maCoSo))] } }).lean();
    const byCode = new Map(buildings.map((building) => [building.maCoSo, building]));
    res.json({ data: rooms.map((room) => ({ ...room, building: byCode.get(room.maCoSo) || null })), pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  });
  router.get("/users", async (req, res) => {
    const page = pageOf(req); const limit = 10;
    const filter = queryOf(req, ["hoTen", "email", "soDienThoai"]);
    const [data, total] = await Promise.all([models.User.find(filter).select("_id hoTen email soDienThoai vaiTro trangThai ngayTao").sort({ _id: 1 }).skip((page - 1) * limit).limit(limit).lean(), models.User.countDocuments(filter)]);
    res.json({ data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  });
  router.get("/requests", async (req, res) => {
    const page = pageOf(req); const limit = 10;
    const filter = queryOf(req, ["name", "phone", "room.name", "room.code"]);
    if (req.query.status && req.query.status !== "all") {
      if (!["pending", "confirmed", "completed", "cancelled"].includes(req.query.status)) return res.status(400).json({ message: "Trạng thái không hợp lệ." });
      filter.status = req.query.status;
    }
    const [data, total] = await Promise.all([models.ContactRequest.find(filter).sort({ createdAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit).lean(), models.ContactRequest.countDocuments(filter)]);
    res.json({ data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  });
  return router;
};

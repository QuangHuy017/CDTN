const express = require("express");
const Building = require("../models/Building");
const Room = require("../models/Room");
const Amenity = require("../models/Amenity");

const fail = (status, message) => { throw Object.assign(new Error(message), { status }); };
const literal = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
function string(value, field) {
  if (typeof value !== "string" || !value.trim() || value.length > 300) fail(400, `${field} phải là chuỗi từ 1 đến 300 ký tự.`);
  return value.trim();
}
function number(value, field, integer = false) {
  if (typeof value !== "string" || !value.trim()) fail(400, `${field} không hợp lệ.`);
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0 || (integer && (!Number.isSafeInteger(n) || n < 1))) fail(400, `${field} không hợp lệ.`);
  return n;
}
function pagination(query, fields) {
  const page = query.page === undefined ? 1 : number(query.page, "page", true);
  const limit = query.limit === undefined ? 20 : number(query.limit, "limit", true);
  if (limit > 100 || !Number.isSafeInteger((page - 1) * limit)) fail(400, "Phân trang không hợp lệ; limit tối đa 100.");
  const sort = query.sort === undefined ? "-createdAt" : string(query.sort, "sort");
  if (!fields.includes(sort.replace(/^-/, ""))) fail(400, "Trường sắp xếp không hợp lệ.");
  return { page, limit, skip: (page - 1) * limit, sort: { [sort.replace(/^-/, "")]: sort.startsWith("-") ? -1 : 1, _id: 1 } };
}
const fields = {
  buildings: ["maCoSo", "tenCoSo", "diaChi", "khuVuc", "soTang", "soPhongMoiTang", "tongSoPhong", "toaDo", "giaDien", "giaNuoc", "donViNuoc", "tienCocThang", "tienIchChung", "noiQuy"],
  rooms: ["maPhong", "maCoSo", "tenPhong", "soPhong", "giaThue", "dienTich", "loaiPhong", "tang", "soNguoiToiDa", "moTa", "tienIch", "hinhAnh", "trangThai", "giaDien", "giaNuoc"],
  amenities: ["maTienIch", "tenTienIch", "moTa"]
};
const required = {
  buildings: ["maCoSo", "tenCoSo", "diaChi", "khuVuc", "soTang", "toaDo"],
  rooms: ["maPhong", "maCoSo", "tenPhong", "giaThue", "dienTich"],
  amenities: ["maTienIch", "tenTienIch"]
};
function input(body, resource, creating) {
  if (!body || typeof body !== "object" || Array.isArray(body) || !Object.keys(body).length) fail(400, "Cần cung cấp dữ liệu.");
  if (Object.keys(body).some((key) => !fields[resource].includes(key))) fail(400, "Dữ liệu chứa trường không được hỗ trợ.");
  if (creating && required[resource].some((key) => body[key] === undefined)) fail(400, "Thiếu trường bắt buộc.");
  const data = { ...body };
  for (const [key, value] of Object.entries(data)) {
    if (["giaThue", "dienTich", "tang", "soTang", "soPhongMoiTang", "tongSoPhong", "tienCocThang", "soNguoiToiDa", "giaDien", "giaNuoc"].includes(key)) {
      if (typeof value !== "number" || !Number.isFinite(value) || value < 0) fail(400, `${key} phải là số không âm.`);
      if (["tang", "soTang", "soPhongMoiTang", "tongSoPhong", "soNguoiToiDa"].includes(key) && !Number.isSafeInteger(value)) fail(400, `${key} phải là số nguyên.`);
    } else if (["tienIch", "tienIchChung", "hinhAnh", "noiQuy"].includes(key)) {
      if (!Array.isArray(value) || value.length > 100) fail(400, `${key} phải là mảng tối đa 100 phần tử.`);
      data[key] = [...new Set(value.map((v) => string(v, key)))];
    } else if (key === "toaDo") {
      if (!value || typeof value !== "object" || Object.keys(value).some((k) => !["type", "coordinates"].includes(k)) || (value.type !== undefined && value.type !== "Point") || !Array.isArray(value.coordinates) || value.coordinates.length !== 2) fail(400, "toaDo cần tọa độ [kinh độ, vĩ độ].");
      const [lng, lat] = value.coordinates;
      if (![lng, lat].every((v) => typeof v === "number" && Number.isFinite(v)) || Math.abs(lng) > 180 || Math.abs(lat) > 90) fail(400, "Tọa độ không hợp lệ.");
      data[key] = { type: "Point", coordinates: [lng, lat] };
    } else {
      data[key] = string(value, key);
    }
  }
  if (data.trangThai !== undefined && !["con_trong", "da_thue", "sap_trong"].includes(data.trangThai)) fail(400, "trangThai không hợp lệ.");
  return data;
}

module.exports = function catalog({ authenticate, authorize, models = { Building, Room, Amenity } }) {
  const router = express.Router();
  const configs = {
    buildings: { model: models.Building, code: "maCoSo", search: ["maCoSo", "tenCoSo", "diaChi", "khuVuc"] },
    rooms: { model: models.Room, code: "maPhong", search: ["maPhong", "tenPhong", "moTa"] },
    amenities: { model: models.Amenity, code: "maTienIch", search: ["maTienIch", "tenTienIch", "moTa"] }
  };
  async function inUse(resource, doc) {
    if (resource === "buildings") return !!(await models.Room.exists({ maCoSo: doc.maCoSo }));
    if (resource === "amenities") return !!(await models.Room.exists({ tienIch: doc.tenTienIch }) || await models.Building.exists({ tienIchChung: doc.tenTienIch }));
    return false;
  }
  for (const [resource, config] of Object.entries(configs)) {
    const { model, code, search } = config;
    router.get(`/${resource}`, async (req, res) => {
      const q = req.query;
      const supported = ["q", "page", "limit", "sort", ...(resource === "rooms" ? ["khuVuc", "maCoSo", "giaThueMin", "giaThueMax", "dienTichMin", "dienTichMax", "loaiPhong", "tienIch", "trangThai"] : resource === "buildings" ? ["khuVuc", "tienIch"] : [])];
      if (Object.keys(q).some((key) => !supported.includes(key))) fail(400, "Tham số truy vấn không được hỗ trợ.");
      const p = pagination(q, ["createdAt", ...fields[resource].filter((f) => !["toaDo", "noiQuy", "tienIch", "tienIchChung", "hinhAnh"].includes(f))]);
      const filter = {};
      if (q.q !== undefined) {
        const regex = new RegExp(literal(string(q.q, "q")), "i");
        filter.$or = search.map((field) => ({ [field]: regex }));
      }
      if (q.khuVuc !== undefined) {
        const region = new RegExp(`^${literal(string(q.khuVuc, "khuVuc"))}$`, "i");
        if (resource === "buildings") filter.khuVuc = region;
        else {
          const buildings = await models.Building.find({ khuVuc: region }).select("maCoSo").lean();
          filter.maCoSo = { $in: buildings.map((b) => b.maCoSo) };
        }
      }
      if (resource === "rooms") {
        if (q.maCoSo !== undefined) {
          const building = string(q.maCoSo, "maCoSo");
          if (filter.maCoSo) filter.maCoSo.$in = filter.maCoSo.$in.filter((id) => id === building);
          else filter.maCoSo = building;
        }
        for (const field of ["giaThue", "dienTich"]) {
          const min = q[`${field}Min`] === undefined ? undefined : number(q[`${field}Min`], `${field}Min`);
          const max = q[`${field}Max`] === undefined ? undefined : number(q[`${field}Max`], `${field}Max`);
          if (min !== undefined && max !== undefined && min > max) fail(400, `${field}Min phải nhỏ hơn hoặc bằng ${field}Max.`);
          if (min !== undefined || max !== undefined) filter[field] = { ...(min !== undefined ? { $gte: min } : {}), ...(max !== undefined ? { $lte: max } : {}) };
        }
        for (const field of ["loaiPhong", "trangThai"]) if (q[field] !== undefined) filter[field] = string(q[field], field);
        if (filter.trangThai && !["con_trong", "da_thue", "sap_trong"].includes(filter.trangThai)) fail(400, "trangThai không hợp lệ.");
      }
      if (q.tienIch !== undefined) {
        const amenities = [...new Set(string(q.tienIch, "tienIch").split(",").map((a) => string(a, "tienIch")))];
        if (resource === "buildings") filter.tienIchChung = { $all: amenities };
        else {
          // Each requested amenity may be supplied by the room or its building.
          filter.$and = await Promise.all(amenities.map(async (name) => {
            const buildings = await models.Building.find({ tienIchChung: name }).select("maCoSo").lean();
            return { $or: [{ tienIch: name }, { maCoSo: { $in: buildings.map((b) => b.maCoSo) } }] };
          }));
        }
      }
      const [data, total] = await Promise.all([model.find(filter).sort(p.sort).skip(p.skip).limit(p.limit).lean(), model.countDocuments(filter)]);
      res.json({ data, pagination: { page: p.page, limit: p.limit, total, totalPages: Math.ceil(total / p.limit) } });
    });
    router.param(`${resource}Id`, (req, res, next, id) => {
      if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) return res.status(400).json({ message: "ID không hợp lệ." });
      req.params[`${resource}Id`] = Number(id);
      next();
    });
    const path = `/${resource}/:${resource}Id`;
    router.get(path, async (req, res) => {
      const doc = await model.findById(req.params[`${resource}Id`]);
      if (!doc) fail(404, "Không tìm thấy dữ liệu.");
      res.json({ data: doc });
    });
    const guards = [authenticate, authorize("admin")];
    async function checkBuilding(data) {
      if (resource === "rooms" && data.maCoSo !== undefined && !await models.Building.exists({ maCoSo: data.maCoSo })) fail(400, "Tòa nhà không tồn tại.");
    }
    router.post(`/${resource}`, ...guards, async (req, res) => {
      const data = input(req.body, resource, true);
      await checkBuilding(data);
      const doc = await model.create(data);
      res.location(`/api/${resource}/${doc._id}`).status(201).json({ data: doc });
    });
    const update = async (req, res) => {
      const data = input(req.body, resource, req.method === "PUT");
      const doc = await model.findById(req.params[`${resource}Id`]);
      if (!doc) fail(404, "Không tìm thấy dữ liệu.");
      if (data[code] !== undefined && data[code] !== doc[code]) fail(400, "Không được thay đổi mã định danh.");
      if (resource === "amenities" && data.tenTienIch !== undefined && data.tenTienIch !== doc.tenTienIch && await inUse(resource, doc)) fail(409, "Tiện ích đang được sử dụng; không thể đổi tên.");
      await checkBuilding(data);
      res.json({ data: await model.findByIdAndUpdate(doc._id, { $set: data }, { new: true, runValidators: true }) });
    };
    router.patch(path, ...guards, update);
    router.put(path, ...guards, update);
    router.delete(path, ...guards, async (req, res) => {
      const doc = await model.findById(req.params[`${resource}Id`]);
      if (!doc) fail(404, "Không tìm thấy dữ liệu.");
      if (await inUse(resource, doc)) fail(409, "Dữ liệu đang được sử dụng; không thể xóa.");
      await model.findByIdAndDelete(doc._id);
      res.status(204).end();
    });
  }
  return router;
};

const { test } = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");
const { createApp } = require("../app");

test("catalog CRUD, permissions, validation and combined filters", async (t) => {
  const secret = "catalog-test-secret-at-least-thirty-two-bytes";
  const id = 1;
  let lastFilter;
  let buildingExists = true;
  let roomInUse = false;
  const records = new Map();
  const model = {
    find(filter) {
      lastFilter = filter;
      const query = { sort(value) { query.order = value; return query; }, skip(value) { query.offset = value; return query; }, limit(value) { query.size = value; return query; }, select() { return query; }, async lean() { return [...records.values()]; } };
      return query;
    },
    async countDocuments() { return records.size; },
    async findById(key) { return records.get(key) || null; },
    async create(data) { const doc = { ...data, _id: id }; records.set(id, doc); return doc; },
    async findByIdAndUpdate(key, { $set }) { const doc = { ...records.get(key), ...$set }; records.set(key, doc); return doc; },
    async findByIdAndDelete(key) { records.delete(key); },
    async exists() { return roomInUse; }
  };
  const buildings = {
    ...model,
    async exists() { return buildingExists; },
    find() { return { select() { return this; }, async lean() { return [{ maCoSo: "TN01" }]; } }; }
  };
  let role = "admin";
  const users = { async findById() { return { _id: id, vaiTro: role === "admin" ? "admin" : "user", trangThai: "hoat_dong" }; } };
  const server = createApp({ secret, users, catalogModels: { Room: model, Building: buildings, Amenity: model } }).listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const token = jwt.sign({}, secret, { subject: String(id), issuer: "unihome", audience: "unihome-api" });
  async function request(path, method = "GET", body, authenticated = true) {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api${path}`, {
      method, headers: { "Content-Type": "application/json", ...(authenticated ? { Authorization: `Bearer ${token}` } : {}) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) })
    });
    return { status: response.status, body: response.status === 204 ? null : await response.json() };
  }
  const room = { maPhong: "P101", maCoSo: "TN01", soPhong: "201", tenPhong: "Phòng 101", giaThue: 3000000, dienTich: 25, loaiPhong: "studio", tienIch: ["Điều hòa"] };
  assert.equal((await request("/rooms", "POST", room, false)).status, 401);
  role = "tenant";
  assert.equal((await request("/rooms", "POST", room)).status, 403);
  role = "admin";
  buildingExists = false;
  assert.equal((await request("/rooms", "POST", room)).status, 400);
  buildingExists = true;
  assert.equal((await request("/rooms", "POST", room)).status, 201);
  assert.equal((await request(`/rooms/${id}`)).body.data.maPhong, "P101");
  const list = await request("/rooms?q=Ph%C3%B2ng&khuVuc=Thanh%20Xu%C3%A2n&giaThueMin=1000000&giaThueMax=4000000&dienTichMin=20&dienTichMax=30&loaiPhong=studio&tienIch=Wi-Fi,%C4%90i%E1%BB%81u%20h%C3%B2a&page=2&limit=1&sort=giaThue", "GET", undefined, false);
  assert.equal(list.status, 200);
  assert.deepEqual(list.body.pagination, { page: 2, limit: 1, total: 1, totalPages: 1 });
  assert.deepEqual(lastFilter.giaThue, { $gte: 1000000, $lte: 4000000 });
  assert.deepEqual(lastFilter.dienTich, { $gte: 20, $lte: 30 });
  assert.deepEqual(lastFilter.maCoSo, { $in: ["TN01"] });
  assert.equal(lastFilter.loaiPhong, "studio");
  assert.equal(lastFilter.$and.length, 2);
  assert.equal(lastFilter.$and[0].$or[0].tienIch, "Wi-Fi");
  assert.equal(lastFilter.$or[1].tenPhong.source, "Phòng");
  for (const query of ["page=0", "limit=101", "page=1.5", "giaThueMin=abc", "giaThueMin=10&giaThueMax=1", "sort=passwordHash", "q[x]=1", "tienIch=Wi-Fi,", "trangThai=other"]) {
    assert.equal((await request(`/rooms?${query}`)).status, 400, query);
  }
  for (const body of [{ giaThue: -1 }, { giaThue: "10" }, { $set: { giaThue: 1 } }, { tienIch: [null] }, { maPhong: "OTHER" }, {}]) {
    assert.equal((await request(`/rooms/${id}`, "PATCH", body)).status, 400);
  }
  assert.equal((await request(`/rooms/${id}`, "PUT", { giaThue: 1 })).status, 400);
  assert.equal((await request(`/rooms/${id}`, "PATCH", { giaThue: 4000000 })).body.data.giaThue, 4000000);
  assert.equal((await request("/rooms/invalid")).status, 400);
  for (const invalid of ["aaaaaaaaaaaaaaaaaaaaaaaa", "0", "-1", "1.5", "9007199254740992"]) {
    assert.equal((await request(`/rooms/${invalid}`)).status, 400);
  }
  assert.equal((await request("/rooms/999999")).status, 404);
  assert.equal((await request(`/rooms/${id}`, "DELETE")).status, 204);
  assert.equal((await request(`/rooms/${id}`)).status, 404);
  const building = { maCoSo: "TN01", tenCoSo: "UniHome", diaChi: "Hà Nội", khuVuc: "Thanh Xuân", soTang: 5, toaDo: { coordinates: [105.8, 21] }, soPhongMoiTang: 2, tongSoPhong: 8, giaDien: 3500, giaNuoc: 100000, donViNuoc: "nguoi/thang", tienCocThang: 1, noiQuy: ["Giữ vệ sinh chung"] };
  assert.equal((await request("/buildings", "POST", { ...building, noiQuy: { gioGiac: "Tự do" } })).status, 400);
  assert.equal((await request("/buildings", "POST", { ...building, soPhongMoiTang: 1.5 })).status, 400);
  assert.equal((await request("/buildings", "POST", { ...building, toaDo: { coordinates: [200, 21] } })).status, 400);
  assert.equal((await request("/buildings", "POST", building)).status, 201);
  roomInUse = true;
  assert.equal((await request(`/buildings/${id}`, "DELETE")).status, 409);
  roomInUse = false;
  assert.equal((await request(`/buildings/${id}`, "DELETE")).status, 204);
  assert.equal((await request("/amenities", "POST", { maTienIch: "wifi", tenTienIch: "Wi-Fi" })).status, 201);
  roomInUse = true;
  assert.equal((await request(`/amenities/${id}`, "PATCH", { tenTienIch: "Internet" })).status, 409);
  assert.equal((await request(`/amenities/${id}`, "DELETE")).status, 409);
});

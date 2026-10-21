const { test } = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");
const { createApp } = require("../app");

test("admin dashboard requires admin, paginates rooms, searches addresses and limits user fields", async (t) => {
  const secret = "admin-test-secret-at-least-thirty-two-bytes";
  let roomFilter; let selectedFields; let pageOffset; let pageLimit;
  const query = (data) => ({ select(fields) { selectedFields = fields; return this; }, sort() { return this; }, skip(offset) { pageOffset = offset; return this; }, limit(limit) { pageLimit = limit; return this; }, async lean() { return data; } });
  const models = {
    Room: { async countDocuments(filter) { return filter?.trangThai === "con_trong" ? 3 : filter?.trangThai === "da_thue" ? 2 : filter?.trangThai === "sap_trong" ? 1 : 6; }, find(filter) { roomFilter = filter; return query([{ _id: 1, tenPhong: "Phòng 1", maCoSo: "CS01" }]); } },
    Building: { async countDocuments() { return 2; }, find() { return query([{ maCoSo: "CS01", diaChi: "Hà Nội" }]); } },
    User: { async countDocuments() { return 11; }, find() { return query([{ _id: 1, hoTen: "An", email: "an@example.com" }]); } },
    ContactRequest: { async countDocuments(filter) { return filter?.status === "pending" ? 1 : 4; }, find() { return query([{ _id: 1, name: "An", status: "pending" }]); } }
  };
  const users = { async findById(id) { return { _id: id, vaiTro: id === 1 ? "admin" : "user", trangThai: "hoat_dong" }; } };
  const server = createApp({ secret, users, adminModels: models }).listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve)); t.after(() => new Promise((resolve) => server.close(resolve)));
  async function request(path, userId = 1) {
    const token = userId ? jwt.sign({}, secret, { subject: String(userId), issuer: "unihome", audience: "unihome-api" }) : null;
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/admin${path}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    return { status: response.status, body: await response.json(), cache: response.headers.get("cache-control") };
  }
  for (const path of ["/dashboard", "/rooms", "/users", "/requests"]) {
    assert.equal((await request(path, null)).status, 401);
    assert.equal((await request(path, 2)).status, 403);
  }
  const overview = await request("/dashboard");
  assert.equal(overview.status, 200); assert.equal(overview.cache, "no-store");
  assert.deepEqual(overview.body.data, { total: 6, available: 3, rented: 2, upcoming: 1, requests: 4, pending: 1, users: 11, buildings: 2 });
  const rooms = await request("/rooms?page=2&status=con_trong&q=Ha%2BNoi");
  assert.equal(rooms.status, 200); assert.equal(pageOffset, 5); assert.equal(pageLimit, 5);
  assert.equal(roomFilter.trangThai, "con_trong"); assert.equal(roomFilter.$or[0].tenPhong.source, "Ha\\+Noi");
  assert.deepEqual(roomFilter.$or.at(-1), { maCoSo: { $in: ["CS01"] } });
  assert.equal(rooms.body.data[0].building.diaChi, "Hà Nội");
  for (const path of ["/rooms?page=0", "/rooms?page=1.5", "/rooms?status=bad", "/requests?status=bad", "/users?q=" + "a".repeat(201)]) assert.equal((await request(path)).status, 400);
  const listedUsers = await request("/users"); assert.equal(listedUsers.status, 200);
  assert.equal(selectedFields, "_id hoTen email soDienThoai vaiTro trangThai ngayTao");
  assert.equal(selectedFields.includes("matKhau"), false);
  assert.equal((await request("/requests?status=pending")).body.data[0].status, "pending");
});

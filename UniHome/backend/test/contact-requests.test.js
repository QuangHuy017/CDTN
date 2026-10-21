const { test } = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");
const { createApp } = require("../app");

test("contact requests: create, ownership, validation, cancellation and admin status transitions", async (t) => {
  const secret = "contact-test-secret-at-least-thirty-two-bytes";
  let nextId = 1; const records = [];
  let roomStatus = "con_trong";
  const room = { _id: 1, maPhong: "P01", maCoSo: "CS01", tenPhong: "Phòng 1", giaThue: 3000000, hinhAnh: [] };
  const Requests = {
    find(filter) { return { sort() { return this; }, async lean() { return records.filter((item) => item.userId === filter.userId); } }; },
    async create(body) {
      if (records.some((item) => item.userId === body.userId && item.roomId === body.roomId && +item.scheduledAt === +body.scheduledAt && ["pending", "confirmed"].includes(item.status))) throw Object.assign(new Error("duplicate"), { code: 11000 });
      const doc = { ...body, _id: nextId++, status: "pending", managerNote: "", createdAt: new Date() }; records.push(doc); return doc;
    },
    async findOneAndUpdate(filter, update) {
      const doc = records.find((item) => item._id === filter._id && (filter.userId === undefined || item.userId === filter.userId) && filter.status.$in.includes(item.status));
      if (!doc) return null;
      Object.assign(doc, update.$set); return doc;
    }
  };
  const users = { async findById(id) { return { _id: id, hoTen: "An", email: "an@example.com", vaiTro: id === 3 ? "admin" : "user", trangThai: "hoat_dong" }; } };
  const server = createApp({ secret, users, contactModels: { ContactRequest: Requests, Room: { async findById(id) { return id === 1 ? { ...room, trangThai: roomStatus } : null; } }, Building: { async findOne() { return { diaChi: "Hà Nội" }; } } } }).listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve)); t.after(() => new Promise((resolve) => server.close(resolve)));
  async function request(path = "", method = "GET", body, userId = 1) {
    const token = userId ? jwt.sign({}, secret, { subject: String(userId), issuer: "unihome", audience: "unihome-api" }) : null;
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/contact-requests${path}`, { method, headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
    return { status: response.status, body: await response.json() };
  }
  const input = { roomId: 1, name: "Nguyễn An", phone: "0912345678", date: "2099-01-15", time: "09:00", note: "Xin xem phòng" };
  assert.equal((await request("", "GET", undefined, null)).status, 401);
  for (const body of [{ ...input, userId: 2 }, { ...input, status: "confirmed" }, { ...input, roomId: "1" }, { ...input, phone: "123" }, { ...input, date: "2099-02-30" }, { ...input, date: "2000-01-01" }, { ...input, time: "99:00" }, { ...input, note: "x".repeat(501) }]) assert.equal((await request("", "POST", body)).status, 400);
  assert.equal((await request("", "POST", { ...input, roomId: 999 })).status, 404);
  roomStatus = "da_thue"; assert.equal((await request("", "POST", input)).status, 409); roomStatus = "con_trong";
  const created = await request("", "POST", input); assert.equal(created.status, 201); assert.equal(created.body.data.status, "pending"); assert.equal(created.body.data.userId, 1);
  assert.equal(created.body.data.room.address, "Hà Nội");
  assert.equal((await request("", "POST", input)).status, 409);
  assert.equal((await request()).body.data.length, 1);
  assert.equal((await request("", "GET", undefined, 2)).body.data.length, 0);
  assert.equal((await request("/1/cancel", "PATCH", {}, 2)).status, 409);
  assert.equal((await request("/1/status", "PATCH", { status: "confirmed" })).status, 403);
  assert.equal((await request("/1/status", "PATCH", { status: "completed" }, 3)).status, 409);
  assert.equal((await request("/1/status", "PATCH", { status: "confirmed", managerNote: "Mời bạn đến đúng giờ." }, 3)).status, 200);
  assert.equal((await request()).body.data[0].managerNote, "Mời bạn đến đúng giờ.");
  assert.equal((await request("/1/status", "PATCH", { status: "completed" }, 3)).status, 200);
  assert.equal((await request("/1/cancel", "PATCH", {})).status, 409);
  const second = await request("", "POST", { ...input, time: "10:00" });
  const id = second.body.data._id;
  assert.equal((await request(`/${id}/cancel`, "PATCH", {})).body.data.status, "cancelled");
  assert.equal((await request(`/${id}/cancel`, "PATCH", {})).status, 409);
  assert.equal((await request("/invalid/cancel", "PATCH", {})).status, 400);
  assert.equal((await request("", "POST", { ...input, time: "10:00" })).status, 201);
});

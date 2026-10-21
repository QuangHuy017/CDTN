const { test } = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");
const { createApp } = require("../app");

test("profile updates persist allowed fields, protect roles, validate data and exclude passwords", async (t) => {
  const secret = "profile-test-secret-at-least-thirty-two-bytes";
  const record = { _id: 1, hoTen: "An", email: "an@example.com", matKhau: "private-password", vaiTro: "user", trangThai: "hoat_dong", ngayTao: new Date("2026-01-01") };
  const users = {
    async findById(id) { return id === 1 ? record : null; },
    async findByIdAndUpdate(id, { $set, $unset }) {
      assert.equal(id, 1);
      if ($set.email === "taken@example.com") throw Object.assign(new Error("duplicate"), { code: 11000 });
      Object.assign(record, $set);
      for (const key of Object.keys($unset || {})) delete record[key];
      return record;
    }
  };
  const server = createApp({ secret, users }).listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const token = jwt.sign({}, secret, { subject: "1", issuer: "unihome", audience: "unihome-api" });
  async function request(body, authenticated = true) {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/auth/me`, { method: body === undefined ? "GET" : "PATCH", headers: { "Content-Type": "application/json", ...(authenticated ? { Authorization: `Bearer ${token}` } : {}) }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
    return { status: response.status, body: await response.json() };
  }
  assert.equal((await request({ name: "New" }, false)).status, 401);
  const profile = { name: "Nguyễn An", email: " NEW@example.com ", phone: "+84 912 345 678", birthDate: "2003-08-15", gender: "nam", occupation: "Đại học Quốc gia Hà Nội", roomNeeds: "Cầu Giấy, dưới 4 triệu", preferredAmenities: ["Điều hòa", "Điều hòa"], avatar: "data:image/png;base64,aGVsbG8=" };
  const result = await request(profile);
  assert.equal(result.status, 200);
  assert.equal(result.body.user.name, profile.name);
  assert.equal(result.body.user.email, "new@example.com");
  assert.equal(result.body.user.phone, "0912345678");
  assert.deepEqual(result.body.user.preferredAmenities, ["Điều hòa"]);
  assert.equal(result.body.user.avatar, profile.avatar);
  assert.equal(result.body.user.joinedAt, "2026-01-01T00:00:00.000Z");
  assert.equal(result.body.user.matKhau, undefined);
  assert.equal((await request()).body.user.birthDate, profile.birthDate);
  for (const invalid of [{ role: "admin" }, { vaiTro: "admin" }, { matKhau: "changed" }, { name: " " }, { email: "bad" }, { phone: "123" }, { birthDate: "2003-02-30" }, { birthDate: "2999-01-01" }, { gender: "invalid" }, { roomNeeds: "x".repeat(201) }, { preferredAmenities: [null] }, { avatar: "data:image/svg+xml;base64,AAAA" }, { name: { $ne: null } }, {}]) {
    assert.equal((await request(invalid)).status, 400, JSON.stringify(invalid));
  }
  assert.equal(record.vaiTro, "user");
  assert.equal(record.matKhau, "private-password");
  assert.equal((await request({ email: "taken@example.com" })).status, 409);
  assert.equal((await request({ phone: "", avatar: "", birthDate: "", preferredAmenities: [] })).status, 200);
  assert.equal(record.soDienThoai, undefined);
  assert.equal((await request()).body.user.avatar, "");
  assert.equal((await request({ avatar: `data:image/jpeg;base64,${"A".repeat(18000)}` })).status, 200);
});

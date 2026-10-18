const { test } = require("node:test");
const assert = require("node:assert/strict");
const bcrypt = require("bcryptjs");
const { createApp } = require("../app");

test("Vietnamese users schema: phone login, cookies, locked users and privilege protection", async (t) => {
  const records = [];
  const users = {
    findOne(query) {
      const user = records.find((user) => Object.entries(query).every(([key, value]) => user[key] === value)) || null;
      const promise = Promise.resolve(user); promise.select = () => Promise.resolve(user); return promise;
    },
    async create(data) { const user = { ...data, _id: "0123456789abcdef01234567" }; records.push(user); return user; },
    async findById(id) { return records.find((user) => user._id === id) || null; }
  };
  const server = createApp({ secret: "session-test-secret-at-least-thirty-two-bytes", users }).listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  async function request(path, body, cookie, method = body === undefined ? "GET" : "POST") {
    const response = await fetch(base + path, { method, headers: { "Content-Type": "application/json", ...(cookie ? { Cookie: cookie } : {}) }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
    return { response, status: response.status, body: await response.json(), cookie: response.headers.get("set-cookie")?.split(";")[0] };
  }
  const input = { name: "Nguyễn An", email: "AN@example.com", phone: "+84 912 345 678", password: "Password123!", vaiTro: "admin", role: "admin", trangThai: "bi_khoa" };
  const registered = await request("/api/auth/register", input);
  assert.equal(registered.status, 201);
  assert.match(registered.response.headers.get("set-cookie"), /HttpOnly/);
  assert.match(registered.response.headers.get("set-cookie"), /SameSite=Lax/);
  assert.match(registered.response.headers.get("set-cookie"), /Path=\/api/);
  const stored = records[0];
  assert.equal(stored.hoTen, input.name); assert.equal(stored.vaiTro, "user"); assert.equal(stored.trangThai, "hoat_dong");
  assert.equal(stored.soDienThoai, "0912345678"); assert.ok(await bcrypt.compare(input.password, stored.matKhau));
  assert.equal(registered.body.user.phone, "0912345678"); assert.equal(registered.body.user.matKhau, undefined);
  assert.equal((await request("/api/auth/me", undefined, registered.cookie)).status, 200);
  const phoneLogin = await request("/api/auth/login", { identifier: "+84 912 345 678", password: input.password });
  assert.equal(phoneLogin.status, 200);
  assert.equal((await request("/api/auth/login", { identifier: " AN@example.com ", password: input.password })).status, 200);
  assert.equal((await request("/api/auth/login", { identifier: "0912345678", password: "wrong" })).status, 401);
  assert.equal((await request("/api/auth/register", { ...input, email: "other@example.com" })).status, 409);
  assert.equal((await request("/api/auth/register", { ...input, email: "other@example.com", phone: { $ne: null } })).status, 400);
  stored.trangThai = "bi_khoa";
  assert.equal((await request("/api/auth/login", { identifier: "0912345678", password: input.password })).status, 403);
  assert.equal((await request("/api/auth/me", undefined, phoneLogin.cookie)).status, 403);
  stored.trangThai = "hoat_dong";
  stored.vaiTro = "admin";
  assert.equal((await request("/api/admin/me", undefined, phoneLogin.cookie)).status, 200);
  stored.vaiTro = "user";
  assert.equal((await request("/api/admin/me", undefined, phoneLogin.cookie)).status, 403);
  const signedOut = await request("/api/auth/logout", {}, phoneLogin.cookie);
  assert.equal(signedOut.status, 200); assert.equal(signedOut.cookie, "unihome_session=");
  assert.equal((await request("/api/auth/me", undefined, signedOut.cookie)).status, 401);
  const formLogout = await fetch(base + "/api/auth/logout", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: "" });
  assert.equal(formLogout.status, 415);
  stored.matKhau = "plaintext-imported-password";
  assert.equal((await request("/api/auth/login", { identifier: "0912345678", password: stored.matKhau })).status, 401);
  assert.equal((await request("/api/auth/login", { identifier: "0912345678", password: "unihome-dummy-password" })).status, 401);
});

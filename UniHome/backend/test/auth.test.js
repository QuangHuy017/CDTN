const { test } = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");
const { createApp } = require("../app");

const secret = "test-secret-with-at-least-thirty-two-bytes";

test("JWT configuration rejects missing or short secrets", () => {
  assert.throws(() => createApp(), /JWT_SECRET/);
  assert.throws(() => createApp({ secret: "short" }), /JWT_SECRET/);
});

test("registration, login and protected profile", async (t) => {
  const records = new Map();
  let duplicateRace = false;
  const users = {
    findOne({ email, soDienThoai }) {
      const user = email ? records.get(email) || null : [...records.values()].find((u) => u.soDienThoai === soDienThoai) || null;
      const query = Promise.resolve(user);
      query.select = () => Promise.resolve(user);
      return query;
    },
    async create(data) {
      if (duplicateRace) throw Object.assign(new Error("duplicate"), { code: 11000 });
      const user = { ...data, _id: 1 };
      records.set(data.email, user);
      return user;
    },
    async findById(id) { return [...records.values()].find((user) => user._id === id) || null; }
  };
  const server = createApp({ secret, users }).listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  async function request(route, body, token) {
    const response = await fetch(base + route, {
      method: body === undefined ? "GET" : "POST",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      ...(body === undefined ? {} : { body: JSON.stringify(body) })
    });
    return { status: response.status, body: await response.json() };
  }
  const input = { name: "Nguyễn An", email: " AN@Example.com ", password: "Password123!", role: "admin" };
  const registered = await request("/api/auth/register", input);
  assert.equal(registered.status, 201);
  assert.equal(registered.body.user.email, "an@example.com");
  assert.equal(registered.body.user.matKhau, undefined);
  assert.equal(records.get("an@example.com").vaiTro, "user");
  assert.equal(registered.body.user.role, "tenant");
  assert.equal(records.get("an@example.com").matKhau, input.password);
  assert.equal(records.get("an@example.com").dinhDangMatKhau, "plain");
  const claims = jwt.verify(registered.body.token, secret, { algorithms: ["HS256"], issuer: "unihome", audience: "unihome-api" });
  assert.equal(claims.exp - claims.iat, 3600);
  assert.equal((await request("/api/auth/register", input)).status, 409);
  for (const body of [{ ...input, password: "short" }, { ...input, password: "é".repeat(37) }, { ...input, email: { $ne: null } }, { ...input, name: " " }, null]) {
    assert.equal((await request("/api/auth/register", body)).status, 400);
  }
  duplicateRace = true;
  assert.equal((await request("/api/auth/register", { ...input, email: "race@example.com" })).status, 409);
  duplicateRace = false;
  const login = await request("/api/auth/login", input);
  assert.equal(login.status, 200);
  assert.equal((await request("/api/auth/login", { ...input, password: "wrong" })).status, 401);
  assert.equal((await request("/api/auth/login", { ...input, email: "absent@example.com" })).status, 401);
  assert.equal((await request("/api/auth/me")).status, 401);
  const profile = await request("/api/auth/me", undefined, login.body.token);
  assert.equal(profile.status, 200);
  assert.deepEqual(profile.body.user, registered.body.user);
  assert.equal((await request("/api/admin/me")).status, 401);
  assert.equal((await request("/api/tenant/me")).status, 401);
  assert.equal((await request("/api/admin/me", undefined, login.body.token)).status, 403);
  assert.equal((await request("/api/tenant/me", undefined, login.body.token)).status, 200);
  const storedUser = records.get("an@example.com");
  const forgedRole = jwt.sign({ role: "admin" }, secret, { subject: claims.sub, issuer: "unihome", audience: "unihome-api" });
  assert.equal((await request("/api/admin/me", undefined, forgedRole)).status, 403);
  storedUser.vaiTro = "admin";
  const adminLogin = await request("/api/auth/login", input);
  assert.equal(adminLogin.body.user.role, "admin");
  assert.equal((await request("/api/admin/me", undefined, adminLogin.body.token)).status, 200);
  assert.equal((await request("/api/tenant/me", undefined, adminLogin.body.token)).status, 403);
  storedUser.vaiTro = "user";
  assert.equal((await request("/api/admin/me", undefined, adminLogin.body.token)).status, 403);
  delete storedUser.vaiTro;
  assert.equal((await request("/api/tenant/me", undefined, login.body.token)).status, 403);
  storedUser.vaiTro = "unknown";
  assert.equal((await request("/api/admin/me", undefined, login.body.token)).status, 403);
  assert.equal((await request("/api/tenant/me", undefined, login.body.token)).status, 403);
  storedUser.vaiTro = "user";
  const options = { subject: claims.sub, issuer: "unihome", audience: "unihome-api" };
  for (const token of ["invalid", jwt.sign({}, "another-secret", options), jwt.sign({}, secret, { ...options, expiresIn: -1 }), jwt.sign({}, secret, { ...options, audience: "other" }), jwt.sign({}, secret, { ...options, algorithm: "HS384" })]) {
    assert.equal((await request("/api/auth/me", undefined, token)).status, 401);
  }
  records.clear();
  assert.equal((await request("/api/auth/me", undefined, login.body.token)).status, 401);
  const badJson = await fetch(base + "/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{" });
  assert.equal(badJson.status, 400);
  for (let i = 0; i < 31; i++) {
    const result = await request("/api/auth/login", {});
    if (i === 30) assert.equal(result.status, 429);
  }
});

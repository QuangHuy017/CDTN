const path = require("node:path");
require("dotenv").config({ path: path.join(__dirname, "../.env"), quiet: true });
const mongoose = require("mongoose");
const assert = require("node:assert/strict");

async function main() {
  await mongoose.connect(process.env.MONGO_URI, { dbName: process.env.MONGO_DB || "UniHome", serverSelectionTimeoutMS: 10000 });
  const users = mongoose.connection.db.collection("users");
  const admin = await users.findOne({ vaiTro: "admin", trangThai: "hoat_dong" });
  assert.ok(admin, "No active admin account");
  const base = "http://127.0.0.1:3000/api";
  const response = await fetch(`${base}/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: admin.email, password: admin.matKhau }) });
  assert.equal(response.status, 200); const session = await response.json(); assert.equal(session.user.role, "admin");
  for (const endpoint of ["dashboard", "rooms", "users", "requests"]) {
    const result = await fetch(`${base}/admin/${endpoint}`, { headers: { Authorization: `Bearer ${session.token}` } });
    assert.equal(result.status, 200, endpoint); const body = await result.json();
    assert.equal(JSON.stringify(body).includes('"matKhau"'), false);
    console.log(endpoint, endpoint === "dashboard" ? JSON.stringify(body.data) : `${body.pagination.total} records`);
  }
  assert.equal((await fetch(`${base}/admin/dashboard`)).status, 401);
  const tenant = await users.findOne({ vaiTro: "user", trangThai: "hoat_dong" });
  if (tenant) {
    const login = await fetch(`${base}/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: tenant.email, password: tenant.matKhau }) });
    const tenantSession = await login.json();
    assert.equal((await fetch(`${base}/admin/dashboard`, { headers: { Authorization: `Bearer ${tenantSession.token}` } })).status, 403);
  }
  console.log("Admin access and account privacy verified.");
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; }).finally(() => mongoose.disconnect());

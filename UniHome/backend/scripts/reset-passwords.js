const path = require("node:path");
const fs = require("node:fs/promises");
const mongoose = require("mongoose");
const { EJSON } = require("bson");
require("dotenv").config({ path: path.join(__dirname, "../.env"), quiet: true });

async function main() {
  let password = "";
  for await (const chunk of process.stdin) password += chunk;
  password = password.replace(/\r?\n$/, "");
  if (password.length < 8 || Buffer.byteLength(password) > 72) throw new Error("Password must contain at least 8 characters and at most 72 bytes.");
  await mongoose.connect(process.env.MONGO_URI, { dbName: process.env.MONGO_DB || "UniHome", serverSelectionTimeoutMS: 10000 });
  const users = mongoose.connection.db.collection("users");
  const before = await users.find().toArray();
  if (before.length !== 11) throw new Error("Expected exactly 11 accounts; no passwords changed.");
  const backupDir = path.join(__dirname, "../backups", `password-reset-${Date.now()}`);
  await fs.mkdir(backupDir, { recursive: true });
  await fs.writeFile(path.join(backupDir, "users.ejson"), EJSON.stringify(before, { relaxed: false }));
  const ids = before.map((user) => user._id);
  const result = await users.updateMany({ _id: { $in: ids } }, { $set: { matKhau: password, dinhDangMatKhau: "plain", ngayCapNhat: new Date() } });
  const verified = await users.countDocuments({ _id: { $in: ids }, matKhau: password, dinhDangMatKhau: "plain" });
  if (verified !== 11) throw new Error("Password verification failed.");
  console.log(JSON.stringify({ matched: result.matchedCount, verified, backupDir }));
  for (const user of before) {
    const response = await fetch("http://127.0.0.1:3000/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: user.email, password }) });
    const data = await response.json();
    const expected = user.trangThai === "hoat_dong" && ["user", "admin"].includes(user.vaiTro) ? 200 : 403;
    if (response.status !== expected || data.user?.matKhau !== undefined) throw new Error(`Login verification failed for ID ${user._id}`);
  }
  console.log("Login verified for all 11 accounts; passwords excluded from responses.");
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; }).finally(() => mongoose.disconnect());

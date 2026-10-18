const path = require("node:path");
require("dotenv").config({ path: path.join(__dirname, "../.env"), quiet: true });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

async function main() {
  const write = process.argv.includes("--write");
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI chưa được cấu hình.");
  await mongoose.connect(process.env.MONGO_URI, { dbName: process.env.MONGO_DB || "UniHome", serverSelectionTimeoutMS: 10000, autoIndex: false });
  const collection = mongoose.connection.db.collection("users");
  const users = await collection.find({}, { projection: { matKhau: 1 } }).toArray();
  const plain = users.filter((user) => !/^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(user.matKhau || ""));
  if (plain.some((user) => typeof user.matKhau !== "string" || !user.matKhau.length || Buffer.byteLength(user.matKhau) > 72 || user.matKhau.startsWith("$2"))) throw new Error("Có mật khẩu thiếu hoặc định dạng không hợp lệ. Không thay đổi dữ liệu.");
  let updated = 0;
  if (write) {
    for (const user of plain) {
      const hash = await bcrypt.hash(user.matKhau, 12);
      const result = await collection.updateOne({ _id: user._id, matKhau: user.matKhau }, { $set: { matKhau: hash, ngayCapNhat: new Date() } });
      updated += result.modifiedCount;
    }
  }
  console.log(JSON.stringify({ mode: write ? "write" : "dry-run", total: users.length, alreadyHashed: users.length - plain.length, needsHashing: plain.length, updated }));
}
main().catch((error) => { console.error("Không hoàn tất chuyển mật khẩu:", error.name); process.exitCode = 1; }).finally(() => mongoose.disconnect());

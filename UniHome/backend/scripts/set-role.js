const path = require("node:path");
require("dotenv").config({ path: path.join(__dirname, "../.env"), quiet: true });
const mongoose = require("mongoose");
const User = require("../models/User");

async function main() {
  const [email, role, ...extra] = process.argv.slice(2);
  if (!email || !["tenant", "admin"].includes(role) || extra.length) {
    throw new Error("Cách dùng: npm run user:role -- email@example.com tenant|admin");
  }
  if (!process.env.MONGO_URI) throw new Error("Chưa cấu hình MONGO_URI trong .env.");
  await mongoose.connect(process.env.MONGO_URI, { dbName: process.env.MONGO_DB || "UniHome", serverSelectionTimeoutMS: 10000 });
  const user = await User.findOneAndUpdate(
    { email: email.trim().toLowerCase() },
    { $set: { vaiTro: role === "tenant" ? "user" : "admin" } },
    { returnDocument: "after", runValidators: true }
  );
  if (!user) throw new Error("Không tìm thấy tài khoản. Hãy đăng ký trước khi cấp quyền.");
  console.log(`Đã đặt vai trò ${role} cho ${user.email}.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
}).finally(() => mongoose.disconnect());

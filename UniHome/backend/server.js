const path = require("node:path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const mongoose = require("mongoose");
const User = require("./models/User");
const Building = require("./models/Building");
const Room = require("./models/Room");
const Amenity = require("./models/Amenity");
const ContactRequest = require("./models/ContactRequest");
const { createApp } = require("./app");

async function start() {
  if (!process.env.MONGO_URI) throw new Error("Chưa cấu hình MONGO_URI trong .env.");
  const app = createApp({ secret: process.env.JWT_SECRET, expiresIn: process.env.JWT_EXPIRES_IN || "1h" });
  await mongoose.connect(process.env.MONGO_URI, { dbName: process.env.MONGO_DB || "UniHome", serverSelectionTimeoutMS: 10000, connectTimeoutMS: 10000 });
  await mongoose.connection.db.admin().ping();
  console.log(`Đã kết nối MongoDB: ${mongoose.connection.name}`);
  // Ensure unique indexes exist before accepting writes to any resource.
  await Promise.all([User.init(), Building.init(), Room.init(), Amenity.init(), ContactRequest.init()]);
  const server = app.listen(process.env.PORT || 3000, () => console.log(`UniHome API đang chạy tại http://localhost:${process.env.PORT || 3000}`));
  server.on("error", async (error) => {
    console.error("Không thể mở máy chủ:", error.message);
    await mongoose.disconnect();
    process.exitCode = 1;
  });
  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.once(signal, () => server.close(async () => { await mongoose.disconnect(); }));
  }
}

start().catch(async (error) => {
  console.error("Không thể khởi động:", error.message);
  await mongoose.disconnect();
  process.exitCode = 1;
});

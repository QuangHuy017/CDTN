const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  hoTen: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 254 },
  soDienThoai: { type: String, trim: true, default: undefined },
  matKhau: { type: String, required: true, select: false },
  vaiTro: { type: String, enum: ["user", "admin"], default: "user", required: true },
  trangThai: { type: String, enum: ["hoat_dong", "bi_khoa"], default: "hoat_dong", required: true }
}, { timestamps: { createdAt: "ngayTao", updatedAt: "ngayCapNhat" }, collection: "users" });

userSchema.index({ soDienThoai: 1 }, { unique: true, partialFilterExpression: { soDienThoai: { $type: "string" } } });

module.exports = mongoose.model("User", userSchema);

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  hoTen: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 254 },
  soDienThoai: { type: String, trim: true, default: undefined },
  anhDaiDien: { type: String, default: "", maxlength: 200000 },
  ngaySinh: { type: String, default: "" },
  gioiTinh: { type: String, enum: ["", "nam", "nu", "khac"], default: "" },
  truongHocNgheNghiep: { type: String, default: "", maxlength: 200 },
  nhuCauTimPhong: { type: String, default: "", maxlength: 200 },
  tienIchUuTien: { type: [String], default: [] },
  matKhau: { type: String, required: true, select: false },
  dinhDangMatKhau: { type: String, enum: ["plain"], default: "plain" },
  vaiTro: { type: String, enum: ["user", "admin"], default: "user", required: true },
  trangThai: { type: String, enum: ["hoat_dong", "bi_khoa"], default: "hoat_dong", required: true }
}, { timestamps: { createdAt: "ngayTao", updatedAt: "ngayCapNhat" }, collection: "users" });

userSchema.index({ soDienThoai: 1 }, { unique: true, partialFilterExpression: { soDienThoai: { $type: "string" } } });

userSchema.plugin(require("./numericId"));
module.exports = mongoose.model("User", userSchema);

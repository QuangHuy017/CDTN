const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  maPhong: { type: String, required: true, unique: true },
  maCoSo: { type: String, required: true, ref: "Building" },
  tenPhong: { type: String, required: true },
  giaThue: { type: Number, required: true, min: 0 },
  dienTich: { type: Number, required: true, min: 0 },
  loaiPhong: { type: String, trim: true, default: "phong_tro" },
  tang: Number,
  soPhong: String,
  soNguoiToiDa: Number,
  moTa: String,
  tienIch: [String],
  hinhAnh: [String],
  trangThai: { type: String, enum: ["con_trong", "da_thue", "sap_trong"], default: "con_trong" },
  giaDien: Number,
  giaNuoc: Number
}, { timestamps: true, collection: "Phong" });
schema.index({ maCoSo: 1, giaThue: 1 });
schema.index({ loaiPhong: 1, dienTich: 1 });
module.exports = mongoose.model("Room", schema);

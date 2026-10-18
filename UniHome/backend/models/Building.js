const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  maCoSo: { type: String, required: true, unique: true },
  tenCoSo: { type: String, required: true },
  diaChi: { type: String, required: true },
  khuVuc: { type: String, required: true },
  soTang: { type: Number, required: true },
  soPhongMoiTang: { type: Number, min: 0 },
  tongSoPhong: { type: Number, default: 0 },
  giaDien: { type: Number, min: 0 },
  giaNuoc: { type: Number, min: 0 },
  donViNuoc: String,
  tienCocThang: { type: Number, min: 0 },
  toaDo: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true }
  },
  tienIchChung: [String],
  noiQuy: [String]
}, { timestamps: true, collection: "CoSo" });
schema.index({ toaDo: "2dsphere" });
module.exports = mongoose.model("Building", schema);

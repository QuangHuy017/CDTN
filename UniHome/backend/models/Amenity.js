const mongoose = require("mongoose");

module.exports = mongoose.model("Amenity", new mongoose.Schema({
  maTienIch: { type: String, required: true, unique: true, trim: true },
  tenTienIch: { type: String, required: true, unique: true, trim: true },
  moTa: { type: String, default: "" }
}, { timestamps: true, collection: "amenities" }));

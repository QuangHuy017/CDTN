const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  maTienIch: { type: String, required: true, unique: true, trim: true },
  tenTienIch: { type: String, required: true, unique: true, trim: true },
  moTa: { type: String, default: "" }
}, { timestamps: true, collection: "amenities" });
schema.plugin(require("./numericId"));
module.exports = mongoose.model("Amenity", schema);

const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  userId: { type: Number, required: true, ref: "User" },
  roomId: { type: Number, required: true, ref: "Room" },
  room: { name: String, code: String, address: String, image: String, price: Number },
  name: { type: String, required: true, maxlength: 100 },
  phone: { type: String, required: true },
  scheduledAt: { type: Date, required: true },
  note: { type: String, default: "", maxlength: 500 },
  status: { type: String, enum: ["pending", "confirmed", "completed", "cancelled"], default: "pending" },
  managerNote: { type: String, default: "", maxlength: 1000 }
}, { timestamps: true, collection: "contact_requests" });
schema.index({ userId: 1, createdAt: -1 });
schema.index({ userId: 1, roomId: 1, scheduledAt: 1 }, { unique: true, partialFilterExpression: { status: { $in: ["pending", "confirmed"] } } });
schema.plugin(require("./numericId"));
module.exports = mongoose.model("ContactRequest", schema);

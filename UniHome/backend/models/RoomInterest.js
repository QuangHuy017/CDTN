const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  roomId: { type: Number, ref: "Room", required: true },
  userId: { type: Number, ref: "User", required: true }
}, { timestamps: true, collection: "room_interests" });
schema.index({ roomId: 1, userId: 1 }, { unique: true });
schema.plugin(require("./numericId"));
module.exports = mongoose.model("RoomInterest", schema);

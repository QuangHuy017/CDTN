const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({ _id: String, value: { type: Number, required: true } }, { versionKey: false, collection: "id_counters" });
const Counter = mongoose.models.IdCounter || mongoose.model("IdCounter", counterSchema);

module.exports = function numericId(schema) {
  schema.add({ _id: { type: Number, min: 1, validate: Number.isSafeInteger } });
  schema.pre("validate", async function () {
    if (!this.isNew || this._id != null) return;
    const counter = await Counter.findOneAndUpdate(
      { _id: this.constructor.collection.name },
      { $inc: { value: 1 } },
      { upsert: true, returnDocument: "after" }
    );
    if (!Number.isSafeInteger(counter.value)) throw new Error("Đã hết phạm vi ID số nguyên an toàn.");
    this._id = counter.value;
  });
};

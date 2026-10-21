const path = require("node:path");
require("dotenv").config({ path: path.join(__dirname, "../.env"), quiet: true });
const mongoose = require("mongoose");
const assert = require("node:assert/strict");

async function main() {
  await mongoose.connect(process.env.MONGO_URI, { dbName: process.env.MONGO_DB || "UniHome", serverSelectionTimeoutMS: 10000 });
  const db = mongoose.connection.db;
  for (const name of ["users", "CoSo", "Phong", "amenities"]) {
    const docs = await db.collection(name).find().sort({ _id: 1 }).toArray();
    docs.forEach((doc, i) => assert.equal(doc._id, i + 1));
    const counter = await db.collection("id_counters").findOne({ _id: name });
    assert.equal(counter.value, docs.length);
    console.log(`${name}: ${docs.length} numeric IDs verified`);
  }
  const collection = `numeric_id_check_${Date.now()}`;
  const schema = new mongoose.Schema({ label: String }, { collection });
  schema.plugin(require("../models/numericId"));
  const Model = mongoose.model("NumericIdCheck", schema);
  try {
    await Model.init();
    const docs = await Promise.all(Array.from({ length: 10 }, (_, i) => Model.create({ label: String(i) })));
    assert.deepEqual(docs.map((doc) => doc._id).sort((a, b) => a - b), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    await Model.findByIdAndDelete(10);
    assert.equal((await Model.create({ label: "after deletion" }))._id, 11);
    console.log("Concurrent allocation and no ID reuse verified.");
  } finally {
    await Model.collection.drop();
    await db.collection("id_counters").deleteOne({ _id: collection });
  }
}
main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => mongoose.disconnect());

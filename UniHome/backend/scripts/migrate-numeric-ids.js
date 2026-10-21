const path = require("node:path");
require("dotenv").config({ path: path.join(__dirname, "../.env"), quiet: true });
const mongoose = require("mongoose");
const { EJSON } = require("bson");
const fs = require("node:fs/promises");

async function main() {
  await mongoose.connect(process.env.MONGO_URI, { dbName: process.env.MONGO_DB || "UniHome", serverSelectionTimeoutMS: 10000 });
  const db = mongoose.connection.db;
  const names = ["users", "CoSo", "Phong", "amenities"];
  const collections = await db.listCollections().toArray();
  console.log("Collections:", collections.map((c) => c.name).join(", "));
  const snapshots = [];
  for (const name of names) {
    const documents = await db.collection(name).find().sort({ _id: 1 }).toArray();
    const indexes = collections.some((c) => c.name === name) ? await db.collection(name).indexes() : [];
    console.log(name, documents.length, "documents");
    if (documents.some((d) => typeof d._id === "number")) throw new Error("Dữ liệu đã có ID số; dừng để tránh đánh số lại.");
    snapshots.push({ name, documents, indexes });
  }
  if (!process.argv.includes("--apply")) return;
  const stamp = new Date().toISOString().replace(/[^0-9]/g, "");
  const backupDir = path.join(__dirname, "../backups", stamp);
  await fs.mkdir(backupDir, { recursive: true });
  await fs.writeFile(path.join(backupDir, "snapshot.ejson"), EJSON.stringify(snapshots, { relaxed: false }));
  const mappings = {};
  const swapped = [];
  try {
    for (const { name, documents, indexes } of snapshots) {
      const stage = `${name}_numeric_${stamp}`;
      await db.createCollection(stage);
      mappings[name] = Object.fromEntries(documents.map((d, i) => [String(d._id), i + 1]));
      const converted = documents.map((d, i) => ({ ...d, _id: i + 1 }));
      if (converted.length) await db.collection(stage).insertMany(converted);
      for (const index of indexes.filter((i) => i.name !== "_id_")) {
        const { key, v, ns, ...options } = index;
        await db.collection(stage).createIndex(key, options);
      }
      const actual = await db.collection(stage).find().sort({ _id: 1 }).toArray();
      if (EJSON.stringify(actual) !== EJSON.stringify(converted)) throw new Error(`Verification failed: ${name}`);
    }
    for (const { name } of snapshots) {
      const backup = `${name}_objectid_${stamp}`;
      if (collections.some((c) => c.name === name)) await db.collection(name).rename(backup);
      try { await db.collection(`${name}_numeric_${stamp}`).rename(name); }
      catch (error) { if (collections.some((c) => c.name === name)) await db.collection(backup).rename(name); throw error; }
      swapped.push({ name, backup });
    }
    for (const { name, documents } of snapshots) {
      await db.collection("id_counters").updateOne({ _id: name }, { $set: { value: documents.length } }, { upsert: true });
    }
    await fs.writeFile(path.join(__dirname, "../id-mapping.json"), JSON.stringify(mappings, null, 2));
    console.log("Migration verified. Backup:", backupDir);
    console.log("Original collections retained with suffix:", `_objectid_${stamp}`);
  } catch (error) {
    for (const { name, backup } of swapped.reverse()) {
      await db.collection(name).rename(`${name}_failed_${stamp}`);
      if (collections.some((c) => c.name === name)) await db.collection(backup).rename(name);
    }
    throw error;
  }
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; }).finally(() => mongoose.disconnect());

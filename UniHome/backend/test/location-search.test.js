const { test } = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const catalog = require("../routes/catalog");

test("location search supports accents, nearby buildings, and combined filters", async (t) => {
  const buildingFilters = [];
  let roomFilter;
  let match = true;
  const buildings = { find(filter) {
    buildingFilters.push(filter);
    return { select() { return this; }, async lean() {
      if (!match) return [];
      return filter.$or[0].toaDo ? [{ maCoSo: "NEAR" }] : [{ maCoSo: "MATCH", toaDo: { coordinates: [105.8, 21] } }];
    } };
  } };
  const rooms = { find(filter) {
    roomFilter = filter;
    return { sort() { return this; }, skip() { return this; }, limit() { return this; }, async lean() { return []; } };
  }, async countDocuments() { return 0; } };
  const app = express();
  app.use(catalog({ authenticate: (req, res, next) => next(), authorize: () => (req, res, next) => next(), models: { Building: buildings, Room: rooms, Amenity: rooms } }));
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const url = `http://127.0.0.1:${server.address().port}`;
  const response = await fetch(`${url}/rooms?location=cau%20giay&giaThueMax=5000000`);
  assert.equal(response.status, 200);
  assert.ok(buildingFilters[0].$or[0].tenCoSo.test("Cầu Giấy"));
  assert.deepEqual(buildingFilters[1].$or[0].toaDo.$geoWithin.$centerSphere, [[105.8, 21], 3 / 6371.0088]);
  assert.deepEqual(roomFilter.maCoSo, { $in: ["MATCH", "NEAR"] });
  assert.deepEqual(roomFilter.giaThue, { $lte: 5000000 });
  match = false;
  await fetch(`${url}/rooms?location=unknown`);
  assert.deepEqual(roomFilter.maCoSo, { $in: [] });
});

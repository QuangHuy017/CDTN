const { test } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const places = require('../routes/places');
test('geocode cache and nearby buildings ordered by distance', async (t) => {
  let calls = 0;
  const buildings = { find: () => ({ lean: async () => [
    { _id: 1, toaDo: { coordinates: [105.82, 21] } },
    { _id: 2, toaDo: { coordinates: [105.801, 21] } },
    { _id: 3, toaDo: { coordinates: [106.8, 21] } }, { _id: 4 }
  ] }) };
  const fetcher = async (url) => {
    assert.equal(url.searchParams.has('osm_tag'), false, 'Street addresses must not be restricted to universities');
    calls++;
    return { ok: true, json: async () => ({ features: [{ geometry: { type: 'Point', coordinates: [105.8, 21] }, properties: { osm_type: 'W', osm_id: 1, housenumber: '12', street: 'Đường Đại học', city: 'Hà Nội' } }] }) };
  };
  const app = express();
  app.use(places({ buildings, fetcher }));
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const url = `http://127.0.0.1:${server.address().port}`;
  assert.equal((await fetch(`${url}/search?q=ab`)).status, 400);
  const addressQuery = new URLSearchParams({ q: '12 Đường Đại học, Hà Nội' });
  const response = await fetch(`${url}/search?${addressQuery}`);
  assert.equal(response.status, 200);
  const place = (await response.json()).data[0];
  assert.equal(place.name, '12 Đường Đại học');
  assert.equal(place.address, '12 Đường Đại học, Hà Nội');
  await fetch(`${url}/search?${addressQuery}`);
  assert.equal(calls, 1);
  const nearby = await (await fetch(`${url}/nearby-buildings?lat=21&lng=105.8`)).json();
  assert.deepEqual(nearby.data.map((b) => b._id), [2, 1]);
  assert.ok(nearby.data[0].distanceKm < nearby.data[1].distanceKm);
  assert.equal((await fetch(`${url}/nearby-buildings?lat=abc&lng=105`)).status, 400);
  assert.deepEqual((await (await fetch(`${url}/nearby-buildings?lat=0&lng=0`)).json()).data, []);
});

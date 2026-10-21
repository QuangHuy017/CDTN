import { test } from "node:test";
import assert from "node:assert/strict";
import { parseRoomPrompt, filtersToQuery } from "../src/services/roomService.js";

test("chat recognizes Vietnamese regions across case and accents, prices and area", () => {
  const regions = ["Hà Đông", "Cầu Giấy"];
  for (const prompt of ["phòng dưới 3 triệu ở hà đông", "PHÒNG DƯỚI 3 TRIỆU Ở HÀ ĐÔNG", "phong duoi 3tr o ha dong"]) {
    const parsed = parseRoomPrompt(prompt, regions);
    assert.equal(parsed.filters.khuVuc, "Hà Đông");
    assert.equal(parsed.filters.price, "0-3000000");
    assert.equal(filtersToQuery(parsed.filters).get("giaThueMax"), "3000000");
  }
  assert.equal(parseRoomPrompt("phòng Cầu Giấy trên 25m²", regions).filters.area, "25-");
  assert.equal(parseRoomPrompt("xin chào", regions).recognized, false);
});

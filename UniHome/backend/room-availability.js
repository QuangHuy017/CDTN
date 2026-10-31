function applyAvailability(data, current = {}) {
  const fail = (message) => { throw Object.assign(new Error(message), { status: 400 }); };
  const status = data.trangThai ?? current.trangThai ?? "con_trong";
  if (status !== "sap_trong") {
    if (data.ngayDuKienTrong != null) fail("Chỉ nhập ngày dự kiến trống cho phòng sắp trống.");
    data.ngayDuKienTrong = null;
    return;
  }
  const date = data.ngayDuKienTrong === undefined ? current.ngayDuKienTrong : data.ngayDuKienTrong;
  const parsed = typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date) ? new Date(`${date}T00:00:00Z`) : null;
  if (!parsed || !Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) fail("Vui lòng nhập ngày dự kiến trống hợp lệ cho phòng sắp trống.");
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  if ((date !== current.ngayDuKienTrong || current.trangThai !== "sap_trong") && date < today) fail("Ngày dự kiến trống không được trước ngày hôm nay.");
  data.ngayDuKienTrong = date;
}
module.exports = { applyAvailability };

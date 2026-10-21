import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../components/common/Icon";
import { updateProfile } from "../services/authService";
import { readSavedRooms } from "../services/savedRooms";

const amenities = ["Wifi tốc độ cao", "Điều hòa", "Không chung chủ", "Chỗ để xe", "Máy giặt", "Thang máy", "Ban công", "Bếp riêng"];
const inputClass = "mt-2 h-11 w-full rounded-lg border border-[#dfe7f2] bg-white px-3.5 text-[13px] text-[#17263e] outline-none transition focus:border-sky-500 focus:ring-3 focus:ring-sky-100";
function profileOf(user) {
  return { name: user.name || "", email: user.email || "", phone: user.phone || "", avatar: user.avatar || "", birthDate: user.birthDate || "", gender: user.gender || "", occupation: user.occupation || "", roomNeeds: user.roomNeeds || "", preferredAmenities: [...(user.preferredAmenities || [])] };
}
function Avatar({ image, name }) {
  return image ? <img src={image} alt={`Ảnh đại diện ${name}`} className="size-[72px] shrink-0 rounded-full border-2 border-white object-cover ring-1 ring-slate-200" /> : <span aria-label={`Ảnh đại diện ${name}`} className="grid size-[72px] shrink-0 place-items-center rounded-full border-2 border-white bg-gradient-to-br from-sky-100 to-blue-200 text-xl font-bold text-sky-700 ring-1 ring-blue-100">{name.trim().split(/\s+/).slice(-2).map((word) => word[0]).join("").toUpperCase() || "U"}</span>;
}
async function resizeAvatar(file) {
  if (!["image/jpeg", "image/png"].includes(file.type)) throw new Error("Vui lòng chọn ảnh JPG hoặc PNG.");
  if (file.size > 5 * 1024 * 1024) throw new Error("Dung lượng ảnh tối đa 5MB.");
  const bitmap = await createImageBitmap(file).catch(() => { throw new Error("Không đọc được ảnh. Vui lòng chọn ảnh khác."); });
  const canvas = document.createElement("canvas"); canvas.width = 256; canvas.height = 256;
  const context = canvas.getContext("2d"); const side = Math.min(bitmap.width, bitmap.height);
  context.fillStyle = "#ffffff"; context.fillRect(0, 0, 256, 256);
  context.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, 256, 256);
  bitmap.close(); return canvas.toDataURL("image/jpeg", 0.85);
}

export default function AccountPage({ user, onUpdated, onLogout, appointments = false }) {
  const [form, setForm] = useState(() => profileOf(user));
  const [saving, setSaving] = useState(false);
  const [readingImage, setReadingImage] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showAmenities, setShowAmenities] = useState(false);
  const imageInput = useRef(null); const imageGeneration = useRef(0);
  const title = appointments ? "Yêu cầu liên hệ đã gửi" : "Thông tin tài khoản";
  useEffect(() => { document.title = `${title} | UniHome`; }, [title]);
  useEffect(() => { setForm(profileOf(user)); setMessage(""); setError(""); }, [user.id]);
  useEffect(() => () => { imageGeneration.current += 1; }, []);
  const change = (field, value) => { setForm((current) => ({ ...current, [field]: value })); setMessage(""); };
  async function selectAvatar(event) {
    const file = event.target.files?.[0]; event.target.value = ""; if (!file) return;
    const generation = ++imageGeneration.current; setReadingImage(true); setError("");
    try { const avatar = await resizeAvatar(file); if (generation === imageGeneration.current) change("avatar", avatar); }
    catch (err) { if (generation === imageGeneration.current) setError(err.message); }
    finally { if (generation === imageGeneration.current) setReadingImage(false); }
  }
  function cancel() {
    imageGeneration.current += 1; setReadingImage(false); setForm(profileOf(user)); setError(""); setMessage("Đã hủy các thay đổi chưa lưu.");
  }
  async function save(event) {
    event.preventDefault(); if (saving || readingImage) return;
    setSaving(true); setError(""); setMessage("");
    try { const data = await updateProfile(form); setForm(profileOf(data.user)); onUpdated(data); setMessage("Đã lưu thông tin cá nhân thành công."); }
    catch (err) { setError(err.message); } finally { setSaving(false); }
  }
  const joined = user.joinedAt && Number.isFinite(Date.parse(user.joinedAt)) ? `Tháng ${new Intl.DateTimeFormat("vi-VN", { month: "2-digit", year: "numeric", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date(user.joinedAt))}` : "Chưa cập nhật";
  const navClass = "flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-[13px] transition";
  return <main className="w-full flex-1 bg-[#f7f9fe] px-4 py-7 sm:px-6 lg:px-9 lg:py-9">
    <div className="mx-auto grid max-w-[1180px] items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-7">
      <aside className="space-y-5">
        <section className="rounded-xl border border-[#e6ebf3] bg-white px-5 py-6 shadow-sm">
          <div className="flex flex-col items-center text-center"><Avatar image={user.avatar} name={user.name} /><h2 className="mt-4 text-base font-semibold text-[#15273e]">{user.name}</h2><p className="mt-1 max-w-full break-all text-xs text-slate-500">{user.email}</p></div>
          <div className="mt-6 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4"><div className="rounded-lg bg-[#f0f4ff] p-2.5"><p className="text-[11px] text-slate-500">Vai trò</p><p className="mt-1 text-xs font-semibold text-sky-700">{user.role === "admin" ? "Admin" : "Người tìm phòng"}</p></div><div className="rounded-lg bg-[#f0f4ff] p-2.5"><p className="text-[11px] text-slate-500">Ngày tham gia</p><p className="mt-1 text-xs font-semibold text-[#15273e]">{joined}</p></div></div>
        </section>
        <nav aria-label="Tài khoản cá nhân" className="rounded-xl border border-[#e6ebf3] bg-white p-2 shadow-sm">
          <Link to="/account" aria-current={!appointments ? "page" : undefined} className={`${navClass} ${!appointments ? "bg-[#cfe7ff] font-semibold text-[#153f5c]" : "text-slate-600 hover:bg-slate-50"}`}><Icon name="user" className="size-4! text-sky-700" />Thông tin cá nhân<Icon name="arrow" className="ml-auto size-4! text-sky-700" /></Link>
          <Link to="/?page=favorites" className={`${navClass} text-slate-600 hover:bg-slate-50`}><Icon name="heart" className="size-4!" />Phòng yêu thích<span className="ml-auto rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-900">{readSavedRooms().length}</span></Link>
          <Link to="/appointments" aria-current={appointments ? "page" : undefined} className={`${navClass} ${appointments ? "bg-[#cfe7ff] font-semibold text-[#153f5c]" : "text-slate-600 hover:bg-slate-50"}`}><Icon name="document" className="size-4!" />Yêu cầu liên hệ đã gửi</Link>
          <div className="my-2 border-t border-slate-100" /><button type="button" onClick={onLogout} className={`${navClass} text-red-600 hover:bg-red-50`}><Icon name="login" className="size-4!" />Đăng xuất</button>
        </nav>
        <Link to="/#ai-assistant" className="flex items-center gap-3 rounded-xl border border-[#dfe7f8] bg-[#eef3ff] p-4"><span className="grid size-10 shrink-0 place-items-center rounded-lg bg-white text-sky-600"><Icon name="bot" className="size-6!" /></span><span><span className="block text-xs font-semibold text-[#172b44]">Cần trợ giúp tìm phòng?</span><span className="mt-1 block text-[11px] text-slate-500">Khám phá phòng phù hợp cùng UniHome</span></span></Link>
      </aside>
      <section className="min-w-0 rounded-xl border border-[#e6ebf3] bg-white p-5 shadow-sm sm:p-7">
        <div className="border-b border-[#e9edf4] pb-5"><h1 className="text-[25px] font-bold tracking-tight text-[#14253b]">{title}</h1><p className="mt-1.5 text-[13px] leading-6 text-slate-600">{appointments ? "Theo dõi hướng dẫn lên lịch và liên hệ cơ sở." : "Quản lý thông tin hồ sơ của bạn để thuận tiện khi liên hệ xem phòng trọ."}</p></div>
        {appointments ? <div className="py-6 text-sm leading-7 text-slate-600"><p>Hiện tại, lịch xem phòng được tải về dưới dạng tệp lịch trên trang chi tiết phòng. Website chưa lưu lịch theo tài khoản nên chưa thể hiển thị, sửa hoặc hủy lịch tại đây.</p><p className="mt-3">Bạn có thể quản lý lịch đã tải trong ứng dụng lịch của mình và liên hệ cơ sở để xác nhận buổi xem phòng.</p><Link to="/" className="mt-5 inline-block rounded-lg bg-sky-600 px-4 py-2.5 font-semibold text-white hover:bg-sky-700">Tìm phòng để lên lịch</Link></div> : <form onSubmit={save} className="mt-5 space-y-5">
          <fieldset disabled={saving} className="space-y-5 disabled:opacity-70">
            <div className="flex flex-wrap items-center gap-4 rounded-xl border border-[#dfe7fa] bg-[#f0f4ff] p-4"><Avatar image={form.avatar} name={form.name} /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-3"><input ref={imageInput} type="file" accept="image/jpeg,image/png" onChange={selectAvatar} className="sr-only" aria-label="Chọn ảnh đại diện" /><button disabled={readingImage} type="button" onClick={() => imageInput.current?.click()} className="flex items-center gap-2 rounded-lg border border-[#dfe7f2] bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:border-sky-400"><Icon name="camera" className="size-4! text-sky-600" />{readingImage ? "Đang xử lý ảnh…" : "Thay đổi ảnh đại diện"}</button><button disabled={!form.avatar || readingImage} type="button" onClick={() => change("avatar", "")} className="text-xs text-slate-600 hover:text-red-600 disabled:opacity-40">Xóa ảnh</button></div><p className="mt-2 text-[11px] leading-5 text-slate-500">Hỗ trợ JPG, PNG tối đa 5MB. Ảnh đại diện rõ mặt giúp dễ nhận diện khi liên hệ.</p></div></div>
            <label className="block text-[11px] font-semibold text-[#394c66]">HỌ VÀ TÊN <span className="text-red-500">*</span><input required maxLength={100} autoComplete="name" className={inputClass} value={form.name} onChange={(event) => change("name", event.target.value)} /></label>
            <div className="grid gap-5 sm:grid-cols-2"><label className="block text-[11px] font-semibold text-[#394c66]">SỐ ĐIỆN THOẠI<input type="tel" autoComplete="tel" maxLength={30} placeholder="Nhập số điện thoại" className={inputClass} value={form.phone} onChange={(event) => change("phone", event.target.value)} /></label><label className="block text-[11px] font-semibold text-[#394c66]">EMAIL <span className="text-red-500">*</span><input required type="email" maxLength={254} autoComplete="email" className={inputClass} value={form.email} onChange={(event) => change("email", event.target.value)} /></label></div>
            <div className="grid gap-5 sm:grid-cols-2"><label className="block text-[11px] font-semibold text-[#394c66]">NGÀY SINH<input type="date" min="1900-01-01" max={new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date())} autoComplete="bday" className={inputClass} value={form.birthDate} onChange={(event) => change("birthDate", event.target.value)} /></label><label className="block text-[11px] font-semibold text-[#394c66]">GIỚI TÍNH<select className={inputClass} value={form.gender} onChange={(event) => change("gender", event.target.value)}><option value="">Chưa chọn</option><option value="nam">Nam</option><option value="nu">Nữ</option><option value="khac">Khác</option></select></label></div>
            <label className="block text-[11px] font-semibold text-[#394c66]">TRƯỜNG ĐẠI HỌC / NGHỀ NGHIỆP<input maxLength={200} className={inputClass} value={form.occupation} placeholder="Nhập trường đại học hoặc nghề nghiệp" onChange={(event) => change("occupation", event.target.value)} /><span className="mt-2 block text-[11px] font-normal leading-5 text-slate-500">Thông tin giúp cơ sở hiểu thêm về bạn khi liên hệ xem phòng.</span></label>
            <label className="block text-[11px] font-semibold text-[#394c66]">NHU CẦU TÌM PHÒNG<textarea maxLength={200} rows={3} className={`${inputClass} h-auto resize-y py-3`} value={form.roomNeeds} placeholder="Ví dụ: Phòng khép kín ở Cầu Giấy, ngân sách dưới 4 triệu" onChange={(event) => change("roomNeeds", event.target.value)} /><span className="mt-2 flex justify-between gap-3 text-[11px] font-normal text-slate-500"><span>Mô tả khu vực, ngân sách và loại phòng bạn mong muốn.</span><span className="shrink-0 text-slate-400">{form.roomNeeds.length}/200 ký tự</span></span></label>
            <div className="rounded-xl border border-[#dfe7fa] bg-[#f0f4ff] p-4"><h2 className="text-[11px] font-semibold text-[#394c66]">TIỆN ÍCH ƯU TIÊN THƯỜNG CHỌN:</h2><div className="mt-3 flex flex-wrap gap-2">{[...new Set([...(showAmenities ? amenities : amenities.slice(0, 3)), ...form.preferredAmenities])].map((item) => { const selected = form.preferredAmenities.includes(item); return <button key={item} type="button" aria-pressed={selected} onClick={() => change("preferredAmenities", selected ? form.preferredAmenities.filter((value) => value !== item) : [...form.preferredAmenities, item])} className={`rounded-lg border px-2.5 py-1.5 text-[11px] ${selected ? "border-[#a8d2fa] bg-[#cfe7ff] text-[#17445f]" : "border-[#dfe7f2] bg-white text-slate-600 hover:border-sky-400"}`}>{selected && <span aria-hidden="true">✓ </span>}{item}</button>; })}{!showAmenities && <button type="button" onClick={() => setShowAmenities(true)} className="rounded-lg border border-[#dfe7f2] bg-white px-2.5 py-1.5 text-[11px] text-slate-600">+ Thêm tiện ích</button>}</div></div>
          </fieldset>
          <div className="flex items-start gap-2 rounded-lg border border-blue-100 bg-[#f5f8ff] p-3 text-[11px] leading-5 text-slate-600"><Icon name="shield" className="mt-0.5 size-4! shrink-0 text-blue-600" /><p>Thông tin hồ sơ được dùng để quản lý tài khoản và thuận tiện khi liên hệ xem phòng. Bạn có thể cập nhật hoặc xóa ảnh đại diện bất cứ lúc nào.</p></div>
          {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}{message && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}
          <div className="flex justify-end gap-3 border-t border-[#e9edf4] pt-5"><button disabled={saving} type="button" onClick={cancel} className="rounded-lg border border-[#dfe7f2] px-4 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50">Hủy bỏ</button><button disabled={saving || readingImage} type="submit" className="flex items-center gap-2 rounded-lg bg-[#008ac4] px-4 py-2.5 text-xs font-semibold text-white hover:bg-sky-700 disabled:opacity-50"><Icon name="save" className="size-4!" />{saving ? "Đang lưu…" : "Lưu thay đổi"}</button></div>
        </form>}
      </section>
    </div>
  </main>;
}

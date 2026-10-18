import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import AuthField from "../components/auth/AuthField";
import Icon from "../components/common/Icon";
import useAuthSubmit from "../hooks/useAuthSubmit";
import { register } from "../services/authService";

export default function RegisterPage({ onSuccess }) {
  const location = useLocation();
  const { pending, error, setError, submit } = useAuthSubmit();
  useEffect(() => { document.title = "Đăng ký | UniHome"; }, []);
  function handleSubmit(event) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    if (!values.name.trim()) { setError("Vui lòng nhập họ và tên."); return; }
    if (values.password !== values.confirmPassword) { setError("Mật khẩu xác nhận chưa trùng khớp."); return; }
    if (new TextEncoder().encode(values.password).length > 72) { setError("Mật khẩu không được vượt quá 72 byte. Hãy giảm số ký tự, đặc biệt với ký tự có dấu."); return; }
    if (!/^0[35789]\d{8}$/.test(values.phone.replace(/[\s().-]/g, "").replace(/^\+84/, "0"))) { setError("Vui lòng nhập số điện thoại Việt Nam hợp lệ."); return; }
    submit(register, { name: values.name, email: values.email, phone: values.phone, password: values.password }, onSuccess);
  }
  return (
    <AuthLayout register>
      <div className="text-center"><span className="mx-auto grid size-11 place-items-center rounded-xl bg-[#eff5ff] text-[#256493]"><Icon name="userPlus" className="size-5!" /></span><h1 className="mt-4 text-2xl font-bold tracking-tight text-[#1e304b]">Tạo tài khoản UniHome mới</h1><p className="mx-auto mt-2 max-w-sm text-xs leading-6 text-slate-500">Tham gia cùng người tìm kiếm phòng trọ tiện lợi và tìm căn phòng phù hợp với bạn.</p></div>
      <form className="mt-7 space-y-5" onSubmit={handleSubmit} aria-busy={pending}>
        <div><p className="mb-2 text-[10px] font-medium tracking-wide text-slate-600">TÀI KHOẢN DÀNH CHO</p><div className="flex items-center justify-center gap-2 rounded-lg border border-[#256493] bg-[#f0f6ff] py-3 text-xs font-semibold text-[#256493]"><Icon name="user" className="size-4!" />Người tìm thuê phòng</div></div>
        <AuthField label="HỌ VÀ TÊN" icon="user" name="name" autoComplete="name" placeholder="Ví dụ: Nguyễn Văn Nam" maxLength={100} required disabled={pending} />
        <AuthField label="ĐỊA CHỈ EMAIL" icon="mail" name="email" type="email" autoComplete="email" placeholder="nguyenvannam@gmail.com" maxLength={254} required disabled={pending} />
        <AuthField label="SỐ ĐIỆN THOẠI" icon="user" name="phone" type="tel" autoComplete="tel" placeholder="Ví dụ: 0912 345 678" maxLength={25} required disabled={pending} />
        <div className="grid gap-5 sm:grid-cols-2"><AuthField label="MẬT KHẨU" icon="lock" name="password" type="password" autoComplete="new-password" placeholder="Tối thiểu 8 ký tự" minLength={8} required disabled={pending} /><AuthField label="XÁC NHẬN MẬT KHẨU" icon="lock" name="confirmPassword" type="password" autoComplete="new-password" placeholder="Nhập lại mật khẩu" minLength={8} required disabled={pending} /></div>
        <label className="flex cursor-pointer items-start gap-2.5 text-[11px] leading-5 text-slate-500"><input name="agreement" type="checkbox" required className="mt-1 size-3.5 shrink-0 accent-[#256493]" />Tôi đồng ý với quy chế hoạt động và chính sách bảo mật của UniHome được trình bày ở chân trang.</label>
        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-xs leading-relaxed text-red-700">{error}</p>}
        <button disabled={pending} className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#256493] text-xs font-medium text-white transition hover:bg-[#1c5079] disabled:cursor-wait disabled:opacity-60"><Icon name="userPlus" className="size-4!" />{pending ? "Đang tạo tài khoản…" : "Đăng ký tài khoản"}</button>
      </form>
      <p className="mt-6 text-center text-xs text-slate-500">Đã có tài khoản? <Link to="/login" state={location.state} className="ml-1 font-semibold text-[#256493] hover:underline">Đăng nhập</Link></p>
    </AuthLayout>
  );
}

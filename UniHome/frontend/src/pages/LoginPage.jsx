import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import AuthLayout from "../components/auth/AuthLayout";
import AuthField from "../components/auth/AuthField";
import Icon from "../components/common/Icon";
import useAuthSubmit from "../hooks/useAuthSubmit";
import { login } from "../services/authService";

function rememberedEmail() { try { return localStorage.getItem("unihome:remembered-email") || ""; } catch { return ""; } }

export default function LoginPage({ onSuccess }) {
  const location = useLocation();
  const [email, setEmail] = useState(rememberedEmail);
  const [remember, setRemember] = useState(() => !!rememberedEmail());
  const [help, setHelp] = useState(false);
  const { pending, error, submit } = useAuthSubmit();
  useEffect(() => { document.title = "Đăng nhập | UniHome"; }, []);
  function handleSubmit(event) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    submit(login, values, (data) => {
      try { if (remember) localStorage.setItem("unihome:remembered-email", values.identifier.trim()); else localStorage.removeItem("unihome:remembered-email"); } catch { /* Login remains available when storage is blocked. */ }
      onSuccess(data);
    });
  }
  return (
    <AuthLayout>
      <div className="text-center"><span className="mx-auto grid size-11 place-items-center rounded-xl border border-blue-100 bg-[#eff5ff] text-[#256493]"><Icon name="login" className="size-5!" /></span><h1 className="mt-5 text-xl font-bold tracking-tight text-[#1e304b]">Đăng nhập tài khoản UniHome</h1><p className="mt-2 text-xs leading-6 text-slate-500">Chào mừng bạn quay trở lại. Đăng nhập để tiếp tục<br className="hidden sm:block" /> hành trình tìm phòng của bạn.</p></div>
      <form className="mt-7 space-y-5" onSubmit={handleSubmit} aria-busy={pending}>
        <AuthField label="Email hoặc số điện thoại" icon="user" name="identifier" autoComplete="username" placeholder="vidu@gmail.com hoặc 0912 345 678" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={254} required disabled={pending} />
        <AuthField label="Mật khẩu" icon="lock" name="password" type="password" autoComplete="current-password" placeholder="Nhập mật khẩu" required disabled={pending} />
        <div className="flex items-center justify-between gap-4 text-[11px]"><label className="flex cursor-pointer items-center gap-2 text-slate-500"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} className="size-3.5 accent-[#256493]" />Ghi nhớ tài khoản</label><button type="button" onClick={() => setHelp(!help)} aria-expanded={help} className="text-[#256493] hover:underline">Quên mật khẩu?</button></div>
        {help && <p role="status" className="rounded-lg bg-blue-50 p-3 text-xs leading-relaxed text-blue-800">Vui lòng liên hệ quản lý cơ sở để được hỗ trợ khôi phục tài khoản. Tính năng tự đặt lại mật khẩu chưa khả dụng.</p>}
        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-xs leading-relaxed text-red-700">{error}</p>}
        <button disabled={pending} className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#256493] text-xs font-medium text-white transition hover:bg-[#1c5079] disabled:cursor-wait disabled:opacity-60"><Icon name="login" className="size-4!" />{pending ? "Đang đăng nhập…" : "Đăng nhập"}</button>
      </form>
      <p className="mt-6 border-t border-slate-100 pt-5 text-center text-xs text-slate-500">Chưa có tài khoản? <Link to="/register" state={location.state} className="ml-1 font-semibold text-[#256493] hover:underline">Đăng ký ngay</Link></p>
    </AuthLayout>
  );
}

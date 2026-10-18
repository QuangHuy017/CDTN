import { Link, NavLink } from "react-router-dom";
import Icon from "../common/Icon";

export default function AuthHeader() {
  return (
    <header className="border-b border-[#e2e8f2] bg-[#fafbff]">
      <div className="mx-auto flex min-h-16 max-w-[1440px] flex-wrap items-center gap-5 px-5 py-3 sm:px-8 lg:px-10">
        <Link to="/" className="flex shrink-0 items-center gap-2 text-base font-bold text-[#246494]"><span className="grid size-8 place-items-center rounded-lg bg-[#256493] text-white"><Icon name="building" className="size-5!" /></span>UniHome</Link>
        <nav aria-label="Điều hướng chính" className="hidden items-center gap-7 text-xs text-slate-600 sm:flex"><Link to="/" className="hover:text-blue-700">Trang chủ</Link><Link to="/?page=rooms" className="hover:text-blue-700">Tìm phòng</Link><Link to="/?page=map" className="hover:text-blue-700">Bản đồ</Link><Link to="/#ai-assistant" className="flex items-center gap-1.5 hover:text-blue-700"><Icon name="bot" className="size-4! text-blue-600" />AI Trợ lý</Link></nav>
        <nav aria-label="Tài khoản" className="ml-auto flex items-center gap-6 text-xs"><NavLink to="/register" className={({ isActive }) => `border-b-2 py-1.5 ${isActive ? "border-[#256493] font-semibold text-[#256493]" : "border-transparent text-slate-600 hover:text-blue-700"}`}>Đăng ký</NavLink><NavLink to="/login" className={({ isActive }) => `border-b-2 py-1.5 ${isActive ? "border-[#256493] font-semibold text-[#256493]" : "border-transparent text-slate-600 hover:text-blue-700"}`}>Đăng nhập</NavLink></nav>
      </div>
    </header>
  );
}

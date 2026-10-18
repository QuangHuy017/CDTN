import { useEffect, useRef } from "react";
import Brand from "./Brand";
import Icon from "../common/Icon";
import { Link, useLocation } from "react-router-dom";
const navigation = [
  { key: "home", label: "Trang chủ", href: "/" },
  { key: "rooms", label: "Tìm phòng", href: "/?page=rooms" },
  { key: "map", label: "Bản đồ phòng", href: "/?page=map", icon: "map" },
  { key: "about", label: "Giới thiệu", href: "/?page=about" },
  { key: "contact", label: "Liên hệ", href: "/?page=contact" },
];

export default function Header({ user, onLogin, onLogout, onRegister }) {
  const searchInput = useRef(null);
  useEffect(() => {
    function focusSearch(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k" && !document.querySelector("dialog[open]")) {
        event.preventDefault();
        searchInput.current?.focus();
      }
    }
    document.addEventListener("keydown", focusSearch);
    return () => document.removeEventListener("keydown", focusSearch);
  }, []);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const activePage = location.pathname.startsWith("/rooms/") ? "rooms" : params.get("page") || "home";
  return (
    <header className="border-b border-[#e8edf5] bg-white">
      <div className="mx-auto flex min-h-20 max-w-[1440px] flex-wrap items-center gap-3 px-4 pt-3.5 sm:px-6 min-[1024px]:flex-nowrap min-[1024px]:gap-5 min-[1024px]:px-8 min-[1024px]:pt-0 xl:gap-8 xl:px-10">
      <Brand />
      <nav className="order-4 flex w-full items-center justify-between gap-1 overflow-x-auto border-t border-slate-100 py-2 sm:justify-center sm:gap-3 min-[1024px]:order-none min-[1024px]:w-auto min-[1024px]:gap-1 min-[1024px]:border-0 min-[1024px]:py-0 xl:gap-2" aria-label="Điều hướng chính">
        {navigation.map((item) => (
          <Link key={item.key} className={`flex min-h-10 shrink-0 items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-xs leading-snug whitespace-nowrap no-underline min-[1024px]:px-2 xl:px-3.5 xl:text-sm ${activePage === item.key ? "bg-blue-50 font-semibold text-blue-600" : "text-slate-700 hover:bg-slate-50 hover:text-blue-600"}`} to={item.href} aria-current={activePage === item.key ? "page" : undefined}>
            {item.icon && <Icon name={item.icon} className="size-[15px]!" />}<span className="whitespace-nowrap">{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="contents sm:ml-auto sm:flex sm:flex-1 sm:items-center sm:justify-end sm:gap-3 min-[1024px]:flex-none">
        <form className="order-3 flex h-11 w-full items-center gap-2 rounded-xl border border-[#e3eaf3] bg-[#f1f5fa] px-3 focus-within:border-blue-400 focus-within:ring-3 focus-within:ring-blue-100 sm:order-none sm:w-[200px] xl:w-[250px]" action="/" method="get" role="search">
          <input type="hidden" name="page" value="rooms" />
          <button className="grid place-items-center border-0 bg-transparent p-0 text-slate-400" type="submit" aria-label="Tìm phòng"><Icon name="search" className="size-4!" /></button>
          <input className="w-full min-w-0 border-0 bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-500" ref={searchInput} name="q" aria-label="Tìm theo trường đại học hoặc khu vực" placeholder="Tìm theo trường ĐH, khu vực..." defaultValue={params.get("q") || ""} />
          <kbd className="shrink-0 rounded border border-slate-200 bg-white px-1 py-0.5 font-sans text-[10px] text-slate-500" aria-hidden="true">⌘K</kbd>
        </form>
        <Link className="ml-auto grid size-[30px] shrink-0 place-items-center rounded-full border border-[#e2e9f4] text-[#405474] hover:bg-blue-50 hover:text-blue-600 min-[601px]:ml-0 min-[601px]:size-[34px]" to="/?page=favorites" aria-label="Phòng đã lưu" title="Phòng đã lưu"><Icon name="heart" className="size-[18px]!" /></Link>
        <span className="hidden h-6 w-px bg-[#e8edf6] min-[601px]:block" aria-hidden="true" />
        <button className="flex min-h-[34px] max-w-[120px] items-center justify-center border-0 bg-transparent px-0 py-1 text-[11px] leading-snug font-semibold text-[#243858] hover:text-blue-600 min-[601px]:min-h-11 min-[601px]:max-w-[110px] min-[601px]:px-2.5 min-[601px]:text-sm" type="button" onClick={user ? onLogout : onLogin} title={user ? "Đăng xuất" : undefined} aria-label={user ? `${user.name} — Đăng xuất` : "Đăng nhập"}>
          <span className="overflow-hidden text-ellipsis whitespace-nowrap">{user ? user.name : "Đăng nhập"}</span>
        </button>
        {!user && <button className="shrink-0 whitespace-nowrap min-h-9 rounded-[9px] border border-[#2563f4] bg-[#2563f4] px-2 py-1.5 text-[11px] leading-snug font-semibold text-white hover:bg-blue-700 min-[601px]:min-h-[46px] min-[601px]:rounded-xl min-[601px]:px-[18px] min-[601px]:py-2 min-[601px]:text-[13px]" type="button" onClick={onRegister}>Đăng ký</button>}
      </div>
      </div>
    </header>
  );
}

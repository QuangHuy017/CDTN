import { useId, useState } from "react";
import Icon from "../common/Icon";

export default function AuthField({ label, icon, type = "text", ...props }) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const password = type === "password";
  return (
    <label htmlFor={id} className="block text-xs font-medium text-[#233752]">
      {label}
      <span className="relative mt-2 block">
        {icon && <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[#7e8999]"><Icon name={icon} className="size-4!" /></span>}
        <input id={id} type={password && visible ? "text" : type} className={`h-11 w-full rounded-lg border border-[#d5ddeb] bg-white py-2 text-xs font-normal text-slate-800 outline-none placeholder:text-[#99a2b0] focus:border-[#3e7dae] focus:ring-2 focus:ring-blue-50 disabled:bg-slate-50 ${icon ? "pl-10" : "pl-3"} ${password ? "pr-11" : "pr-3"}`} {...props} />
        {password && <button type="button" aria-label={visible ? `Ẩn ${label.toLowerCase()}` : `Hiện ${label.toLowerCase()}`} aria-pressed={visible} onClick={() => setVisible(!visible)} className="absolute inset-y-0 right-0 grid w-10 place-items-center rounded-r-lg text-slate-500 hover:text-blue-700"><Icon name={visible ? "eyeOff" : "eye"} className="size-4!" /></button>}
      </span>
    </label>
  );
}

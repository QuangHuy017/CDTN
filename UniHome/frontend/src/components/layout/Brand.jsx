import { Link } from "react-router-dom";
import Icon from "../common/Icon";
export default function Brand() {
  return (
    <Link className="inline-flex shrink-0 items-center gap-2.5 text-[#192b4b] no-underline min-[1024px]:basis-[150px] xl:basis-[180px]" to="/" aria-label="UniHome — Trang chủ">
      <span className="grid h-9 w-8 shrink-0 place-items-center rounded-xl bg-[#2563f4] text-white shadow-sm min-[601px]:h-10 min-[601px]:w-[38px]"><Icon name="building" className="size-[23px]!" /></span>
      <span className="flex flex-col gap-1.5">
        <span className="text-xl leading-none font-bold tracking-tight min-[901px]:text-[23px]">Uni<span className="text-[#2563f4]">Home</span></span>
        <span className="max-w-28 text-[8px] leading-relaxed text-[#71809a] min-[601px]:max-w-[135px] min-[601px]:text-[10px]">Nền tảng thuê phòng sinh viên</span>
      </span>
    </Link>
  );
}

import Icon from "../common/Icon";

export default function AuthLayout({ children, register = false }) {
  return (
    <main className="flex w-full flex-1 flex-col items-center justify-center bg-[#f7f9ff] px-4 py-10 sm:py-12">
      <div className={`w-full rounded-xl border border-[#dce3ee] bg-white px-6 py-8 shadow-[0_1px_2px_#233e5b04] sm:px-9 sm:py-9 ${register ? "max-w-[560px]" : "max-w-[440px]"}`}>{children}</div>
      <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-[11px] leading-relaxed text-slate-500"><Icon name="shield" className="size-4! text-emerald-600" />Mật khẩu của bạn được bảo vệ khi lưu trữ.</p>
    </main>
  );
}

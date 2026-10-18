import Icon from "../common/Icon";

const benefits = [
  { icon: "shield", title: "Thông tin minh bạch", description: "Xem hình ảnh, tiện ích và tình trạng phòng trước khi lựa chọn." },
  { icon: "bot", title: "Tìm phòng thông minh", description: "Tìm theo khu vực, ngân sách và diện tích phù hợp với bạn." },
  { icon: "document", title: "Chi phí rõ ràng", description: "Tham khảo giá thuê, tiền cọc, điện nước theo thông tin từng cơ sở." },
];

export default function WhyUniHome() {
  return (
    <section aria-labelledby="why-unihome" className="rounded-2xl border border-[#e0e7f5] bg-[#eff3ff] px-5 py-6">
      <h2 id="why-unihome" className="text-center text-sm font-semibold text-[#152c49]">Vì sao sinh viên chọn UniHome?</h2>
      <p className="mt-2 text-center text-xs leading-relaxed text-[#626c7d]">Nền tảng hỗ trợ sinh viên tìm căn phòng phù hợp với nhu cầu và ngân sách.</p>
      <div className="mt-5 grid gap-3 md:grid-cols-3">{benefits.map((benefit) => <div key={benefit.title} className="flex items-start gap-3 rounded-xl border border-[#edf0f7] bg-white p-4"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#e5efff] text-[#0077bf]"><Icon name={benefit.icon} className="size-[19px]!" /></span><div><h3 className="text-xs font-bold text-[#1c304d]">{benefit.title}</h3><p className="mt-1 text-xs leading-relaxed text-[#5c6777]">{benefit.description}</p></div></div>)}</div>
    </section>
  );
}

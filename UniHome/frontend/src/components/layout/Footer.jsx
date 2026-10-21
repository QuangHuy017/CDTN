import { useEffect, useRef, useState } from "react";
import Icon from "../common/Icon";

const information = [
  {
    title: "Về chúng tôi",
    paragraphs: ["UniHome là hệ thống tìm kiếm và thuê phòng trọ dành cho sinh viên. Bạn có thể xem phòng theo cơ sở, khu vực, giá thuê và diện tích.", "Thông tin phòng, hình ảnh và chi phí được hiển thị theo dữ liệu của từng cơ sở trong hệ thống."],
  },
  {
    title: "Quy chế hoạt động",
    paragraphs: ["Bạn có thể xem thông tin phòng và sử dụng bộ lọc mà không cần đăng nhập. Tài khoản quản trị được phân quyền để cập nhật cơ sở, phòng và tiện ích.", "Trước khi thuê, hãy xác nhận tình trạng phòng, chi phí và các điều khoản hợp đồng trực tiếp với cơ sở. Việc xem thông tin hoặc lưu phòng trên website không có nghĩa là đã đặt phòng."],
  },
  {
    title: "Chính sách bảo mật",
    paragraphs: ["Khi đăng ký, hệ thống nhận họ tên, email, số điện thoại và mật khẩu để tạo tài khoản. Mật khẩu được lưu trực tiếp trong cơ sở dữ liệu dưới dạng văn bản.", "Danh sách phòng yêu thích được lưu trong trình duyệt trên thiết bị của bạn. Nếu chọn Ghi nhớ tài khoản, email hoặc số điện thoại cũng được lưu trên trình duyệt. Website sử dụng cookie để duy trì phiên đăng nhập đến khi hết hạn hoặc bạn đăng xuất.", "Tính năng nhập giọng nói sử dụng chức năng nhận diện giọng nói của trình duyệt khi bạn chủ động bật micro."],
  },
  {
    title: "Liên hệ hỗ trợ",
    paragraphs: ["Để tìm phòng, hãy chọn khu vực, khoảng giá và diện tích ở đầu trang, hoặc nhập yêu cầu vào ô trợ lý UniHome.", "Để tìm hiểu một phòng, chọn Xem chi tiết trên thẻ phòng. Đầu mối liên hệ trực tiếp của từng cơ sở chưa được bổ sung trên website."],
  },
];

function FooterInformation({ item, onClose }) {
  const dialog = useRef(null);
  useEffect(() => {
    const element = dialog.current;
    const previousFocus = document.activeElement;
    element.showModal();
    return () => { element.close(); previousFocus?.focus(); };
  }, []);
  return (
    <dialog ref={dialog} aria-labelledby="footer-information-title" onCancel={(event) => { event.preventDefault(); onClose(); }} className="fixed inset-0 m-auto max-h-[85vh] w-[calc(100%_-_32px)] max-w-xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 text-[#18324e] shadow-2xl backdrop:bg-slate-950/40">
      <div className="flex items-center justify-between gap-4"><h2 id="footer-information-title" className="text-lg font-semibold">{item.title}</h2><button type="button" onClick={onClose} className="grid size-8 shrink-0 place-items-center rounded-full bg-slate-100 hover:bg-slate-200" aria-label="Đóng thông tin"><Icon name="close" className="size-4!" /></button></div>
      <div className="mt-5 space-y-4 text-sm leading-relaxed text-slate-600">{item.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
    </dialog>
  );
}

export default function Footer() {
  const [selected, setSelected] = useState(null);
  return (
    <footer className="mt-auto border-t border-[#e0e7f5] bg-[#eef3ff]" aria-label="Chân trang UniHome">
      <div className="mx-auto max-w-[1440px] px-4 pt-9 pb-8 sm:px-6 lg:px-10">
        <div className="flex flex-col justify-between gap-6 border-b border-[#e3eaf7] pb-6 md:flex-row md:items-center">
          <a href="/" className="inline-flex w-fit items-center gap-2 text-lg font-bold text-[#006b9e] no-underline" aria-label="UniHome — Trang chủ"><Icon name="building" className="size-6!" /><span>UniHome</span></a>
          <nav aria-label="Thông tin và hỗ trợ" className="flex flex-wrap items-center gap-x-7 gap-y-3">{information.map((item) => <button type="button" key={item.title} onClick={() => setSelected(item)} className="rounded text-xs text-[#465163] transition-colors hover:text-[#0073ae] hover:underline">{item.title}</button>)}</nav>
        </div>
        <div className="flex flex-col justify-between gap-3 pt-4 text-[11px] leading-relaxed text-[#536072] lg:flex-row lg:items-center">
          <p>© {new Date().getFullYear()} UniHome - Hệ thống tìm kiếm và thuê phòng trọ thông minh cho sinh viên. All rights reserved.</p>
        </div>
      </div>
      {selected && <FooterInformation item={selected} onClose={() => setSelected(null)} />}
    </footer>
  );
}

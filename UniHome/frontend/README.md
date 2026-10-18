# UniHome frontend — ReactJS + Vite

Frontend React + Vite + Tailwind, ưu tiên desktop: trang chủ có bộ lọc, tìm theo từ khóa, phòng nổi bật và footer; trang chi tiết phòng và các trang tài khoản dùng React Router.

## Đăng nhập và đăng ký

`/login` và `/register` là hai trang riêng, không mở modal. `App.jsx` dùng header gọn trên trang tài khoản và giữ footer chung. Form dùng API `/api/auth/login`, `/api/auth/register`, hỗ trợ hiện/ẩn mật khẩu, kiểm tra xác nhận mật khẩu và trạng thái đang gửi/lỗi.

Đăng nhập bằng email hoặc số điện thoại; đăng ký tạo tài khoản người thuê với họ tên, email, số điện thoại và mật khẩu. Tự đặt lại mật khẩu chưa khả dụng. Ghi nhớ tài khoản chỉ lưu email/số điện thoại trong trình duyệt, không lưu mật khẩu hoặc token. Sau đăng nhập, quay về trang trước nếu có; mặc định về trang chủ.

## Trang chi tiết phòng

Nút Xem chi tiết, tên và ảnh phòng dẫn tới `/rooms/:id`. React Router giữ Header/Footer chung trong `App.jsx`. Trang chi tiết tải phòng từ `/api/rooms/:id`, ghép cơ sở theo `maCoSo` và hỗ trợ mở trực tiếp đường dẫn hoặc tải lại trang.

Các component chi tiết nằm trong `src/components/rooms`: `RoomGallery`, `RoomCosts`, `RoomVisitCard`; trang chính là `src/pages/RoomDetailPage.jsx`. CSS dùng Tailwind trực tiếp trong JSX.

Lịch xem phòng được tải thành file `.ics` với trạng thái dự kiến, chưa gửi tới cơ sở. Chưa có API đặt lịch hoặc đánh giá. Khi triển khai static hosting cần cấu hình fallback các URL frontend như `/rooms/:id` về `index.html`, đồng thời chuyển tiếp `/api` sang backend.

## Cấu trúc

```text
frontend/
  index.html                  # Điểm vào HTML
  vite.config.js              # Dev server và proxy /api sang backend
  src/
    main.jsx                  # Gắn React vào trang
    App.jsx                   # Ghép trang, quản lý trạng thái đăng nhập
    components/
      common/Icon.jsx         # Icon dùng chung
      layout/
        Header.jsx            # Thanh header
        Brand.jsx             # Logo, tên thương hiệu
        NotificationMenu.jsx  # Bảng thông báo
      auth/
        AuthHeader.jsx        # Header gọn của trang tài khoản
        AuthLayout.jsx        # Khung form ở giữa trang
        AuthField.jsx         # Input và nút hiện/ẩn mật khẩu
    hooks/useAuthSubmit.js    # Gửi form, lỗi, timeout và hủy yêu cầu
    pages/HomePage.jsx        # Trang chủ
    pages/RoomDetailPage.jsx  # Chi tiết phòng
    pages/LoginPage.jsx       # Đăng nhập
    pages/RegisterPage.jsx    # Đăng ký
    services/authService.js   # Gọi API đăng nhập
    styles/global.css        # CSS nền và Tailwind
```

## Chạy dự án

Chạy trong terminal riêng:

```powershell
cd D:\CDTN\UniHome\frontend
npm.cmd install
npm.cmd run dev
```

Mở http://localhost:5173. Yêu cầu Node.js tương thích phiên bản Vite đã cài (máy hiện tại dùng Node 24).

Để đăng nhập, chạy backend ở cổng 3000 bằng terminal khác. Vite chuyển tiếp `/api` sang backend. Có thể tạo `.env` theo `.env.example` để đổi `BACKEND_URL` hoặc `FRONTEND_PORT`. Nếu báo cổng 5173 đã được dùng, dừng frontend cũ bằng Ctrl+C rồi chạy lại.

`npm.cmd run build` tạo bản production trong `dist/`. `npm.cmd run preview` xem thử bản build. Khi triển khai thật cần cấu hình reverse proxy `/api` sang backend.

Đăng nhập dùng collection `users` trong database backend đang chọn. Backend đặt cookie HttpOnly; `src/hooks/useAuthSession.js` khôi phục phiên khi tải lại trang, kiểm tra trạng thái khi quay lại cửa sổ và mỗi phút. Bấm tên tài khoản để đăng xuất và xóa cookie. Cookie hết hạn theo cấu hình JWT ở backend. Thông báo hiện là trạng thái rỗng, chưa kết nối API thông báo.


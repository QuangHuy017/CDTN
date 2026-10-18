# CDTN

# UniHome — Đồ án tốt nghiệp

Website tìm kiếm và thuê phòng trọ cho sinh viên, gồm frontend React và REST API Express kết nối MongoDB.

## Cấu trúc

```text
UniHome/
  frontend/    React, Vite, Tailwind CSS, React Router
  backend/     Express, Mongoose, JWT, bcrypt
```

## Chạy cục bộ

Yêu cầu Node.js 24 và một MongoDB local hoặc MongoDB Atlas.

Terminal backend:

```powershell
cd UniHome/backend
npm.cmd ci
Copy-Item .env.example .env
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Cập nhật `MONGO_URI`, `MONGO_DB` và `JWT_SECRET` trong `backend/.env`. Dùng khóa vừa tạo làm `JWT_SECRET`. Chỉ tạo `.env` khi chưa có file cấu hình của riêng bạn.

```powershell
npm.cmd run dev
```

Terminal frontend:

```powershell
cd UniHome/frontend
npm.cmd ci
npm.cmd run dev
```

Mở http://127.0.0.1:5173. Backend mặc định cổng 3000; Vite chuyển tiếp `/api` sang backend. Có thể tạo `frontend/.env` theo `.env.example` để thay đổi địa chỉ backend.

## Chức năng

- Trang chủ với bộ lọc khu vực, giá, diện tích và danh sách phòng phân trang.
- Chi tiết phòng, hình ảnh, tiện ích, chi phí và bản đồ nhúng.
- Đăng ký, đăng nhập email/số điện thoại, cookie HttpOnly, kiểm tra trạng thái và vai trò tài khoản.
- API CRUD cơ sở, phòng, tiện ích với quyền quản trị.
- Lưu phòng yêu thích trên trình duyệt và tải lịch xem phòng dự kiến `.ics`.

Tìm bằng ngôn ngữ tự nhiên hiện nhận diện từ khóa, chưa tích hợp mô hình AI. Lịch dự kiến chưa gửi tới cơ sở; chưa có API đánh giá hoặc tự đặt lại mật khẩu.

## Dữ liệu và tài liệu

Database mặc định `UniHome`, collection `CoSo`, `Phong`, `users`, `amenities`. File `UniHome/backend/seed/seed.json` chứa dữ liệu cơ sở/phòng dạng MongoDB Extended JSON, không phải bản xuất tài khoản.

- [API cơ sở và phòng](UniHome/backend/CATALOG_API.md)
- [Tài khoản và phân quyền](UniHome/backend/ROLES.md)
- [Hướng dẫn frontend](UniHome/frontend/README.md)

`.env`, mật khẩu, bản xuất tài khoản, `node_modules`, bản build và cache không được đưa vào repository. Cấu hình MongoDB riêng sau khi clone.

## Kiểm tra

```powershell
cd UniHome/backend
npm.cmd test
```

```powershell
cd UniHome/frontend
npm.cmd run build
```

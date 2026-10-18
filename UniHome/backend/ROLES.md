# Phân quyền UniHome

- `tenant`: Khách thuê, vai trò mặc định khi đăng ký.
- `admin`: Quản trị viên, cấp bằng lệnh trên máy chủ.

Collection `UniHome.users` lưu các trường `hoTen`, `email`, `soDienThoai`, `matKhau`, `vaiTro`, `trangThai`, `ngayTao`, `ngayCapNhat`. `vaiTro: "user"` được ánh xạ thành `user.role: "tenant"` trong API; `vaiTro: "admin"` tương ứng `admin`.

Đăng ký luôn lưu `vaiTro: "user"`, `trangThai: "hoat_dong"`, kể cả khi request gửi quyền admin hoặc trạng thái khác. `matKhau` chứa bcrypt, không chứa mật khẩu gốc và không được trả trong API.
Đăng ký, đăng nhập và `/api/auth/me` trả về `user.role` để giao diện hiển thị chức năng phù hợp.
Backend lấy quyền hiện tại từ database; thay đổi quyền có hiệu lực với cả token cũ.
Chỉ tài khoản `trangThai: "hoat_dong"` và vai trò hợp lệ được đăng nhập hoặc dùng API bảo vệ. `bi_khoa`, thiếu trạng thái hoặc vai trò không hợp lệ bị từ chối.

## Đăng ký, đăng nhập và phiên web

- `POST /api/auth/register`: `{ "name": "Nguyễn An", "email": "an@example.com", "phone": "0912345678", "password": "Password123!" }`. `phone` là tùy chọn ở API; form web yêu cầu nhập. Email và số điện thoại không được trùng. Mật khẩu đăng ký ít nhất 8 ký tự, tối đa 72 byte.
- `POST /api/auth/login`: `{ "identifier": "an@example.com", "password": "..." }` hoặc dùng số điện thoại. Định dạng cũ `{ "email": "...", "password": "..." }` vẫn được hỗ trợ. Số điện thoại được chuẩn hóa từ `+84` về đầu `0`.
- `GET /api/auth/me`: lấy tài khoản hiện tại, kiểm tra JWT và quyền/trạng thái trong database.
- `POST /api/auth/logout`: gửi JSON `{}` để xóa cookie phiên web.

Đăng ký/đăng nhập đặt cookie `unihome_session` với HttpOnly, SameSite=Lax, Path=/api, hết hạn theo JWT; Secure khi NODE_ENV=production. Frontend khôi phục phiên bằng `/me` khi tải trang và kiểm tra lại định kỳ/khi quay lại cửa sổ. Không lưu token hay mật khẩu trong localStorage.

API vẫn trả JWT Bearer cho các client tích hợp. Logout web xóa cookie, không thu hồi JWT Bearer đã được cấp; token hết hiệu lực khi hết hạn hoặc tài khoản bị khóa/xóa. Client Bearer phải xóa token của chính mình khi logout.

## Chuyển dữ liệu mật khẩu đã import

```powershell
node scripts/hash-user-passwords.js
node scripts/hash-user-passwords.js --write
```

Lệnh đầu chỉ kiểm tra. Lệnh `--write` băm các mật khẩu dạng văn bản hợp lệ, giữ nguyên mật khẩu đăng nhập, quyền và trạng thái. Không băm lại bcrypt đã có. Script không in mật khẩu. API không hỗ trợ so sánh mật khẩu dạng văn bản.

## Cấp hoặc thu hồi quyền

Chạy tại thư mục backend sau khi tài khoản đã đăng ký và `.env` đã cấu hình `MONGO_URI`:

```powershell
npm.cmd run user:role -- admin@example.com admin
npm.cmd run user:role -- admin@example.com tenant
```

## API được bảo vệ

Gửi header `Authorization: Bearer <token>`:

- `GET /api/auth/me`: mọi tài khoản đăng nhập.
- `GET /api/admin/me`: chỉ Admin.
- `GET /api/tenant/me`: chỉ Khách thuê.

Chưa đăng nhập hoặc token không hợp lệ trả `401`; sai vai trò trả `403`.
Hai API theo vai trò hiện trả thông tin tài khoản, chưa có chức năng quản lý phòng/hợp đồng.

Khi thêm API nghiệp vụ vào `app.js`, đặt trước middleware 404 và gắn kiểm tra quyền:

```js
app.get("/api/admin/example", authenticate, authorize("admin"), handler);
app.get("/api/tenant/example", authenticate, authorize("tenant"), handler);
// Chức năng chung cho cả hai vai trò:
app.get("/api/shared/example", authenticate, authorize("tenant", "admin"), handler);
```

API dữ liệu riêng của Khách thuê còn cần kiểm tra chủ sở hữu theo `req.user._id`.

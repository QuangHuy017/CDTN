# UniHome – API xác thực JWT

Backend Node.js, Express và MongoDB. Chạy bằng Node.js 20.19+.

## Khởi động

```powershell
cd D:\CDTN\UniHome\backend
npm.cmd install
# Nếu chưa có .env:
Copy-Item .env.example .env
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Điền chuỗi vừa tạo vào `JWT_SECRET` trong `backend/.env`, giữ `MONGO_URI` đang dùng hoặc cấu hình MongoDB của bạn. Không commit `.env`. `JWT_EXPIRES_IN` mặc định `1h`, `PORT` mặc định `3000`.

```powershell
npm.cmd run dev
npm.cmd test
```

## API

| Phương thức | Đường dẫn | Nội dung |
| --- | --- | --- |
| POST | `/api/auth/register` | JSON `{ "name": "Nguyễn An", "email": "an@example.com", "password": "Password123!" }` |
| POST | `/api/auth/login` | JSON `{ "email": "an@example.com", "password": "Password123!" }` |
| GET | `/api/auth/me` | Header `Authorization: Bearer <token>` |

Đăng ký trả HTTP 201; đăng nhập trả HTTP 200. Cả hai trả `{ token, tokenType: "Bearer", user: { id, name, email } }`. Profile trả `{ user }`. Lỗi trả `{ message }`: 400 dữ liệu sai, 401 đăng nhập/token sai hoặc hết hạn, 409 email trùng, 429 quá nhiều yêu cầu.

```powershell
$result = Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/auth/register -ContentType 'application/json' -Body '{"name":"An","email":"an@example.com","password":"Password123!"}'
Invoke-RestMethod -Uri http://localhost:3000/api/auth/me -Headers @{ Authorization = "Bearer $($result.token)" }
```

Mật khẩu được hash bằng bcrypt với cost 12; tối thiểu 8 ký tự và tối đa 72 byte UTF-8. Email được chuẩn hóa và có unique index. JWT HS256 có thời hạn, kiểm tra issuer/audience và người dùng còn tồn tại. API đăng ký/đăng nhập giới hạn tổng cộng 30 yêu cầu mỗi IP trong 15 phút; bộ đếm lưu trong bộ nhớ tiến trình.

Đăng xuất ở client bằng cách xóa token; token đã phát hành còn hiệu lực đến khi hết hạn. Chưa triển khai refresh token hoặc thu hồi token. Frontend hiện trống; phần này cung cấp API backend. Khi triển khai dùng HTTPS; nếu chạy sau proxy, cấu hình `trust proxy` theo hạ tầng để giới hạn IP đúng.

Test dùng kho người dùng giả lập, kiểm tra HTTP, hash mật khẩu, đăng nhập, lỗi dữ liệu, email trùng, JWT sai/hết hạn và giới hạn yêu cầu; không kết nối hay sửa MongoDB thật.

Tài liệu thư viện: [Express middleware](https://expressjs.com/en/guide/using-middleware/), [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken).

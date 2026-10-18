# API tòa nhà, phòng và tiện ích

Ba tài nguyên: `/api/buildings`, `/api/rooms`, `/api/amenities`.

Kết nối database `UniHome` (có thể đổi qua `MONGO_DB`). `/api/buildings` dùng collection `CoSo`, `/api/rooms` dùng collection `Phong`, phân biệt hoa/thường. Không cần import lại dữ liệu. Tài khoản đăng nhập và danh mục tiện ích cũng dùng database được chọn; tài khoản trước đây trong database `test` không tự chuyển sang `UniHome`.

| Phương thức | Đường dẫn | Chức năng |
| --- | --- | --- |
| GET | `/api/{resource}` | Danh sách, tìm kiếm, phân trang (công khai) |
| GET | `/api/{resource}/{id}` | Chi tiết (công khai) |
| POST | `/api/{resource}` | Tạo mới (admin) |
| PATCH | `/api/{resource}/{id}` | Cập nhật một phần (admin) |
| PUT | `/api/{resource}/{id}` | Cập nhật, yêu cầu đủ trường bắt buộc; trường tùy chọn không gửi được giữ nguyên (admin) |
| DELETE | `/api/{resource}/{id}` | Xóa (admin), trả 204 |

`id` là MongoDB ObjectId. Gửi `Authorization: Bearer <token>` khi ghi dữ liệu.
Mã định danh không được đổi. Tòa nhà có phòng và tiện ích đang được sử dụng không được xóa (409). Tiện ích đang sử dụng không được đổi tên.

## Trường dữ liệu

- Cơ sở: bắt buộc `maCoSo`, `tenCoSo`, `diaChi`, `khuVuc`, `soTang`, `toaDo`; tùy chọn `soPhongMoiTang`, `tongSoPhong`, `giaDien`, `giaNuoc`, `donViNuoc`, `tienCocThang`, `tienIchChung`, `noiQuy`. `toaDo` là `{ "type": "Point", "coordinates": [105.805, 20.995] }` (kinh độ trước vĩ độ). `noiQuy` là mảng chuỗi. `tongSoPhong` là thông tin khai báo, không tự đếm số phòng.
- Phòng: bắt buộc `maPhong`, `maCoSo`, `tenPhong`, `giaThue`, `dienTich`; tùy chọn `soPhong` (chuỗi, ví dụ `"201"`), `loaiPhong` (mặc định `phong_tro`), `tang`, `soNguoiToiDa`, `moTa`, `tienIch`, `hinhAnh`, `trangThai`, `giaDien`, `giaNuoc`. `maCoSo` tham chiếu mã cơ sở, không phải ObjectId. Trạng thái: `con_trong`, `da_thue`, `sap_trong`. Giá điện/nước của dữ liệu hiện có nằm ở cơ sở, có thể lấy qua `/api/buildings`.
- Tiện ích: bắt buộc `maTienIch`, `tenTienIch`; tùy chọn `moTa`. Các mảng `tienIch`/`tienIchChung` lưu tên tiện ích để tương thích dữ liệu seed hiện có; cho phép tên chưa có trong danh mục.

## Tìm kiếm và phân trang

Tất cả danh sách hỗ trợ `q`, `page` (mặc định 1), `limit` (mặc định 20, tối đa 100), `sort` (mặc định `-createdAt`). `q` tìm chuỗi con không phân biệt hoa/thường. `sort=giaThue` tăng dần, `sort=-giaThue` giảm dần; `_id` dùng để ổn định thứ tự khi bằng nhau.

Tòa nhà hỗ trợ `khuVuc`, `tienIch`. Phòng hỗ trợ `khuVuc`, `maCoSo`, `giaThueMin`, `giaThueMax`, `dienTichMin`, `dienTichMax`, `loaiPhong`, `trangThai`, `tienIch`.

`khuVuc` khớp toàn bộ tên, không phân biệt hoa/thường. Giá và diện tích lọc cả hai đầu mút. Loại phòng và tiện ích khớp chính xác; `tienIch` nhận danh sách tên phân cách bằng dấu phẩy và yêu cầu đủ tất cả tiện ích. Với phòng, tiện ích có thể thuộc phòng hoặc tòa nhà. Các bộ lọc kết hợp theo AND. Dữ liệu cũ thiếu `loaiPhong` cần được bổ sung trước khi lọc theo loại.

Ví dụ (URL encode tên có dấu khi gọi thực tế):

```http
GET /api/rooms?maCoSo=CS01&giaThueMin=2000000&giaThueMax=4000000&dienTichMin=20&tienIch=Wifi&page=1&limit=10&sort=giaThue
```

```json
{
  "data": [],
  "pagination": { "page": 1, "limit": 10, "total": 0, "totalPages": 0 }
}
```

Chi tiết/tạo/cập nhật trả `{ "data": { ... } }`. Lỗi trả `{ "message": "..." }`; dữ liệu không hợp lệ trả 400, chưa đăng nhập 401, thiếu quyền 403, không tồn tại 404, trùng mã/tên hoặc đang sử dụng 409.

Các kiểm tra tham chiếu được thực hiện ở tầng ứng dụng, chưa dùng transaction: các thao tác ghi đồng thời có thể gây xung đột tham chiếu. Không có xóa dây chuyền.

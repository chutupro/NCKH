# Hướng dẫn Triển khai Tính năng Quản lý Đóng góp Admin

## 📋 Tổng quan
Tính năng này cho phép admin quản lý các bài viết đóng góp từ người dùng. Các bài viết mới sẽ cần được admin xác nhận trước khi hiển thị trên trang cộng đồng.

## 🗄️ Bước 1: Chạy Migration Database

### Sử dụng SQL Server Management Studio (SSMS):
1. Mở file `BackEnd/src/migrations/20241124-add-verified-rejected-articles.sql`
2. Kết nối đến database của bạn
3. Chạy script SQL

### Hoặc sử dụng command line:
```bash
sqlcmd -S localhost -d YourDatabaseName -i BackEnd/src/migrations/20241124-add-verified-rejected-articles.sql
```

**Script này sẽ:**
- Thêm trường `Verified` (BIT, default 0) vào bảng `Articles`
- Thêm trường `Rejected` (BIT, default 0) vào bảng `Articles`
- Cập nhật tất cả bài viết cũ thành đã verified (để không ảnh hưởng đến dữ liệu hiện tại)

## 🔧 Bước 2: Khởi động Backend

```bash
cd BackEnd
npm install
npm run start:dev
```

Backend sẽ chạy tại: `http://localhost:3000`

## 🎨 Bước 3: Khởi động Frontend

```bash
cd FrontEnd
npm install
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173`

## 📍 Bước 4: Truy cập Admin Dashboard

1. Đăng nhập với tài khoản Admin
2. Truy cập: `http://localhost:5173/admin/contributions`

## ✨ Các Tính năng

### 1. Quản lý Đóng góp (Admin)
- **URL:** `/admin/contributions`
- **Tab "Chờ duyệt"**: Hiển thị danh sách bài viết chưa được xác nhận
- **Tab "Đã từ chối"**: Hiển thị danh sách bài viết bị từ chối

### 2. Các hành động Admin có thể thực hiện:
- ✅ **Duyệt bài viết**: Bài viết sẽ hiển thị trên trang cộng đồng
- ❌ **Từ chối bài viết**: Bài viết sẽ chuyển sang tab "Đã từ chối"
- 🔄 **Duyệt lại**: Duyệt lại các bài viết đã từ chối trước đó

### 3. Quy trình đóng góp:
```
Người dùng tạo bài viết mới
         ↓
Verified = false, Rejected = false
         ↓
    Hiển thị trong Admin > Đóng góp > Chờ duyệt
         ↓
    ┌───────────────────────┐
    ↓                       ↓
Admin DUYỆT          Admin TỪ CHỐI
    ↓                       ↓
Verified = true      Rejected = true
    ↓                       ↓
Hiển thị trên        Chuyển vào tab
Cộng đồng            "Đã từ chối"
```

## 🔌 API Endpoints

### Backend Endpoints đã thêm:

1. **GET** `/articles_post/pending/list`
   - Lấy danh sách bài viết chờ duyệt
   - Response: Array of pending articles

2. **GET** `/articles_post/rejected/list`
   - Lấy danh sách bài viết bị từ chối
   - Response: Array of rejected articles

3. **PUT** `/articles_post/:id/approve`
   - Duyệt bài viết
   - Params: `id` (article ID)

4. **PUT** `/articles_post/:id/reject`
   - Từ chối bài viết
   - Params: `id` (article ID)

## 📊 Database Schema Changes

```sql
-- Bảng Articles đã thêm 2 trường mới:
Verified BIT NOT NULL DEFAULT 0  -- Bài viết đã được duyệt
Rejected BIT NOT NULL DEFAULT 0  -- Bài viết bị từ chối
```

## 🎯 Logic nghiệp vụ

### Hiển thị trên trang cộng đồng:
- Chỉ hiển thị bài viết có: `Verified = true` AND `Rejected = false`

### Hiển thị trong Admin > Chờ duyệt:
- Hiển thị bài viết có: `Verified = false` AND `Rejected = false`

### Hiển thị trong Admin > Đã từ chối:
- Hiển thị bài viết có: `Rejected = true`

## 🔒 CORS Configuration

CORS đã được cấu hình trong `BackEnd/src/main.ts`:
```typescript
app.enableCors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
});
```

## 🎨 Giao diện

Giao diện admin contributions bao gồm:
- **Header**: Hiển thị tiêu đề và thống kê (số lượng chờ duyệt, đã từ chối)
- **Tabs**: Chuyển đổi giữa "Chờ duyệt" và "Đã từ chối"
- **Card Grid**: Hiển thị danh sách bài viết dạng card với:
  - Avatar và tên tác giả
  - Ngày tạo
  - Category
  - Ảnh đại diện (nếu có)
  - Tiêu đề và nội dung preview
  - Nút hành động (Duyệt/Từ chối)

## 🐛 Xử lý lỗi

- Tất cả API calls đều có try-catch
- Hiển thị alert khi có lỗi
- Loading state khi đang fetch dữ liệu
- Empty state khi không có dữ liệu

## 📝 Lưu ý

1. **Migration**: Phải chạy migration trước khi sử dụng tính năng
2. **Quyền truy cập**: Chỉ Admin mới có thể truy cập `/admin/contributions`
3. **Bài viết cũ**: Các bài viết đã tồn tại sẽ tự động được set `Verified = true`
4. **Bài viết mới**: Từ giờ, tất cả bài viết mới sẽ có `Verified = false` (cần duyệt)

## 🚀 Kiểm tra hoạt động

1. Tạo một bài viết mới từ trang Contribute
2. Bài viết sẽ không hiển thị ngay trên trang Community
3. Đăng nhập Admin và vào `/admin/contributions`
4. Bài viết sẽ hiển thị trong tab "Chờ duyệt"
5. Click "Duyệt" → Bài viết hiển thị trên Community
6. Hoặc click "Từ chối" → Bài viết chuyển sang tab "Đã từ chối"

## 📧 Hỗ trợ

Nếu gặp vấn đề, kiểm tra:
- Backend console log
- Browser console (F12)
- Network tab để xem API calls
- Database để xác nhận migration đã chạy thành công

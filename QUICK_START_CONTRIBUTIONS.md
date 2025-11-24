# 🚀 Quick Start - Chạy Migration

## Bước 1: Chạy SQL Migration

Mở SQL Server Management Studio và chạy file:
```
BackEnd/src/migrations/20241124-add-verified-rejected-articles.sql
```

Hoặc dùng command:
```bash
# Thay YourDatabaseName bằng tên database của bạn
sqlcmd -S localhost -d YourDatabaseName -i BackEnd/src/migrations/20241124-add-verified-rejected-articles.sql
```

## Bước 2: Khởi động Backend & Frontend

**Terminal 1 - Backend:**
```bash
cd BackEnd
npm run start:dev
```

**Terminal 2 - Frontend:**
```bash
cd FrontEnd
npm run dev
```

## Bước 3: Truy cập Admin

- URL: http://localhost:5173/admin/contributions
- Đăng nhập với tài khoản Admin

## ✅ Xong!

Giờ bạn có thể:
- Xem bài viết chờ duyệt
- Duyệt hoặc từ chối bài viết
- Quản lý đóng góp từ người dùng

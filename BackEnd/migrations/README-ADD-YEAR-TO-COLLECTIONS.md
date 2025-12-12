# Hướng dẫn chạy Migration - Thêm trường Year vào Collections

## 🎯 Mục đích
Thêm trường `Year` vào bảng `Collections` để lưu năm của bộ sưu tập.

## 📋 Các bước thực hiện

### **Cách 1: Dùng MySQL Workbench (Khuyến nghị)**

1. Mở **MySQL Workbench**
2. Kết nối đến database `DaNangDynamicVault`
3. Tạo Query tab mới
4. Copy nội dung file `migrations/20241211-add-year-to-collections.sql` và paste vào
5. Nhấn **Execute** (⚡ icon hoặc Ctrl+Shift+Enter)
6. Kiểm tra kết quả:
   ```sql
   DESC Collections;
   ```
   Phải thấy cột `Year INT NULL`

### **Cách 2: Dùng command line**

```bash
# Windows (PowerShell)
cd E:\NCKH\DUAN\NCKH\BackEnd
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p123456 -D DaNangDynamicVault < migrations/20241211-add-year-to-collections.sql

# Hoặc nếu MySQL trong PATH
mysql -u root -p123456 -D DaNangDynamicVault < migrations/20241211-add-year-to-collections.sql
```

### **Cách 3: Copy-paste thủ công**

1. Mở file `migrations/20241211-add-year-to-collections.sql`
2. Copy toàn bộ nội dung
3. Vào MySQL Workbench hoặc phpMyAdmin
4. Paste và Execute

## ✅ Kiểm tra sau khi chạy

```sql
-- Kiểm tra cấu trúc bảng
DESC Collections;

-- Kiểm tra dữ liệu
SELECT CollectionID, Name, Year, CreatedAt FROM Collections LIMIT 5;
```

## 🔄 Rollback (nếu cần)

```sql
-- Xóa cột Year nếu muốn rollback
ALTER TABLE Collections DROP COLUMN Year;
```

## 📝 Lưu ý

- Migration này **idempotent** (chạy nhiều lần không lỗi)
- Tự động cập nhật `Year` = năm từ `CreatedAt` cho các bộ sưu tập hiện tại
- Các bộ sưu tập mới sẽ có `Year = NULL` nếu không nhập

---

**Date:** December 11, 2025

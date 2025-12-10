# Timeline Status Migration Guide

## Tổng quan
Thêm cột `status` vào bảng `Timelines` để hỗ trợ workflow duyệt ảnh từ Gallery.

## Workflow mới

### 1. Từ Thư viện Ảnh (Gallery)
- Admin upload ảnh → Lưu vào `Images` table
- Ảnh tự động xuất hiện trong tab "Ảnh chờ duyệt" của Timeline Management

### 2. Quản lý Timeline
Admin có 2 lựa chọn:

#### A. Duyệt nhanh (Quick Approve)
- **Khi nào**: Ảnh KHÔNG có sự kiện lịch sử đặc biệt
- **Cách làm**: Bấm nút "✓ Duyệt nhanh"
- **Kết quả**: Tạo Timeline với `status = 'approved'`, hiển thị công khai ngay
- **Thông tin auto-fill**:
  - `title`: Lấy từ `Images.AltText`
  - `eventDate`: Năm hiện tại
  - `LocationID`: Địa điểm đầu tiên trong danh sách

#### B. Tạo chi tiết (Detailed Timeline)
- **Khi nào**: Ảnh CÓ sự kiện lịch sử quan trọng
- **Cách làm**: Bấm "+ Tạo chi tiết" → Điền form đầy đủ
- **Kết quả**: Có thể tạo NHIỀU timeline events cho cùng 1 ảnh
- **Thông tin**: Admin tự điền title, eventDate, description, sourceUrl, LocationID

## Migration Steps

### Bước 1: Chạy SQL Migration
```bash
# Kết nối MySQL
mysql -u root -p DaNangDynamicVault

# Chạy file migration
source E:/NCKH/DUAN/NCKH/BackEnd/src/migrations/20241210-add-timeline-status.sql
```

### Bước 2: Kiểm tra Database
```sql
-- Verify column added
DESCRIBE Timelines;

-- Check existing data (should all be 'approved')
SELECT status, COUNT(*) FROM Timelines GROUP BY status;

-- Check index
SHOW INDEX FROM Timelines WHERE Key_name = 'idx_timelines_status';
```

### Bước 3: Restart Backend
```bash
cd BackEnd
npm run dev
```

### Bước 4: Test Frontend
1. Mở http://localhost:5173/admin/timeline-management
2. Upload ảnh mới từ Gallery
3. Vào tab "Ảnh chờ duyệt" - ảnh mới sẽ hiện
4. Test "Duyệt nhanh" → Kiểm tra ảnh chuyển sang tab "Timeline đã tạo"
5. Test "Tạo chi tiết" → Điền form → Kiểm tra lưu thành công

## Database Schema Change

### Before
```sql
CREATE TABLE Timelines (
  TimelineID INT PRIMARY KEY AUTO_INCREMENT,
  title NVARCHAR(150) NOT NULL,
  eventDate VARCHAR(10) NOT NULL,
  description TEXT,
  ImageID INT,
  LocationID INT,
  sourceUrl VARCHAR(500)
);
```

### After
```sql
CREATE TABLE Timelines (
  TimelineID INT PRIMARY KEY AUTO_INCREMENT,
  title NVARCHAR(150) NOT NULL,
  eventDate VARCHAR(10) NOT NULL,
  description TEXT,
  ImageID INT,
  LocationID INT,
  sourceUrl VARCHAR(500),
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- NEW
  INDEX idx_timelines_status (status)             -- NEW
);
```

## Status Values
- `pending`: Chờ duyệt (không hiển thị public)
- `approved`: Đã duyệt (hiển thị công khai)
- `rejected`: Từ chối (không dùng trong workflow hiện tại)

## Rollback
Nếu cần quay lại schema cũ:
```sql
ALTER TABLE Timelines DROP COLUMN status;
DROP INDEX idx_timelines_status ON Timelines;
```

## Notes
- Tất cả timeline hiện tại sẽ được set `status = 'approved'` tự động
- Frontend tự động lọc ảnh "chờ duyệt" = ảnh có trong Images nhưng KHÔNG có trong Timelines
- Một ảnh có thể có nhiều timeline events (ví dụ: ảnh cầu Rồng có timeline "Khởi công 2009", "Khánh thành 2013")

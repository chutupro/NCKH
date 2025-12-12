-- Migration: Thêm trường Year vào bảng Collections
-- Date: 2024-12-11
-- Description: Thêm trường Year để lưu năm của bộ sưu tập

-- Kiểm tra và thêm cột Year nếu chưa có
IF NOT EXISTS (
    SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Collections' 
    AND COLUMN_NAME = 'Year'
)
BEGIN
    ALTER TABLE Collections
    ADD Year INT NULL;
    
    PRINT '✅ Đã thêm cột Year vào bảng Collections';
END
ELSE
BEGIN
    PRINT 'ℹ️ Cột Year đã tồn tại trong bảng Collections';
END;

-- Cập nhật Year mặc định cho các bộ sưu tập hiện tại (lấy năm từ CreatedAt)
UPDATE Collections
SET Year = YEAR(CreatedAt)
WHERE Year IS NULL AND CreatedAt IS NOT NULL;

PRINT '✅ Đã cập nhật Year từ CreatedAt cho các bộ sưu tập hiện tại';

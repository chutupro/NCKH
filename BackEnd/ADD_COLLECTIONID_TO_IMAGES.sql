-- Migration: Thêm CollectionID vào Images table
-- Mục đích: Liên kết ảnh với bộ sưu tập (Collections)
-- Ngày: 2024-12-11

USE DaNangDynamicVault;

-- Thêm column CollectionID
ALTER TABLE Images 
ADD COLUMN CollectionID INT NULL AFTER CategoryID;

-- Thêm foreign key constraint
ALTER TABLE Images
ADD CONSTRAINT FK_Images_Collections 
FOREIGN KEY (CollectionID) REFERENCES Collections(CollectionID)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- Kiểm tra kết quả
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE, 
    COLUMN_KEY,
    EXTRA
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'DaNangDynamicVault' 
  AND TABLE_NAME = 'Images'
  AND COLUMN_NAME = 'CollectionID';

-- Kiểm tra foreign key
SELECT 
    CONSTRAINT_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'DaNangDynamicVault'
  AND TABLE_NAME = 'Images'
  AND REFERENCED_TABLE_NAME = 'Collections';

SELECT '✅ Migration hoàn tất! CollectionID đã được thêm vào Images table.' AS Status;

-- Script: Cập nhật TẤT CẢ ảnh với CollectionID và AltText
-- Để hiển thị đúng Tên bộ sưu tập và Tiêu đề trong Timeline
-- Ngày: 2024-12-11

USE DaNangDynamicVault;

-- Kiểm tra bộ sưu tập hiện có
SELECT CollectionID, Name, Title, CategoryID FROM Collections;

-- Cập nhật ảnh CategoryID=4 (Sự kiện) → Collection ID=12
UPDATE Images 
SET 
    CollectionID = 12,
    AltText = CASE 
        WHEN AltText IS NULL OR AltText = '' 
        THEN 'Sự kiện lịch sử Đà Nẵng'
        ELSE AltText 
    END
WHERE CategoryID = 4 
  AND (CollectionID IS NULL OR CollectionID = 0);

-- Cập nhật ảnh CategoryID=2 (Văn hóa) → Collection ID=12
UPDATE Images 
SET 
    CollectionID = 12,
    AltText = CASE 
        WHEN AltText IS NULL OR AltText = '' 
        THEN 'Văn hóa truyền thống Đà Nẵng'
        ELSE AltText 
    END
WHERE CategoryID = 2 
  AND (CollectionID IS NULL OR CollectionID = 0);

-- Cập nhật ảnh CategoryID=3 (Thiên nhiên) → Collection ID=12
UPDATE Images 
SET 
    CollectionID = 12,
    AltText = CASE 
        WHEN AltText IS NULL OR AltText = '' 
        THEN 'Cảnh thiên nhiên Đà Nẵng'
        ELSE AltText 
    END
WHERE CategoryID = 3 
  AND (CollectionID IS NULL OR CollectionID = 0);

-- Cập nhật ảnh CategoryID=1 (Di sản) → Collection ID=12
UPDATE Images 
SET 
    CollectionID = 12,
    AltText = CASE 
        WHEN AltText IS NULL OR AltText = '' 
        THEN 'Di sản văn hóa Đà Nẵng'
        ELSE AltText 
    END
WHERE CategoryID = 1 
  AND (CollectionID IS NULL OR CollectionID = 0);

-- Kiểm tra kết quả
SELECT 
    i.ImageID,
    i.AltText AS 'Tiêu đề',
    cat.Name AS 'Danh mục',
    col.Title AS 'Bộ sưu tập',
    i.CollectionID
FROM Images i
LEFT JOIN Categories cat ON i.CategoryID = cat.CategoryID
LEFT JOIN Collections col ON i.CollectionID = col.CollectionID
ORDER BY i.ImageID DESC
LIMIT 20;

SELECT '✅ ĐÃ CẬP NHẬT! Bây giờ Ctrl+Shift+R trong browser để hard refresh!' AS Thông_báo;

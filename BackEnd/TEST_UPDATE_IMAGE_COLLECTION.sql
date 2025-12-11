-- Script: Gắn ảnh hiện có vào bộ sưu tập để test
-- Mục đích: Update CollectionID cho ảnh đã có sẵn trong database
-- Ngày: 2024-12-11

USE DaNangDynamicVault;

-- Kiểm tra các bộ sưu tập hiện có
SELECT CollectionID, Name, Title, CategoryID FROM Collections;

-- Ví dụ: Gắn tất cả ảnh CategoryID=3 (Thiên nhiên) vào bộ sưu tập ID=1
-- THAY ĐỔI GIÁ TRỊ SAU ĐÂY CHO PHÙHỢP:
-- UPDATE Images 
-- SET CollectionID = 1  -- ID của bộ sưu tập
-- WHERE CategoryID = 3   -- CategoryID của ảnh
--   AND CollectionID IS NULL;

-- Hoặc gắn ảnh cụ thể theo ImageID:
-- UPDATE Images 
-- SET CollectionID = 1,  -- ID của bộ sưu tập
--     AltText = 'Cảnh thiên nhiên Đà Nẵng'  -- Thêm tiêu đề nếu chưa có
-- WHERE ImageID = 3;

-- Kiểm tra kết quả
SELECT 
    i.ImageID,
    i.AltText AS 'Tiêu đề ảnh',
    i.CategoryID,
    i.CollectionID,
    col.Title AS 'Tên bộ sưu tập',
    cat.Name AS 'Danh mục'
FROM Images i
LEFT JOIN Collections col ON i.CollectionID = col.CollectionID
LEFT JOIN Categories cat ON i.CategoryID = cat.CategoryID
WHERE i.ImageID IN (SELECT ImageID FROM Images LIMIT 10);

SELECT '✅ Chạy các lệnh UPDATE phía trên để gắn ảnh vào bộ sưu tập!' AS Hướng_dẫn;

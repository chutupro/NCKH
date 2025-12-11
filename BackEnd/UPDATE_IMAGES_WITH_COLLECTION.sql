-- Script: Cập nhật ảnh hiện có với CollectionID và AltText
-- Để test hiển thị Tên bộ sưu tập và Tiêu đề trong Timeline
-- Ngày: 2024-12-11

USE DaNangDynamicVault;

-- BƯỚC 1: Xem danh sách bộ sưu tập hiện có
SELECT 
    CollectionID, 
    Name AS 'Slug', 
    Title AS 'Tên bộ sưu tập',
    CategoryID,
    (SELECT Name FROM Categories WHERE CategoryID = Collections.CategoryID) AS 'Danh mục'
FROM Collections
ORDER BY CollectionID;

-- BƯỚC 2: Xem danh sách ảnh hiện tại
SELECT 
    ImageID,
    AltText AS 'Tiêu đề hiện tại',
    CategoryID,
    CollectionID,
    SUBSTRING(FilePath, 1, 50) AS 'Đường dẫn'
FROM Images
LIMIT 10;

-- BƯỚC 3: Cập nhật ảnh với CollectionID và AltText
-- VÍ DỤ: Gắn ảnh CategoryID=2 (Văn hóa) vào bộ sưu tập ID=1 và thêm tiêu đề

-- Cập nhật tất cả ảnh Văn hóa (CategoryID=2) chưa có bộ sưu tập
UPDATE Images 
SET 
    CollectionID = 9,  -- ID bộ sưu tập "tt" (yy)
    AltText = CASE 
        WHEN AltText IS NULL OR AltText = '' 
        THEN CONCAT('Ảnh văn hóa #', ImageID)  -- Tiêu đề mặc định
        ELSE AltText 
    END
WHERE CategoryID = 2  -- Văn hóa
  AND (CollectionID IS NULL OR CollectionID = 0);

-- Hoặc cập nhật từng ảnh cụ thể:
-- UPDATE Images 
-- SET 
--     CollectionID = 1,
--     AltText = 'Lễ hội truyền thống Đà Nẵng'
-- WHERE ImageID = 3;

-- BƯỚC 4: Kiểm tra kết quả
SELECT 
    i.ImageID,
    i.AltText AS 'Tiêu đề ảnh',
    cat.Name AS 'Danh mục',
    col.Title AS 'Tên bộ sưu tập',
    i.CollectionID
FROM Images i
LEFT JOIN Categories cat ON i.CategoryID = cat.CategoryID
LEFT JOIN Collections col ON i.CollectionID = col.CollectionID
WHERE i.CategoryID = 2  -- Chỉ xem ảnh Văn hóa
LIMIT 10;

SELECT '✅ Đã cập nhật! Refresh trang Timeline để xem kết quả.' AS Trạng_thái;

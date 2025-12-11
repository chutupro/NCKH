-- Fix lỗi encoding trong Timeline titles
-- Chạy script này để sửa tiêu đề timeline bị lỗi encoding

USE DaNangDynamicVault;

-- Cập nhật timeline có title bị lỗi encoding
-- Thay bằng tiêu đề mặc định có ý nghĩa

UPDATE Timelines 
SET title = CONCAT('Sự kiện lịch sử năm ', YEAR(eventDate))
WHERE title LIKE '%Ã%' OR title LIKE '%á%º%' OR title LIKE '%â%';

-- Hoặc nếu muốn giữ nguyên tiêu đề, chỉ fix encoding:
-- UPDATE Timelines 
-- SET title = CONVERT(CAST(CONVERT(title USING latin1) AS BINARY) USING utf8mb4)
-- WHERE title LIKE '%Ã%';

SELECT * FROM Timelines;

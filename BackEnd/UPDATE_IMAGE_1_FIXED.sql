-- Cập nhật ảnh ID 1 với CollectionID hợp lệ
UPDATE Images 
SET 
  CollectionID = 1,
  AltText = 'Cảnh thiên nhiên Đà Nẵng'
WHERE ImageID = 1;

-- Kiểm tra kết quả
SELECT ImageID, AltText, CategoryID, CollectionID 
FROM Images 
WHERE ImageID = 1;

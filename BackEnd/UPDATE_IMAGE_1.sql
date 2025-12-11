-- Cập nhật ảnh ID 1 với CollectionID và AltText
UPDATE Images 
SET 
  CollectionID = 12,
  AltText = 'Cảnh thiên nhiên Đà Nẵng'
WHERE ImageID = 1;

-- Kiểm tra kết quả
SELECT ImageID, FilePath, AltText, CategoryID, CollectionID, Type 
FROM Images 
WHERE ImageID = 1;

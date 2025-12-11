-- ✅ UPDATE ảnh cũ với dữ liệu từ Collection
-- Chạy script này để fix ảnh đã tồn tại trước khi có code mới

-- Bước 1: Xem danh sách Collection
SELECT CollectionID, Name, Title, ImagePath, CategoryID 
FROM Collections
ORDER BY CollectionID DESC;

-- Bước 2: Xem danh sách ảnh trong Images table
SELECT ImageID, FilePath, AltText, CategoryID, CollectionID 
FROM Images
ORDER BY ImageID DESC;

-- Bước 3: UPDATE ảnh với CollectionID và AltText từ Collection
-- (Chỉ update ảnh có ImagePath trùng với Collection.ImagePath)
UPDATE Images
SET 
    CollectionID = c.CollectionID,
    AltText = COALESCE(c.Title, c.Name) -- Dùng Title, nếu null thì dùng Name
FROM Collections c
WHERE Images.FilePath = c.ImagePath
  AND Images.CollectionID IS NULL; -- Chỉ update ảnh chưa có CollectionID

-- Bước 4: Kiểm tra kết quả
SELECT 
    i.ImageID, 
    i.FilePath, 
    i.AltText, 
    i.CategoryID,
    i.CollectionID,
    c.Name AS CollectionName,
    c.Title AS CollectionTitle
FROM Images i
LEFT JOIN Collections c ON i.CollectionID = c.CollectionID
ORDER BY i.ImageID DESC;

-- ✅ Sau khi chạy script, refresh trang Admin Timeline Management để xem kết quả

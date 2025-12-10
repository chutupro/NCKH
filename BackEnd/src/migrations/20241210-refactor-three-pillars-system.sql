-- ============================================================
-- MIGRATION: Refactor Three Pillars System (Gallery-Map-Timeline)
-- Date: 2024-12-10
-- Description: Liên kết 3 trụ cột: Images (Gallery) - MapLocations - Timelines
-- ============================================================

-- ============================================================
-- STEP 1: Backup data hiện tại vào temporary columns
-- ============================================================
ALTER TABLE MapLocations
  ADD Image_backup NVARCHAR(500) NULL,
  ADD OldImage_backup NVARCHAR(500) NULL;

UPDATE MapLocations 
SET Image_backup = Image, 
    OldImage_backup = OldImage;

ALTER TABLE Timelines
  ADD image_backup NVARCHAR(500) NULL;

UPDATE Timelines 
SET image_backup = image;

-- ============================================================
-- STEP 2: Thêm columns mới cho MapLocations
-- ============================================================
ALTER TABLE MapLocations
  ADD MainImageID INT NULL,
  ADD OldImageID INT NULL;

-- Thêm foreign keys
ALTER TABLE MapLocations
  ADD CONSTRAINT FK_MapLocations_MainImage 
    FOREIGN KEY (MainImageID) REFERENCES Images(ImageID) ON DELETE SET NULL;

ALTER TABLE MapLocations
  ADD CONSTRAINT FK_MapLocations_OldImage 
    FOREIGN KEY (OldImageID) REFERENCES Images(ImageID) ON DELETE SET NULL;

-- ============================================================
-- STEP 3: Thêm columns mới cho Timelines
-- ============================================================
ALTER TABLE Timelines
  ADD ImageID INT NULL,
  ADD LocationID INT NULL;

-- Thêm foreign keys
ALTER TABLE Timelines
  ADD CONSTRAINT FK_Timelines_Image 
    FOREIGN KEY (ImageID) REFERENCES Images(ImageID) ON DELETE SET NULL;

ALTER TABLE Timelines
  ADD CONSTRAINT FK_Timelines_Location 
    FOREIGN KEY (LocationID) REFERENCES MapLocations(LocationID) ON DELETE SET NULL;

-- ============================================================
-- STEP 4: Thêm CategoryID vào Images (nếu chưa có)
-- ============================================================
IF NOT EXISTS (
  SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_NAME = 'Images' AND COLUMN_NAME = 'CategoryID'
)
BEGIN
  ALTER TABLE Images
    ADD CategoryID INT NULL;
  
  ALTER TABLE Images
    ADD CONSTRAINT FK_Images_Category 
      FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID) ON DELETE SET NULL;
END;

-- ============================================================
-- STEP 5: Migrate data từ URL string sang ImageID
-- ============================================================

-- NOTE: Phần này cần chạy script riêng vì phải:
-- 1. Tìm hoặc tạo Images record cho mỗi URL
-- 2. Update MainImageID/OldImageID/ImageID tương ứng
-- 
-- Script mẫu (chạy sau khi migration này):
/*
-- Đối với MapLocations.Image
DECLARE @url NVARCHAR(500), @locationId INT, @imageId INT;
DECLARE cur CURSOR FOR 
  SELECT LocationID, Image_backup FROM MapLocations WHERE Image_backup IS NOT NULL;

OPEN cur;
FETCH NEXT FROM cur INTO @locationId, @url;

WHILE @@FETCH_STATUS = 0
BEGIN
  -- Tìm hoặc tạo Images record
  SELECT @imageId = ImageID FROM Images WHERE FilePath = @url;
  
  IF @imageId IS NULL
  BEGIN
    INSERT INTO Images (FilePath, Type, AltText)
    VALUES (@url, 'map', 'Migrated from MapLocations');
    
    SET @imageId = SCOPE_IDENTITY();
  END;
  
  -- Update MainImageID
  UPDATE MapLocations SET MainImageID = @imageId WHERE LocationID = @locationId;
  
  FETCH NEXT FROM cur INTO @locationId, @url;
END;

CLOSE cur;
DEALLOCATE cur;

-- Tương tự cho OldImage và Timelines.image
*/

-- ============================================================
-- STEP 6: Xóa columns cũ không cần thiết
-- ============================================================

-- Xóa từ MapLocations
ALTER TABLE MapLocations DROP CONSTRAINT IF EXISTS FK_MapLocations_Timeline;
ALTER TABLE MapLocations DROP COLUMN IF EXISTS TimelineID;
ALTER TABLE MapLocations DROP COLUMN IF EXISTS ImageYear;
ALTER TABLE MapLocations DROP COLUMN IF EXISTS OldImageYear;

-- XÓA CategoryID từ MapLocations (theo Option B)
ALTER TABLE MapLocations DROP CONSTRAINT IF EXISTS FK_MapLocations_Category;
ALTER TABLE MapLocations DROP COLUMN IF EXISTS CategoryID;

-- Xóa từ Timelines
ALTER TABLE Timelines DROP CONSTRAINT IF EXISTS FK_Timelines_Article;
ALTER TABLE Timelines DROP COLUMN IF EXISTS ArticleID;

-- XÓA CategoryID từ Timelines (theo Option B)
ALTER TABLE Timelines DROP CONSTRAINT IF EXISTS FK_Timelines_Category;
ALTER TABLE Timelines DROP COLUMN IF EXISTS CategoryID;

-- Xóa column category string (giữ lại CategoryID FK)
ALTER TABLE Timelines DROP COLUMN IF EXISTS category;

-- ============================================================
-- STEP 7: Xóa columns string cũ (SAU KHI ĐÃ MIGRATE DATA)
-- ============================================================
-- UNCOMMENT SAU KHI ĐÃ MIGRATE DATA THÀNH CÔNG:

-- ALTER TABLE MapLocations DROP COLUMN Image;
-- ALTER TABLE MapLocations DROP COLUMN OldImage;
-- ALTER TABLE MapLocations DROP COLUMN Image_backup;
-- ALTER TABLE MapLocations DROP COLUMN OldImage_backup;

-- ALTER TABLE Timelines DROP COLUMN image;
-- ALTER TABLE Timelines DROP COLUMN image_backup;
-- ALTER TABLE Timelines DROP COLUMN sourceUrl;

-- ============================================================
-- STEP 8: Tạo indexes để tăng tốc query
-- ============================================================
CREATE INDEX IX_MapLocations_MainImageID ON MapLocations(MainImageID);
CREATE INDEX IX_MapLocations_OldImageID ON MapLocations(OldImageID);
CREATE INDEX IX_Timelines_ImageID ON Timelines(ImageID);
CREATE INDEX IX_Timelines_LocationID ON Timelines(LocationID);
CREATE INDEX IX_Images_CategoryID ON Images(CategoryID);

-- ============================================================
-- STEP 9: Thêm computed columns để dễ query (Optional)
-- ============================================================

-- Thêm column tính toán để lấy CategoryName từ Images
-- (Không lưu trực tiếp, chỉ tính khi query)

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================

-- Kiểm tra cấu trúc mới
SELECT 
  'MapLocations' as TableName,
  COUNT(*) as TotalRecords,
  COUNT(MainImageID) as HasMainImage,
  COUNT(OldImageID) as HasOldImage
FROM MapLocations;

SELECT 
  'Timelines' as TableName,
  COUNT(*) as TotalRecords,
  COUNT(ImageID) as HasImage,
  COUNT(LocationID) as HasLocation
FROM Timelines;

SELECT 
  'Images' as TableName,
  COUNT(*) as TotalRecords,
  COUNT(CategoryID) as HasCategory
FROM Images;

-- Kiểm tra relationships
SELECT 
  i.ImageID,
  i.FilePath,
  c.CategoryName,
  COUNT(DISTINCT ml1.LocationID) as UsedInMapAsMain,
  COUNT(DISTINCT ml2.LocationID) as UsedInMapAsOld,
  COUNT(DISTINCT t.TimelineID) as UsedInTimeline
FROM Images i
LEFT JOIN Categories c ON i.CategoryID = c.CategoryID
LEFT JOIN MapLocations ml1 ON i.ImageID = ml1.MainImageID
LEFT JOIN MapLocations ml2 ON i.ImageID = ml2.OldImageID
LEFT JOIN Timelines t ON i.ImageID = t.ImageID
GROUP BY i.ImageID, i.FilePath, c.CategoryName
HAVING COUNT(DISTINCT ml1.LocationID) > 0 
    OR COUNT(DISTINCT ml2.LocationID) > 0 
    OR COUNT(DISTINCT t.TimelineID) > 0;

-- ============================================================
-- ROLLBACK SCRIPT (Nếu cần)
-- ============================================================
/*
-- Khôi phục lại cấu trúc cũ
ALTER TABLE MapLocations DROP CONSTRAINT FK_MapLocations_MainImage;
ALTER TABLE MapLocations DROP CONSTRAINT FK_MapLocations_OldImage;
ALTER TABLE MapLocations DROP COLUMN MainImageID;
ALTER TABLE MapLocations DROP COLUMN OldImageID;

ALTER TABLE Timelines DROP CONSTRAINT FK_Timelines_Image;
ALTER TABLE Timelines DROP CONSTRAINT FK_Timelines_Location;
ALTER TABLE Timelines DROP COLUMN ImageID;
ALTER TABLE Timelines DROP COLUMN LocationID;

-- Khôi phục data từ backup
UPDATE MapLocations SET Image = Image_backup, OldImage = OldImage_backup;
UPDATE Timelines SET image = image_backup;

ALTER TABLE MapLocations DROP COLUMN Image_backup;
ALTER TABLE MapLocations DROP COLUMN OldImage_backup;
ALTER TABLE Timelines DROP COLUMN image_backup;
*/

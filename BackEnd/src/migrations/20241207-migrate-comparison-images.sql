-- Migration: Migrate existing data from imagecomparisons to comparisonimages
-- Date: 2024-12-07

-- Migrate old images (DisplayOrder = 0)
INSERT INTO comparisonimages (ComparisonID, ImagePath, Year, Caption, DisplayOrder)
SELECT 
  ComparisonID,
  OldImagePath,
  YearOld,
  CONCAT('Ảnh năm ', YearOld),
  0
FROM imagecomparisons
WHERE OldImagePath IS NOT NULL AND OldImagePath != ''
  AND NOT EXISTS (
    SELECT 1 FROM comparisonimages ci 
    WHERE ci.ComparisonID = imagecomparisons.ComparisonID AND ci.DisplayOrder = 0
  );

-- Migrate new images (DisplayOrder = 1)
INSERT INTO comparisonimages (ComparisonID, ImagePath, Year, Caption, DisplayOrder)
SELECT 
  ComparisonID,
  NewImagePath,
  YearNew,
  CONCAT('Ảnh năm ', YearNew),
  1
FROM imagecomparisons
WHERE NewImagePath IS NOT NULL AND NewImagePath != ''
  AND NOT EXISTS (
    SELECT 1 FROM comparisonimages ci 
    WHERE ci.ComparisonID = imagecomparisons.ComparisonID AND ci.DisplayOrder = 1
  );

-- Drop redundant columns from imagecomparisons
ALTER TABLE imagecomparisons 
DROP COLUMN OldImagePath,
DROP COLUMN NewImagePath,
DROP COLUMN YearOld,
DROP COLUMN YearNew;

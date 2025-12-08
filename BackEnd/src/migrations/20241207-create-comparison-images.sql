-- Migration: Create comparisonimages table to store multiple images per comparison
-- Date: 2024-12-07

CREATE TABLE IF NOT EXISTS comparisonimages (
  ImageID INT PRIMARY KEY AUTO_INCREMENT,
  ComparisonID INT NOT NULL,
  ImagePath VARCHAR(500) NOT NULL,
  Year INT,
  Caption TEXT,
  DisplayOrder INT DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (ComparisonID) REFERENCES imagecomparisons(ComparisonID) ON DELETE CASCADE,
  INDEX idx_comparison (ComparisonID),
  INDEX idx_comparison_order (ComparisonID, DisplayOrder)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

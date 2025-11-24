-- Migration: Thêm trường verified và rejected vào bảng Articles
-- Date: 2024-11-24

-- Thêm trường Verified (mặc định là 0 - false)
ALTER TABLE Articles
ADD Verified BIT NOT NULL DEFAULT 0;

-- Thêm trường Rejected (mặc định là 0 - false) 
ALTER TABLE Articles
ADD Rejected BIT NOT NULL DEFAULT 0;

-- Cập nhật các bài viết cũ thành đã verified
UPDATE Articles SET Verified = 1 WHERE CreatedAt < GETDATE();

-- Kiểm tra và chuẩn hóa Categories table
-- Đảm bảo 4 categories chính thức

USE DaNangDynamicVault;

-- Xem categories hiện tại
SELECT * FROM Categories ORDER BY CategoryID;

-- Nếu chưa có, tạo 4 categories chuẩn
-- (Uncomment nếu cần chạy lần đầu)

/*
INSERT INTO Categories (CategoryID, Name, Description) VALUES
(1, 'Di sản', 'Di sản văn hóa và lịch sử Đà Nẵng'),
(2, 'Văn hóa', 'Văn hóa và phong tục tập quán'),
(3, 'Thiên nhiên', 'Cảnh quan thiên nhiên và địa lý'),
(4, 'Sự kiện', 'Sự kiện và lễ hội nổi bật')
ON DUPLICATE KEY UPDATE 
Name = VALUES(Name),
Description = VALUES(Description);
*/

-- Verify mapping
SELECT 
  CategoryID,
  Name,
  CASE 
    WHEN CategoryID = 1 THEN 'di-san'
    WHEN CategoryID = 2 THEN 'van-hoa'
    WHEN CategoryID = 3 THEN 'thien-nhien'
    WHEN CategoryID = 4 THEN 'su-kien'
    ELSE 'other'
  END AS FolderName
FROM Categories
ORDER BY CategoryID;

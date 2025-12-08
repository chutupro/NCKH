-- Test data: Cầu Rồng Đà Nẵng qua các thời kỳ
-- Insert into imagecomparisons table
INSERT INTO imagecomparisons (Title, Description, CategoryID, Address, createdAt, updatedAt) VALUES
('Cầu Rồng Đà Nẵng', 'Cầu Rồng - Biểu tượng độc đáo của Đà Nẵng với công nghệ hiện đại và thiết kế độc đáo hình con rồng', 1, 'Bãi Bắc, Quận Hải Châu, Đà Nẵng', NOW(), NOW());

-- Get the ID (usually 2 if you already have Chợ Bến Thành)
-- Insert images for this comparison
INSERT INTO comparisonimages (ComparisonID, ImagePath, Year, Caption, DisplayOrder, createdAt) VALUES
(2, 'https://via.placeholder.com/600x400?text=Cầu+Rồng+1997', 1997, 'Khu vực Bãi Bắc năm 1997 - Trước khi xây dựng Cầu Rồng', 0, NOW()),
(2, 'https://via.placeholder.com/600x400?text=Cầu+Rồng+2009', 2009, 'Cầu Rồng năm 2009 - Vừa khánh thành, chiếu sáng đêm rực rỡ', 1, NOW()),
(2, 'https://via.placeholder.com/600x400?text=Cầu+Rồng+2015', 2015, 'Cầu Rồng 2015 - Du lịch phát triển mạnh, trở thành điểm tham quan nổi tiếng', 2, NOW()),
(2, 'https://via.placeholder.com/600x400?text=Cầu+Rồng+2024', 2024, 'Cầu Rồng 2024 - Cải tạo nâng cấp, thu hút hàng triệu du khách mỗi năm', 3, NOW()),
(2, 'https://via.placeholder.com/600x400?text=Cầu+Rồng+Đêm', 2024, 'Cầu Rồng về đêm - Hệ thống đèn LED thay đổi màu sắc theo chủ đề', 4, NOW());

-- Verify inserted data
SELECT * FROM imagecomparisons WHERE ComparisonID = 2;
SELECT * FROM comparisonimages WHERE ComparisonID = 2 ORDER BY DisplayOrder;

-- Test data for comparison timeline feature
-- Insert into imagecomparisons table
INSERT INTO imagecomparisons (Title, Description, CategoryID, Address, createdAt, updatedAt) VALUES
('Chợ Bến Thành', 'Chợ Bến Thành - Biểu tượng kiến trúc Sài Gòn qua các thời kỳ', 1, '1 Lê Lợi, Quận 1, TPHCM', NOW(), NOW());

-- Get the ID of the inserted comparison (usually 1 if first entry)
-- Then insert images for this comparison
INSERT INTO comparisonimages (ComparisonID, ImagePath, Year, Caption, DisplayOrder, createdAt) VALUES
(1, 'https://via.placeholder.com/600x400?text=Chợ+Bến+Thành+1914', 1914, 'Chợ Bến Thành năm 1914 - Kiến trúc Pháp gốc với mái vòm độc đáo', 0, NOW()),
(1, 'https://via.placeholder.com/600x400?text=Chợ+Bến+Thành+1950', 1950, 'Chợ Bến Thành năm 1950 - Sau tu sửa và cải tạo', 1, NOW()),
(1, 'https://via.placeholder.com/600x400?text=Chợ+Bến+Thành+1980', 1980, 'Chợ Bến Thành thập niên 80 - Hoạt động sôi động của Sài Gòn', 2, NOW()),
(1, 'https://via.placeholder.com/600x400?text=Chợ+Bến+Thành+2024', 2024, 'Chợ Bến Thành 2024 - Bảo tồn di sản lịch sử, phát triển du lịch', 3, NOW());

-- Verify inserted data
SELECT * FROM imagecomparisons;
SELECT * FROM comparisonimages ORDER BY ComparisonID, DisplayOrder;

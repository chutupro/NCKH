-- ⚡ FIX NHANH: Cho phép ArticleID = NULL trong Gallery uploads
-- Copy 3 dòng này vào MySQL Workbench và chạy:

ALTER TABLE `Images` DROP FOREIGN KEY `FK_d2b406909dcc8af0292678a527e`;
ALTER TABLE `Images` MODIFY COLUMN `ArticleID` INT NULL;
ALTER TABLE `Images` ADD CONSTRAINT `FK_Images_Articles` FOREIGN KEY (`ArticleID`) REFERENCES `Articles` (`ArticleID`) ON DELETE SET NULL ON UPDATE CASCADE;

-- ✅ Done! Giờ Gallery upload sẽ không bị lỗi ArticleID nữa.

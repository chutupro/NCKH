-- Adds year metadata for location photos and community submissions table

ALTER TABLE `MapLocations`
ADD COLUMN `ImageYear` INT NULL AFTER `Image`,
ADD COLUMN `OldImageYear` INT NULL AFTER `OldImage`;

CREATE TABLE IF NOT EXISTS `LocationImages` (
  `SubmissionID` INT NOT NULL AUTO_INCREMENT,
  `LocationID` INT NOT NULL,
  `UserID` INT NULL,
  `ImagePath` VARCHAR(255) NOT NULL,
  `Year` INT NULL,
  `Status` ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `CreatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`SubmissionID`),
  KEY `idx_location_images_location` (`LocationID`),
  CONSTRAINT `fk_location_images_location`
    FOREIGN KEY (`LocationID`) REFERENCES `MapLocations` (`LocationID`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;




-- Migration: Fix Foreign Key Constraints for Proper Deletion
-- Date: 2024-12-14
-- Description: Update foreign keys to use ON DELETE SET NULL for proper cascade behavior

USE danangdynamicvault;

-- ============================================
-- 1. Fix Images.CollectionID Foreign Key
-- ============================================
-- Drop existing constraint
ALTER TABLE `images` 
DROP FOREIGN KEY IF EXISTS `FK_26cc98bb28cf424dec88c4d10a3`;

-- Recreate with ON DELETE SET NULL
ALTER TABLE `images`
ADD CONSTRAINT `FK_26cc98bb28cf424dec88c4d10a3` 
FOREIGN KEY (`CollectionID`) 
REFERENCES `collections`(`CollectionID`) 
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- ============================================
-- 2. Fix MapLocations.MainImageID Foreign Key
-- ============================================
-- Drop existing constraint
ALTER TABLE `maplocations` 
DROP FOREIGN KEY IF EXISTS `FK_0f75d61b7b7e6851a07ec7d2436`;

-- Recreate with ON DELETE SET NULL
ALTER TABLE `maplocations`
ADD CONSTRAINT `FK_0f75d61b7b7e6851a07ec7d2436` 
FOREIGN KEY (`MainImageID`) 
REFERENCES `images`(`ImageID`) 
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- ============================================
-- 3. Fix MapLocations.OldImageID Foreign Key
-- ============================================
-- Drop existing constraint
ALTER TABLE `maplocations` 
DROP FOREIGN KEY IF EXISTS `FK_4ba92476a5b08a0ff23638d844e`;

-- Recreate with ON DELETE SET NULL
ALTER TABLE `maplocations`
ADD CONSTRAINT `FK_4ba92476a5b08a0ff23638d844e` 
FOREIGN KEY (`OldImageID`) 
REFERENCES `images`(`ImageID`) 
ON DELETE SET NULL 
ON UPDATE CASCADE;

-- ============================================
-- Verification
-- ============================================
-- Check the updated constraints
SELECT 
    TABLE_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    DELETE_RULE,
    UPDATE_RULE
FROM 
    INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS
WHERE 
    CONSTRAINT_SCHEMA = 'danangdynamicvault'
    AND CONSTRAINT_NAME IN (
        'FK_26cc98bb28cf424dec88c4d10a3',
        'FK_0f75d61b7b7e6851a07ec7d2436',
        'FK_4ba92476a5b08a0ff23638d844e'
    );

-- Expected output:
-- FK_26cc98bb28cf424dec88c4d10a3: images -> collections, SET NULL, CASCADE
-- FK_0f75d61b7b7e6851a07ec7d2436: maplocations -> images (MainImageID), SET NULL, CASCADE
-- FK_4ba92476a5b08a0ff23638d844e: maplocations -> images (OldImageID), SET NULL, CASCADE

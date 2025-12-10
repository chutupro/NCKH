-- Fix ArticleID constraint to allow NULL for Gallery uploads
-- Gallery images don't belong to Articles, so ArticleID should be nullable

-- Step 1: Check current constraint
SELECT 
    CONSTRAINT_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'danangdynamicvault'
  AND TABLE_NAME = 'Images'
  AND COLUMN_NAME = 'ArticleID';

-- Step 2: Drop existing FK constraint (if exists and doesn't allow NULL)
-- Replace 'FK_d2b406909dcc8af0292678a527e' with actual constraint name from Step 1
ALTER TABLE `Images` 
DROP FOREIGN KEY `FK_d2b406909dcc8af0292678a527e`;

-- Step 3: Ensure ArticleID column allows NULL
ALTER TABLE `Images` 
MODIFY COLUMN `ArticleID` INT NULL;

-- Step 4: Re-add FK constraint with ON DELETE SET NULL
ALTER TABLE `Images`
ADD CONSTRAINT `FK_Images_Articles` 
FOREIGN KEY (`ArticleID`) 
REFERENCES `Articles` (`ArticleID`)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- Step 5: Verify fix
SELECT 
    COLUMN_NAME,
    IS_NULLABLE,
    COLUMN_TYPE
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'danangdynamicvault'
  AND TABLE_NAME = 'Images'
  AND COLUMN_NAME = 'ArticleID';

-- Expected result: IS_NULLABLE = 'YES'

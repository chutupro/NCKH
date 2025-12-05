-- Migration: Add Moderation column to Articles table
-- Date: 2024-12-05
-- Description: Add JSON column to store AI moderation results for articles

-- Add Moderation column as JSON type (supports MySQL 5.7.8+ and MariaDB 10.2.7+)
ALTER TABLE Articles 
ADD COLUMN Moderation JSON NULL
COMMENT 'Stores AI moderation results in JSON format';

-- If using older MySQL/MariaDB that doesn't support JSON type, use TEXT instead:
-- ALTER TABLE Articles 
-- ADD COLUMN Moderation TEXT NULL
-- COMMENT 'Stores AI moderation results in JSON format';

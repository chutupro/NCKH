-- Migration: Add status column to Timelines table
-- Date: 2024-12-10
-- Purpose: Support pending/approved/rejected workflow for timeline management

USE DaNangDynamicVault;

-- Step 1: Add status column with default 'pending'
ALTER TABLE Timelines
ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'pending'
COMMENT 'Timeline approval status: pending, approved, rejected';

-- Step 2: Update existing timelines to 'approved' (assume all current data is approved)
UPDATE Timelines
SET status = 'approved'
WHERE status = 'pending';

-- Step 3: Create index for faster filtering by status
CREATE INDEX idx_timelines_status ON Timelines(status);

-- Step 4: Verify changes
SELECT 
  TimelineID,
  title,
  eventDate,
  status,
  ImageID,
  LocationID
FROM Timelines
LIMIT 10;

-- Rollback script (if needed):
-- ALTER TABLE Timelines DROP COLUMN status;
-- DROP INDEX idx_timelines_status ON Timelines;

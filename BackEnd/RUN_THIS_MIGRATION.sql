-- Quick Migration: Add status column to Timelines
-- Run this in MySQL Workbench or command line

USE DaNangDynamicVault;

-- Add status column
ALTER TABLE Timelines 
ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'pending' 
COMMENT 'Timeline approval status: pending, approved, rejected';

-- Set all existing timelines to approved
UPDATE Timelines 
SET status = 'approved' 
WHERE status = 'pending';

-- Add index for performance
CREATE INDEX idx_timelines_status ON Timelines(status);

-- Verify
SELECT 'Migration completed successfully!' AS Result;
DESCRIBE Timelines;
SELECT status, COUNT(*) AS count FROM Timelines GROUP BY status;

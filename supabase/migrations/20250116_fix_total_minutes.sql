-- Migration: Fix total_minutes in user_meditation_minutes table
-- Description: Reset total_minutes to 0 since no meditations have been used yet
-- Created at: 2025-01-22 20:49:40 EST

-- Reset total_minutes to 0 for all users where it equals available_minutes
-- This means they haven't used any minutes yet
UPDATE user_meditation_minutes
SET 
    total_minutes = 0,
    updated_at = NOW()
WHERE total_minutes = available_minutes;

-- Add a comment to track this migration
COMMENT ON TABLE user_meditation_minutes IS 'Total minutes reset to 0 on 2025-01-22. Total minutes now tracks only completed meditation sessions.';

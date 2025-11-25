-- =====================================================
-- FIX: Add 'stopped' to Campaign Status Constraint
-- =====================================================
-- Run this in Supabase SQL Editor
-- Project: jtdqqbswhhrrhckyuicp (your frontend database)
-- =====================================================

-- Drop the old constraint
ALTER TABLE campaigns 
DROP CONSTRAINT IF EXISTS campaigns_status_check;

-- Add new constraint with 'stopped' included
ALTER TABLE campaigns 
ADD CONSTRAINT campaigns_status_check 
CHECK (status IN ('active', 'draft', 'completed', 'stopped'));

-- Verify it worked (should show the new constraint)
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'campaigns'::regclass
AND conname = 'campaigns_status_check';


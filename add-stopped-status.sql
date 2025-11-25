-- Add 'stopped' to allowed campaign status values
-- Run this in your Supabase SQL Editor

-- First, drop the existing constraint
ALTER TABLE campaigns 
DROP CONSTRAINT IF EXISTS campaigns_status_check;

-- Then, add a new constraint with 'stopped' included
ALTER TABLE campaigns 
ADD CONSTRAINT campaigns_status_check 
CHECK (status IN ('active', 'draft', 'completed', 'stopped'));

-- Verify the constraint was added
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'campaigns'::regclass
AND conname = 'campaigns_status_check';


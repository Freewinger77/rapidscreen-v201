-- ================================================================
-- RESET TEST CANDIDATES FOR RETELL AI TESTING
-- ================================================================

-- This script resets 5 candidates in your campaign to 'not_called'
-- so you can test the Retell AI calling feature

-- Option 1: Reset 5 existing candidates
UPDATE campaign_candidates
SET 
  call_status = 'not_called',
  available_to_work = NULL,
  interested = NULL,
  know_referee = NULL,
  last_contact = NULL
WHERE campaign_id = 'd9967c8e-33eb-47c0-851a-4c459ec234eb'
AND id IN (
  SELECT id 
  FROM campaign_candidates 
  WHERE campaign_id = 'd9967c8e-33eb-47c0-851a-4c459ec234eb'
  LIMIT 5
);

-- Option 2: Add yourself as a test candidate
-- (Replace with YOUR actual phone number!)
/*
INSERT INTO campaign_candidates (
  campaign_id,
  forename,
  surname,
  tel_mobile,
  email,
  call_status,
  available_to_work,
  interested,
  know_referee
) VALUES (
  'd9967c8e-33eb-47c0-851a-4c459ec234eb',
  'Test',
  'User',
  '+44_YOUR_PHONE_NUMBER_HERE',
  'test@example.com',
  'not_called',
  NULL,
  NULL,
  NULL
);
*/

-- Verify the reset worked
SELECT 
  COUNT(*) as not_called_count
FROM campaign_candidates
WHERE campaign_id = 'd9967c8e-33eb-47c0-851a-4c459ec234eb'
AND call_status = 'not_called';

-- Expected result: 5 candidates (or 6 if you added yourself)

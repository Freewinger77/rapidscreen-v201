-- Check for duplicate phone numbers across campaigns
-- This helps identify candidates who might be contacted multiple times

-- Find phone numbers that exist in multiple campaigns
SELECT 
  tel_mobile,
  COUNT(DISTINCT campaign_id) as campaign_count,
  COUNT(*) as total_entries,
  STRING_AGG(DISTINCT forename || ' ' || surname, ', ') as names,
  STRING_AGG(DISTINCT campaign_id::text, ', ') as campaign_ids
FROM campaign_candidates
GROUP BY tel_mobile
HAVING COUNT(DISTINCT campaign_id) > 1
ORDER BY campaign_count DESC, total_entries DESC;

-- Add unique constraint to prevent same phone in same campaign
-- (Allows same phone across different campaigns but not duplicates within one)
ALTER TABLE campaign_candidates 
ADD CONSTRAINT unique_phone_per_campaign 
UNIQUE (campaign_id, tel_mobile);

-- Create index for fast duplicate checking
CREATE INDEX IF NOT EXISTS idx_campaign_candidates_phone 
ON campaign_candidates(tel_mobile);

-- Function to check if candidate was recently contacted
CREATE OR REPLACE FUNCTION check_recent_contact(
  p_phone_number TEXT,
  p_days_ago INTEGER DEFAULT 30
) RETURNS TABLE (
  campaign_name TEXT,
  last_contact TIMESTAMP,
  call_status TEXT,
  days_since_contact INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.name as campaign_name,
    cc.last_contact,
    cc.call_status,
    EXTRACT(DAY FROM NOW() - cc.last_contact)::INTEGER as days_since_contact
  FROM campaign_candidates cc
  JOIN campaigns c ON c.id = cc.campaign_id
  WHERE cc.tel_mobile = p_phone_number
    AND cc.last_contact IS NOT NULL
    AND cc.last_contact > NOW() - (p_days_ago || ' days')::INTERVAL
  ORDER BY cc.last_contact DESC;
END;
$$ LANGUAGE plpgsql;

-- Usage:
-- SELECT * FROM check_recent_contact('+447123456789', 30);


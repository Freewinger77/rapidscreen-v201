-- ================================================
-- RETELL AI INTEGRATION TABLES
-- ================================================

-- Store Retell agent configurations per campaign
CREATE TABLE IF NOT EXISTS campaign_retell_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  retell_agent_id TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  base_prompt TEXT NOT NULL,
  dynamic_questions JSONB DEFAULT '[]',
  job_context JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Track individual calls made through Retell
CREATE TABLE IF NOT EXISTS retell_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES campaign_candidates(id) ON DELETE CASCADE,
  retell_call_id TEXT UNIQUE NOT NULL,
  retell_agent_id TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  call_status TEXT NOT NULL DEFAULT 'pending',
  duration_seconds INTEGER,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_call_status CHECK (
    call_status IN ('pending', 'in_progress', 'completed', 'failed')
  )
);

-- Store post-call analysis from Retell
CREATE TABLE IF NOT EXISTS retell_call_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retell_call_id TEXT NOT NULL REFERENCES retell_calls(retell_call_id) ON DELETE CASCADE,
  campaign_candidate_id UUID NOT NULL REFERENCES campaign_candidates(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  
  -- Standard analysis fields
  available_to_work BOOLEAN DEFAULT false,
  interested BOOLEAN DEFAULT false,
  know_referee BOOLEAN DEFAULT false,
  
  -- Dynamic fields from campaign matrix
  custom_responses JSONB DEFAULT '{}',
  
  -- Retell analysis results
  call_summary TEXT,
  sentiment_score DECIMAL(3,2) CHECK (sentiment_score >= 0 AND sentiment_score <= 1),
  transcript_url TEXT,
  recording_url TEXT,
  
  -- Extracted insights
  next_steps TEXT,
  objections TEXT[],
  key_points TEXT[],
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Batch call jobs for tracking bulk operations
CREATE TABLE IF NOT EXISTS retell_batch_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  total_candidates INTEGER NOT NULL CHECK (total_candidates > 0),
  completed_calls INTEGER DEFAULT 0 CHECK (completed_calls >= 0),
  failed_calls INTEGER DEFAULT 0 CHECK (failed_calls >= 0),
  status TEXT NOT NULL DEFAULT 'preparing',
  configuration JSONB DEFAULT '{}', -- Store batch settings
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_batch_status CHECK (
    status IN ('preparing', 'in_progress', 'completed', 'cancelled', 'failed')
  ),
  CONSTRAINT valid_counts CHECK (
    completed_calls + failed_calls <= total_candidates
  )
);

-- ================================================
-- INDEXES FOR PERFORMANCE
-- ================================================

CREATE INDEX IF NOT EXISTS idx_campaign_retell_agents_campaign_id 
  ON campaign_retell_agents(campaign_id);

CREATE INDEX IF NOT EXISTS idx_retell_calls_campaign_id 
  ON retell_calls(campaign_id);

CREATE INDEX IF NOT EXISTS idx_retell_calls_candidate_id 
  ON retell_calls(candidate_id);

CREATE INDEX IF NOT EXISTS idx_retell_calls_status 
  ON retell_calls(call_status);

CREATE INDEX IF NOT EXISTS idx_retell_calls_created 
  ON retell_calls(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_retell_call_analysis_candidate_id 
  ON retell_call_analysis(campaign_candidate_id);

CREATE INDEX IF NOT EXISTS idx_retell_call_analysis_campaign_id 
  ON retell_call_analysis(campaign_id);

CREATE INDEX IF NOT EXISTS idx_retell_batch_calls_campaign_id 
  ON retell_batch_calls(campaign_id);

CREATE INDEX IF NOT EXISTS idx_retell_batch_calls_status 
  ON retell_batch_calls(status);

-- ================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================

ALTER TABLE campaign_retell_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE retell_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE retell_call_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE retell_batch_calls ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your auth setup)
CREATE POLICY "Enable all operations for campaign_retell_agents" 
  ON campaign_retell_agents
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable all operations for retell_calls" 
  ON retell_calls
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable all operations for retell_call_analysis" 
  ON retell_call_analysis
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable all operations for retell_batch_calls" 
  ON retell_batch_calls
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ================================================
-- TRIGGER FUNCTIONS
-- ================================================

-- Update timestamps automatically
CREATE OR REPLACE FUNCTION update_retell_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER trigger_update_campaign_retell_agents_updated_at
  BEFORE UPDATE ON campaign_retell_agents
  FOR EACH ROW
  EXECUTE FUNCTION update_retell_updated_at();

-- Function to update campaign candidate after call analysis
CREATE OR REPLACE FUNCTION update_candidate_from_analysis()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the campaign_candidates table with analysis results
  UPDATE campaign_candidates
  SET 
    available_to_work = NEW.available_to_work,
    interested = NEW.interested,
    know_referee = NEW.know_referee,
    last_contact = NOW(),
    call_status = 'contacted'
  WHERE id = NEW.campaign_candidate_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update candidate after analysis
CREATE TRIGGER trigger_update_candidate_after_analysis
  AFTER INSERT ON retell_call_analysis
  FOR EACH ROW
  EXECUTE FUNCTION update_candidate_from_analysis();

-- ================================================
-- SAMPLE DATA (Optional - Remove in production)
-- ================================================

-- Example: How to query call results with analysis
/*
SELECT 
  c.forename,
  c.surname,
  c.tel_mobile,
  rc.call_status,
  rc.duration_seconds,
  rca.available_to_work,
  rca.interested,
  rca.sentiment_score,
  rca.call_summary
FROM campaign_candidates c
LEFT JOIN retell_calls rc ON rc.candidate_id = c.id
LEFT JOIN retell_call_analysis rca ON rca.campaign_candidate_id = c.id
WHERE c.campaign_id = 'your-campaign-id'
ORDER BY rc.created_at DESC;
*/

-- ================================================
-- CLEANUP (if needed to reset)
-- ================================================
/*
DROP TABLE IF EXISTS retell_call_analysis CASCADE;
DROP TABLE IF EXISTS retell_calls CASCADE;
DROP TABLE IF EXISTS retell_batch_calls CASCADE;
DROP TABLE IF EXISTS campaign_retell_agents CASCADE;
*/

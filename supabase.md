-- ============================================
-- RAPIDSCREEN V2 - COMPLETE DATABASE SCHEMA
-- ============================================
-- This schema supports:
-- - Jobs with dynamic Kanban boards
-- - Campaigns with call tracking
-- - Datasets with candidate pools
-- - Full audit trail and notes
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- JOBS & KANBAN SYSTEM
-- ============================================

-- Jobs Table
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT NOT NULL,
  employment_type TEXT NOT NULL,
  salary_range TEXT NOT NULL,
  open_positions INTEGER NOT NULL DEFAULT 0,
  hired INTEGER NOT NULL DEFAULT 0,
  target INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Kanban Columns (Swimlanes) - Dynamic per job
CREATE TABLE kanban_columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status_key TEXT NOT NULL, -- 'not-contacted', 'interested', 'custom-123456789'
  color TEXT NOT NULL DEFAULT 'hsl(var(--chart-1))',
  position INTEGER NOT NULL DEFAULT 0, -- Order of columns
  is_default BOOLEAN DEFAULT FALSE, -- Mark default columns
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, status_key)
);

-- Job Candidates (Kanban Cards)
CREATE TABLE candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  status TEXT NOT NULL, -- References kanban_columns.status_key
  position INTEGER NOT NULL DEFAULT 0, -- Position within column
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Candidate Notes (Timeline/Activity)
CREATE TABLE candidate_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  author TEXT NOT NULL,
  action_type TEXT, -- 'call', 'email', 'meeting', 'whatsapp'
  action_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CAMPAIGNS & CALL TRACKING
-- ============================================

-- Campaigns
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  job_title TEXT NOT NULL,
  link_job TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  channels TEXT[] DEFAULT '{}', -- ['WhatsApp', 'Call', 'Email']
  total_candidates INTEGER DEFAULT 0,
  hired INTEGER DEFAULT 0,
  response_rate DECIMAL(5,2) DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('active', 'draft', 'completed')) DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaign Targets (Goals/Metrics to collect)
CREATE TABLE campaign_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('column', 'custom')),
  description TEXT,
  goal_type TEXT CHECK (goal_type IN ('text', 'number', 'boolean')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaign Matrices (Scripts/Templates)
CREATE TABLE campaign_matrices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  whatsapp_message TEXT,
  call_script TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaign Candidates (Separate from job candidates)
CREATE TABLE campaign_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  forename TEXT NOT NULL,
  surname TEXT NOT NULL,
  tel_mobile TEXT NOT NULL,
  email TEXT,
  call_status TEXT NOT NULL CHECK (call_status IN (
    'not_called', 'agent_hangup', 'user_declined', 'user_hangup', 
    'no_answer', 'voicemail', 'invalid_destination'
  )) DEFAULT 'not_called',
  available_to_work BOOLEAN,
  interested BOOLEAN,
  know_referee BOOLEAN,
  last_contact TEXT,
  experience TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Call Records
CREATE TABLE call_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_candidate_id UUID NOT NULL REFERENCES campaign_candidates(id) ON DELETE CASCADE,
  call_id TEXT NOT NULL UNIQUE, -- External call system ID
  phone_from TEXT NOT NULL,
  phone_to TEXT NOT NULL,
  duration TEXT NOT NULL,
  available_to_work BOOLEAN,
  interested BOOLEAN,
  know_referee BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Call Transcript Messages
CREATE TABLE call_transcript_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_record_id UUID NOT NULL REFERENCES call_records(id) ON DELETE CASCADE,
  speaker TEXT NOT NULL CHECK (speaker IN ('user', 'agent')),
  message TEXT NOT NULL,
  timestamp TEXT,
  sequence INTEGER NOT NULL DEFAULT 0, -- Order in conversation
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- WhatsApp Messages
CREATE TABLE whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_candidate_id UUID NOT NULL REFERENCES campaign_candidates(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'agent')),
  text TEXT NOT NULL,
  status TEXT CHECK (status IN ('sent', 'delivered', 'read')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaign Candidate Notes
CREATE TABLE campaign_candidate_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_candidate_id UUID NOT NULL REFERENCES campaign_candidates(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  author TEXT NOT NULL,
  action_type TEXT, -- 'call', 'email', 'meeting', 'whatsapp'
  action_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DATASETS (Candidate Pools)
-- ============================================

-- Datasets
CREATE TABLE datasets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  candidate_count INTEGER DEFAULT 0,
  source TEXT NOT NULL CHECK (source IN ('csv', 'manual', 'imported')) DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dataset Candidates
CREATE TABLE dataset_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  postcode TEXT,
  location TEXT,
  trade TEXT,
  blue_card BOOLEAN DEFAULT FALSE,
  green_card BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Jobs
CREATE INDEX idx_jobs_company ON jobs(company);
CREATE INDEX idx_jobs_location ON jobs(location);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);

-- Kanban Columns
CREATE INDEX idx_kanban_columns_job_id ON kanban_columns(job_id);
CREATE INDEX idx_kanban_columns_position ON kanban_columns(job_id, position);

-- Candidates
CREATE INDEX idx_candidates_job_id ON candidates(job_id);
CREATE INDEX idx_candidates_status ON candidates(status);
CREATE INDEX idx_candidates_position ON candidates(job_id, status, position);
CREATE INDEX idx_candidates_phone ON candidates(phone);
CREATE INDEX idx_candidates_email ON candidates(email) WHERE email IS NOT NULL;

-- Candidate Notes
CREATE INDEX idx_candidate_notes_candidate_id ON candidate_notes(candidate_id);
CREATE INDEX idx_candidate_notes_created_at ON candidate_notes(created_at DESC);
CREATE INDEX idx_candidate_notes_action_type ON candidate_notes(action_type) WHERE action_type IS NOT NULL;

-- Campaigns
CREATE INDEX idx_campaigns_job_id ON campaigns(job_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_dates ON campaigns(start_date, end_date);
CREATE INDEX idx_campaigns_created_at ON campaigns(created_at DESC);

-- Campaign Targets
CREATE INDEX idx_campaign_targets_campaign_id ON campaign_targets(campaign_id);

-- Campaign Matrices
CREATE INDEX idx_campaign_matrices_campaign_id ON campaign_matrices(campaign_id);

-- Campaign Candidates
CREATE INDEX idx_campaign_candidates_campaign_id ON campaign_candidates(campaign_id);
CREATE INDEX idx_campaign_candidates_call_status ON campaign_candidates(call_status);
CREATE INDEX idx_campaign_candidates_tel_mobile ON campaign_candidates(tel_mobile);
CREATE INDEX idx_campaign_candidates_flags ON campaign_candidates(available_to_work, interested, know_referee);

-- Call Records
CREATE INDEX idx_call_records_candidate_id ON call_records(campaign_candidate_id);
CREATE INDEX idx_call_records_call_id ON call_records(call_id);
CREATE INDEX idx_call_records_created_at ON call_records(created_at DESC);

-- Call Transcripts
CREATE INDEX idx_call_transcripts_call_id ON call_transcript_messages(call_record_id);
CREATE INDEX idx_call_transcripts_sequence ON call_transcript_messages(call_record_id, sequence);

-- WhatsApp Messages
CREATE INDEX idx_whatsapp_candidate_id ON whatsapp_messages(campaign_candidate_id);
CREATE INDEX idx_whatsapp_created_at ON whatsapp_messages(created_at DESC);

-- Campaign Candidate Notes
CREATE INDEX idx_campaign_candidate_notes_candidate_id ON campaign_candidate_notes(campaign_candidate_id);
CREATE INDEX idx_campaign_candidate_notes_created_at ON campaign_candidate_notes(created_at DESC);

-- Datasets
CREATE INDEX idx_datasets_created_at ON datasets(created_at DESC);
CREATE INDEX idx_datasets_source ON datasets(source);

-- Dataset Candidates
CREATE INDEX idx_dataset_candidates_dataset_id ON dataset_candidates(dataset_id);
CREATE INDEX idx_dataset_candidates_phone ON dataset_candidates(phone);
CREATE INDEX idx_dataset_candidates_trade ON dataset_candidates(trade) WHERE trade IS NOT NULL;
CREATE INDEX idx_dataset_candidates_location ON dataset_candidates(location) WHERE location IS NOT NULL;

-- ============================================
-- TRIGGERS & FUNCTIONS
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kanban_columns_updated_at BEFORE UPDATE ON kanban_columns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON candidates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_candidate_notes_updated_at BEFORE UPDATE ON candidate_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_matrices_updated_at BEFORE UPDATE ON campaign_matrices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_candidates_updated_at BEFORE UPDATE ON campaign_candidates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_candidate_notes_updated_at BEFORE UPDATE ON campaign_candidate_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_datasets_updated_at BEFORE UPDATE ON datasets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dataset_candidates_updated_at BEFORE UPDATE ON dataset_candidates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-update dataset candidate count
CREATE OR REPLACE FUNCTION update_dataset_candidate_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE datasets
  SET candidate_count = (
    SELECT COUNT(*) FROM dataset_candidates 
    WHERE dataset_id = COALESCE(NEW.dataset_id, OLD.dataset_id)
  )
  WHERE id = COALESCE(NEW.dataset_id, OLD.dataset_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_dataset_count_insert AFTER INSERT ON dataset_candidates
  FOR EACH ROW EXECUTE FUNCTION update_dataset_candidate_count();

CREATE TRIGGER update_dataset_count_delete AFTER DELETE ON dataset_candidates
  FOR EACH ROW EXECUTE FUNCTION update_dataset_candidate_count();

-- Auto-update campaign total candidates
CREATE OR REPLACE FUNCTION update_campaign_candidate_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE campaigns
  SET total_candidates = (
    SELECT COUNT(*) FROM campaign_candidates 
    WHERE campaign_id = COALESCE(NEW.campaign_id, OLD.campaign_id)
  )
  WHERE id = COALESCE(NEW.campaign_id, OLD.campaign_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_campaign_count_insert AFTER INSERT ON campaign_candidates
  FOR EACH ROW EXECUTE FUNCTION update_campaign_candidate_count();

CREATE TRIGGER update_campaign_count_delete AFTER DELETE ON campaign_candidates
  FOR EACH ROW EXECUTE FUNCTION update_campaign_candidate_count();

-- Initialize default Kanban columns when job is created
CREATE OR REPLACE FUNCTION initialize_default_kanban_columns()
RETURNS TRIGGER AS $$
BEGIN
  -- Create default columns for new job
  INSERT INTO kanban_columns (job_id, title, status_key, color, position, is_default)
  VALUES
    (NEW.id, 'Not Contacted', 'not-contacted', 'hsl(var(--chart-1))', 0, true),
    (NEW.id, 'Interested', 'interested', 'hsl(var(--chart-2))', 1, true),
    (NEW.id, 'Started Work', 'started-work', 'hsl(var(--primary))', 2, true);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER initialize_kanban_columns_on_job_create
  AFTER INSERT ON jobs
  FOR EACH ROW EXECUTE FUNCTION initialize_default_kanban_columns();

-- Auto-increment position when adding candidates to a column
CREATE OR REPLACE FUNCTION set_candidate_position()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.position IS NULL OR NEW.position = 0 THEN
    NEW.position := COALESCE(
      (SELECT MAX(position) + 1 FROM candidates 
       WHERE job_id = NEW.job_id AND status = NEW.status),
      0
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_candidate_position_on_insert
  BEFORE INSERT ON candidates
  FOR EACH ROW EXECUTE FUNCTION set_candidate_position();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_matrices ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_transcript_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_candidate_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE dataset_candidates ENABLE ROW LEVEL SECURITY;

-- Policies: Allow authenticated users full access (customize based on your needs)
CREATE POLICY "authenticated_all_jobs" ON jobs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all_kanban_columns" ON kanban_columns FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all_candidates" ON candidates FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all_candidate_notes" ON candidate_notes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all_campaigns" ON campaigns FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all_campaign_targets" ON campaign_targets FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all_campaign_matrices" ON campaign_matrices FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all_campaign_candidates" ON campaign_candidates FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all_call_records" ON call_records FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all_call_transcripts" ON call_transcript_messages FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all_whatsapp" ON whatsapp_messages FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all_campaign_notes" ON campaign_candidate_notes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all_datasets" ON datasets FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "authenticated_all_dataset_candidates" ON dataset_candidates FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================
-- HELPER VIEWS
-- ============================================

-- View: Candidates with their kanban column info
CREATE VIEW candidates_with_columns AS
SELECT 
  c.*,
  kc.title as column_title,
  kc.color as column_color,
  (SELECT COUNT(*) FROM candidate_notes WHERE candidate_id = c.id) as notes_count
FROM candidates c
LEFT JOIN kanban_columns kc ON c.job_id = kc.job_id AND c.status = kc.status_key;

-- View: Campaign candidates with call stats
CREATE VIEW campaign_candidates_with_stats AS
SELECT 
  cc.*,
  COUNT(DISTINCT cr.id) as total_calls,
  COUNT(DISTINCT wm.id) as total_messages,
  COUNT(DISTINCT ccn.id) as total_notes,
  MAX(cr.created_at) as last_call_date
FROM campaign_candidates cc
LEFT JOIN call_records cr ON cc.id = cr.campaign_candidate_id
LEFT JOIN whatsapp_messages wm ON cc.id = wm.campaign_candidate_id
LEFT JOIN campaign_candidate_notes ccn ON cc.id = ccn.campaign_candidate_id
GROUP BY cc.id;

-- View: Campaign summary stats
CREATE VIEW campaign_summary_stats AS
SELECT 
  c.id,
  c.name,
  c.status,
  COUNT(DISTINCT cc.id) as total_candidates,
  COUNT(DISTINCT CASE WHEN cc.call_status != 'not_called' THEN cc.id END) as contacted_count,
  COUNT(DISTINCT CASE WHEN cc.available_to_work = true THEN cc.id END) as available_count,
  COUNT(DISTINCT CASE WHEN cc.interested = true THEN cc.id END) as interested_count,
  COUNT(DISTINCT CASE WHEN cc.know_referee = true THEN cc.id END) as referee_count,
  COUNT(DISTINCT cr.id) as total_calls,
  COUNT(DISTINCT wm.id) as total_messages
FROM campaigns c
LEFT JOIN campaign_candidates cc ON c.id = cc.campaign_id
LEFT JOIN call_records cr ON cc.id = cr.campaign_candidate_id
LEFT JOIN whatsapp_messages wm ON cc.id = wm.campaign_candidate_id
GROUP BY c.id;

-- ============================================
-- COMMENTS (Documentation)
-- ============================================

COMMENT ON TABLE jobs IS 'Job postings with recruitment tracking';
COMMENT ON TABLE kanban_columns IS 'Dynamic Kanban columns/swimlanes for each job - allows custom workflow stages';
COMMENT ON TABLE candidates IS 'Job candidates displayed on Kanban board with position tracking for drag-drop';
COMMENT ON TABLE candidate_notes IS 'Timeline notes and activities for job candidates';
COMMENT ON TABLE campaigns IS 'Outreach campaigns for candidate engagement';
COMMENT ON TABLE campaign_candidates IS 'Candidates within campaigns (separate from job candidates) with call tracking';
COMMENT ON TABLE call_records IS 'Phone call records with outcomes and transcripts';
COMMENT ON TABLE whatsapp_messages IS 'WhatsApp conversation history';
COMMENT ON TABLE datasets IS 'Candidate databases/pools for importing into campaigns';

COMMENT ON COLUMN kanban_columns.status_key IS 'Unique status identifier - default (not-contacted, interested, etc) or custom-{timestamp}';
COMMENT ON COLUMN kanban_columns.position IS 'Display order of columns left to right';
COMMENT ON COLUMN candidates.position IS 'Display order within the column for drag-drop reordering';
COMMENT ON COLUMN candidates.status IS 'References kanban_columns.status_key';

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ RapidScreen V2 database schema created successfully!';
  RAISE NOTICE '📊 Tables created: 14 core tables + 3 views';
  RAISE NOTICE '🔐 Row Level Security enabled on all tables';
  RAISE NOTICE '⚡ Triggers configured for auto-updates';
  RAISE NOTICE '🎯 Kanban workflow with dynamic columns ready';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Next steps:';
  RAISE NOTICE '1. Review and customize RLS policies for your auth setup';
  RAISE NOTICE '2. Import sample data if needed';
  RAISE NOTICE '3. Configure Supabase client in your app';
END $$;
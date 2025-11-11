-- ============================================
-- TEMPORARY: Disable RLS for Migration
-- ============================================
-- Run this in Supabase SQL Editor BEFORE migration
-- Then run the enable script AFTER migration

-- Disable RLS on all tables
ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_columns DISABLE ROW LEVEL SECURITY;
ALTER TABLE candidates DISABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns DISABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_targets DISABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_matrices DISABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_candidates DISABLE ROW LEVEL SECURITY;
ALTER TABLE call_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE call_transcript_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_candidate_notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE datasets DISABLE ROW LEVEL SECURITY;
ALTER TABLE dataset_candidates DISABLE ROW LEVEL SECURITY;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ RLS disabled on all tables';
  RAISE NOTICE '🚀 You can now run: npm run db:migrate';
  RAISE NOTICE '⚠️  Remember to run enable-rls-after-migration.sql after!';
END $$;


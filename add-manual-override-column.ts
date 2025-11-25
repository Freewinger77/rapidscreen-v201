/**
 * Add manual_override Column to Candidates
 * 
 * Tracks if candidate position was manually set (don't auto-sync)
 */

import 'dotenv/config';
import sql from './src/lib/db';

async function addManualOverrideColumn() {
  console.log('🔧 Adding manual_override column to candidates...\n');

  try {
    await sql`
      ALTER TABLE candidates 
      ADD COLUMN IF NOT EXISTS manual_override BOOLEAN DEFAULT false
    `;

    console.log('✅ Column added: manual_override');
    console.log();

    console.log('📝 What this does:');
    console.log('  - When user drags candidate: manual_override = true');
    console.log('  - Auto-sync skips candidates with manual_override = true');
    console.log('  - Backend updates won\'t override user\'s placement');
    console.log();

    // Also fix the hired counter calculation
    console.log('🔧 Creating function to calculate hired count...\n');

    await sql`
      CREATE OR REPLACE FUNCTION calculate_hired_count(p_job_id UUID)
      RETURNS INTEGER AS $$
      DECLARE
        hired_count INTEGER;
      BEGIN
        -- Count candidates in 'hired' status OR in post-hire columns
        SELECT COUNT(DISTINCT c.id) INTO hired_count
        FROM candidates c
        LEFT JOIN kanban_columns kc ON kc.job_id = c.job_id AND kc.status_key = c.status
        WHERE c.job_id = p_job_id
        AND (c.status = 'hired' OR kc.is_post_hire = true);
        
        RETURN COALESCE(hired_count, 0);
      END;
      $$ LANGUAGE plpgsql;
    `;

    console.log('✅ Function created: calculate_hired_count()');
    console.log();

    console.log('🎉 Database updated!');
    console.log();

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

addManualOverrideColumn()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));


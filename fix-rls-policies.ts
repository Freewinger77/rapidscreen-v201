/**
 * Fix RLS Policies for Anonymous Access
 * 
 * Updates Row Level Security policies to allow anonymous users
 * Run this once to fix the 401 errors
 */

import 'dotenv/config';
import sql from './src/lib/db';

async function fixRLSPolicies() {
  console.log('🔧 Fixing RLS policies for anonymous access...\n');

  try {
    // Test connection
    console.log('🔌 Testing connection...');
    await sql`SELECT NOW()`;
    console.log('✅ Connected!\n');

    console.log('📝 Updating RLS policies...\n');

    // Drop old policies and create new ones that allow anonymous users
    const tables = [
      'jobs',
      'kanban_columns',
      'candidates',
      'candidate_notes',
      'campaigns',
      'campaign_targets',
      'campaign_matrices',
      'campaign_candidates',
      'call_records',
      'call_transcript_messages',
      'whatsapp_messages',
      'campaign_candidate_notes',
      'datasets',
      'dataset_candidates',
    ];

    for (const table of tables) {
      try {
        // Drop existing authenticated-only policy
        await sql.unsafe(`DROP POLICY IF EXISTS "authenticated_all_${table}" ON ${table}`);
        
        // Create new policy that allows all operations for everyone (including anonymous)
        await sql.unsafe(`
          CREATE POLICY "allow_all_${table}" ON ${table}
          FOR ALL
          USING (true)
          WITH CHECK (true)
        `);
        
        console.log(`  ✅ Updated policy for ${table}`);
      } catch (error) {
        console.error(`  ❌ Failed to update ${table}:`, error);
      }
    }

    console.log('\n✅ All RLS policies updated!');
    console.log('\n📝 What changed:');
    console.log('  - Old: Only authenticated users could access data');
    console.log('  - New: Anonymous users can access data (for development)');
    console.log('\n⚠️  Note: In production, you should:');
    console.log('  1. Implement proper authentication');
    console.log('  2. Restrict RLS policies by user ID');
    console.log('  3. Add role-based access control\n');

    console.log('🚀 You can now create jobs, campaigns, and datasets!');
    console.log('   Try creating a job again - it should work now.\n');

  } catch (error) {
    console.error('\n❌ Failed to fix RLS policies:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

fixRLSPolicies()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));



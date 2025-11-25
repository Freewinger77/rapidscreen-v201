/**
 * Check Backend Campaign Data
 * 
 * Shows what campaigns and data exist in backend database
 */

import 'dotenv/config';
import postgres from 'postgres';

const backendDb = postgres(process.env.BACKEND_DATABASE_URL || '');

async function checkBackendData() {
  console.log('🔍 CHECKING BACKEND DATABASE DATA');
  console.log('=' .repeat(80));
  console.log('Database:', process.env.VITE_BACKEND_SUPABASE_URL);
  console.log('=' .repeat(80));
  console.log();

  try {
    // Check campaign_info
    console.log('📊 CAMPAIGN_INFO TABLE:');
    const campaigns = await backendDb`SELECT * FROM campaign_info`;
    console.log(`Found ${campaigns.length} campaigns:\n`);
    campaigns.forEach(c => {
      console.log(`  Campaign: ${c.campaign}`);
      console.log(`  Job Info: ${c.job_info || 'N/A'}`);
      console.log(`  Start: ${c.start || 'N/A'}`);
      console.log(`  End: ${c.end || 'N/A'}`);
      console.log();
    });

    // Check session_info
    console.log('👤 SESSION_INFO TABLE:');
    const sessions = await backendDb`SELECT * FROM session_info LIMIT 10`;
    console.log(`Found ${sessions.length} sessions (showing first 10):\n`);
    sessions.forEach(s => {
      console.log(`  Session ID: ${s.session_id}`);
      console.log(`  Campaign: ${s.campaign || 'N/A'}`);
      console.log(`  Status: ${s.session_status}`);
      console.log(`  Created: ${s.created_at}`);
      console.log(`  Objectives:`, s.objectives);
      console.log();
    });

    // Check numbers
    console.log('📞 NUMBERS TABLE:');
    const numbers = await backendDb`SELECT * FROM numbers LIMIT 10`;
    console.log(`Found ${numbers.length} phone numbers (showing first 10):\n`);
    numbers.forEach(n => {
      console.log(`  Session: ${n.session_id}`);
      console.log(`  Phone: ${n.phone_number}`);
      console.log();
    });

    // Check chat_history
    console.log('💬 CHAT_HISTORY TABLE:');
    const { rows: chatStats } = await backendDb`
      SELECT session_id, COUNT(*) as count 
      FROM chat_history 
      GROUP BY session_id 
      ORDER BY count DESC 
      LIMIT 5
    `;
    console.log('Top 5 sessions by message count:\n');
    chatStats.forEach((stat: any) => {
      console.log(`  Session: ${stat.session_id}`);
      console.log(`  Messages: ${stat.count}`);
      console.log();
    });

    // Summary
    console.log('=' .repeat(80));
    console.log('📊 SUMMARY:');
    console.log(`  Campaigns: ${campaigns.length}`);
    console.log(`  Sessions: ${sessions.length}`);
    console.log(`  Phone Numbers: ${numbers.length}`);
    console.log('=' .repeat(80));

  } catch (error) {
    console.error('❌ Error checking backend:', error);
    throw error;
  } finally {
    await backendDb.end();
  }
}

checkBackendData()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));


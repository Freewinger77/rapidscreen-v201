/**
 * Check if calls exist for session
 */

import 'dotenv/config';
import postgres from 'postgres';

const backendDb = postgres(process.env.BACKEND_DATABASE_URL || '');

async function checkCalls() {
  console.log('🔍 Checking call_info for session ad_447835156367...\n');

  try {
    const calls = await backendDb`
      SELECT * FROM call_info 
      WHERE session_id = 'ad_447835156367'
    `;

    console.log(`Found ${calls.length} calls:\n`);

    calls.forEach((call, i) => {
      console.log(`Call ${i + 1}:`);
      console.log(`  Call ID: ${call.call_id}`);
      console.log(`  Session: ${call.session_id}`);
      console.log(`  Called At: ${call.called_at}`);
      console.log(`  Duration: ${call.duration}`);
      console.log(`  Status: ${call.status}`);
      console.log(`  Transcript: ${call.transcript?.substring(0, 100)}...`);
      console.log();
    });

    if (calls.length === 0) {
      console.log('No calls found. Checking all sessions...');
      const allCalls = await backendDb`SELECT session_id, call_id FROM call_info LIMIT 5`;
      console.log('Available sessions with calls:', allCalls);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await backendDb.end();
  }
}

checkCalls()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));


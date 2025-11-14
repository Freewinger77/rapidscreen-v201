/**
 * Database Connection Test
 * 
 * Run this file to test your Supabase connection:
 * npx tsx test-db-connection.ts
 */

import 'dotenv/config';
import sql from './src/lib/db';

async function testConnection() {
  console.log('🔌 Testing Supabase connection...\n');

  try {
    // Test 1: Basic connection
    console.log('Test 1: Basic connection');
    const [result] = await sql`SELECT NOW() as current_time`;
    console.log('✅ Connected! Server time:', result.current_time);
    console.log('');

    // Test 2: List tables
    console.log('Test 2: Checking tables');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    console.log(`✅ Found ${tables.length} tables:`);
    tables.forEach((t: any) => console.log(`   - ${t.table_name}`));
    console.log('');

    // Test 3: Count records
    console.log('Test 3: Counting records');
    const [jobsCount] = await sql`SELECT COUNT(*) as count FROM jobs`;
    const [campaignsCount] = await sql`SELECT COUNT(*) as count FROM campaigns`;
    const [datasetsCount] = await sql`SELECT COUNT(*) as count FROM datasets`;
    
    console.log('✅ Record counts:');
    console.log(`   - Jobs: ${jobsCount.count}`);
    console.log(`   - Campaigns: ${campaignsCount.count}`);
    console.log(`   - Datasets: ${datasetsCount.count}`);
    console.log('');

    console.log('🎉 All tests passed! Your database is ready to use.');
    
  } catch (error) {
    console.error('❌ Connection test failed:');
    console.error(error);
    console.log('\n📝 Troubleshooting:');
    console.log('1. Make sure .env file exists with DATABASE_URL');
    console.log('2. Check your connection string is correct');
    console.log('3. Verify your Supabase project is running');
    console.log('4. Check network/firewall settings');
  } finally {
    await sql.end();
  }
}

testConnection();


/**
 * Setup Database Schema
 * Runs the SQL schema from supabase.md
 */

import 'dotenv/config';
import sql from './src/lib/db';
import { readFileSync } from 'fs';
import { join } from 'path';

async function setupSchema() {
  console.log('🚀 Setting up database schema...\n');
  
  try {
    // Test connection
    console.log('🔌 Testing connection...');
    await sql`SELECT NOW()`;
    console.log('✅ Connected!\n');
    
    // Read SQL schema
    console.log('📖 Reading schema file...');
    const schemaPath = join(process.cwd(), 'supabase.md');
    const schema = readFileSync(schemaPath, 'utf-8');
    console.log(`✅ Loaded ${schema.split('\n').length} lines of SQL\n`);
    
    // Execute schema
    console.log('⚙️  Creating tables and functions...');
    console.log('   (This may take 10-20 seconds)\n');
    
    await sql.unsafe(schema);
    
    console.log('✅ Schema created successfully!\n');
    
    // Verify tables
    console.log('🔍 Verifying tables...');
    const tables = await sql`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;
    
    console.log(`✅ Found ${tables.length} tables:`);
    tables.forEach(t => console.log(`   - ${t.tablename}`));
    
    console.log('\n🎉 Database setup complete!\n');
    console.log('Next steps:');
    console.log('1. Run: npm run db:test');
    console.log('2. Run: npm run db:migrate\n');
    
  } catch (error) {
    console.error('\n❌ Schema setup failed:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

setupSchema()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));


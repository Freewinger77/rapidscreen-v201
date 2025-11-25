/**
 * BACKEND DATABASE SCHEMA EXPLORER
 * 
 * Explores the backend database to understand:
 * - All tables and their structures
 * - Relationships between tables
 * - Sample data to understand the schema
 * - How to integrate with frontend
 */

import 'dotenv/config';
import postgres from 'postgres';

// Connect to BACKEND database
const backendDb = postgres(process.env.BACKEND_DATABASE_URL || '');

interface TableInfo {
  table_name: string;
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
  character_maximum_length: number | null;
}

interface ForeignKey {
  constraint_name: string;
  table_name: string;
  column_name: string;
  foreign_table_name: string;
  foreign_column_name: string;
}

async function exploreBackendDatabase() {
  console.log('🔍 EXPLORING BACKEND DATABASE SCHEMA');
  console.log('=' .repeat(80));
  console.log('Database:', process.env.VITE_BACKEND_SUPABASE_URL);
  console.log('=' .repeat(80));
  console.log();

  try {
    // Test connection
    console.log('🔌 Testing connection...');
    const [result] = await backendDb`SELECT NOW() as server_time`;
    console.log('✅ Connected! Server time:', result.server_time);
    console.log();

    // Get all tables
    console.log('📋 LISTING ALL TABLES');
    console.log('-'.repeat(80));
    
    const tables = await backendDb<{ tablename: string }[]>`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;
    
    console.log(`Found ${tables.length} tables:\n`);
    tables.forEach((t, i) => {
      console.log(`  ${(i + 1).toString().padStart(2)}. ${t.tablename}`);
    });
    console.log();

    // Get detailed info for each table
    console.log('📊 DETAILED TABLE STRUCTURES');
    console.log('=' .repeat(80));
    console.log();

    for (const table of tables) {
      await exploreTable(table.tablename);
    }

    // Get foreign key relationships
    console.log('\n🔗 FOREIGN KEY RELATIONSHIPS');
    console.log('=' .repeat(80));
    console.log();
    
    const foreignKeys = await backendDb<ForeignKey[]>`
      SELECT
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
      ORDER BY tc.table_name, kcu.column_name
    `;

    if (foreignKeys.length > 0) {
      foreignKeys.forEach(fk => {
        console.log(`  ${fk.table_name}.${fk.column_name}`);
        console.log(`    └─> ${fk.foreign_table_name}.${fk.foreign_column_name}`);
        console.log();
      });
    } else {
      console.log('  No foreign keys found.');
    }

    // Data insights
    console.log('\n📈 DATA INSIGHTS');
    console.log('=' .repeat(80));
    console.log();

    for (const table of tables) {
      await showDataInsights(table.tablename);
    }

    // Integration guide
    console.log('\n🔌 INTEGRATION WITH FRONTEND');
    console.log('=' .repeat(80));
    console.log();
    console.log('Based on the schema, here are the integration points:');
    console.log();
    
    await generateIntegrationGuide(tables.map(t => t.tablename));

    console.log('\n✅ Exploration complete!');
    console.log();

  } catch (error) {
    console.error('❌ Error exploring database:', error);
    throw error;
  } finally {
    await backendDb.end();
  }
}

async function exploreTable(tableName: string) {
  console.log(`📦 Table: ${tableName}`);
  console.log('-'.repeat(80));

  // Get columns
  const columns = await backendDb<TableInfo[]>`
    SELECT 
      column_name,
      data_type,
      is_nullable,
      column_default,
      character_maximum_length
    FROM information_schema.columns
    WHERE table_schema = 'public' 
      AND table_name = ${tableName}
    ORDER BY ordinal_position
  `;

  console.log('  Columns:');
  columns.forEach(col => {
    const nullable = col.is_nullable === 'YES' ? '?' : '';
    const length = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
    const def = col.column_default ? ` = ${col.column_default}` : '';
    console.log(`    - ${col.column_name}${nullable}: ${col.data_type}${length}${def}`);
  });

  // Get indexes
  const indexes = await backendDb<{ indexname: string; indexdef: string }[]>`
    SELECT indexname, indexdef
    FROM pg_indexes
    WHERE schemaname = 'public' 
      AND tablename = ${tableName}
      AND indexname NOT LIKE '%_pkey'
    ORDER BY indexname
  `;

  if (indexes.length > 0) {
    console.log('  Indexes:');
    indexes.forEach(idx => {
      console.log(`    - ${idx.indexname}`);
    });
  }

  console.log();
}

async function showDataInsights(tableName: string) {
  try {
    // Get row count
    const [countResult] = await backendDb<{ count: number }[]>`
      SELECT COUNT(*)::int as count FROM ${backendDb(tableName)}
    `;
    
    console.log(`  ${tableName}: ${countResult.count.toLocaleString()} rows`);

    // If there's data, show a sample
    if (countResult.count > 0) {
      const sampleData = await backendDb`
        SELECT * FROM ${backendDb(tableName)}
        LIMIT 1
      `;
      
      if (sampleData.length > 0) {
        console.log(`    Sample columns:`, Object.keys(sampleData[0]).join(', '));
      }
    }
  } catch (error) {
    console.log(`  ${tableName}: Error reading (${error instanceof Error ? error.message : 'unknown'})`);
  }
}

async function generateIntegrationGuide(tables: string[]) {
  // Look for specific patterns to understand the backend structure
  
  const patterns = {
    campaigns: tables.filter(t => t.includes('campaign')),
    calls: tables.filter(t => t.includes('call')),
    messages: tables.filter(t => t.includes('message') || t.includes('chat') || t.includes('whatsapp')),
    candidates: tables.filter(t => t.includes('candidate') || t.includes('contact')),
    agents: tables.filter(t => t.includes('agent')),
    webhooks: tables.filter(t => t.includes('webhook')),
  };

  Object.entries(patterns).forEach(([category, matchingTables]) => {
    if (matchingTables.length > 0) {
      console.log(`  ${category.toUpperCase()}-related tables:`);
      matchingTables.forEach(t => {
        console.log(`    - ${t}`);
      });
      console.log();
    }
  });

  console.log('  SUGGESTED INTEGRATION POINTS:');
  console.log();
  
  if (patterns.messages.length > 0) {
    console.log('  📱 WhatsApp Messages:');
    console.log(`    - Tables: ${patterns.messages.join(', ')}`);
    console.log('    - Use case: Display chat history for phone numbers');
    console.log('    - Query: Get messages by phone number, ordered by timestamp');
    console.log();
  }

  if (patterns.campaigns.length > 0) {
    console.log('  📢 Campaigns:');
    console.log(`    - Tables: ${patterns.campaigns.join(', ')}`);
    console.log('    - Use case: Display campaign data and statistics');
    console.log('    - Query: Get campaign details with related candidates/calls');
    console.log();
  }

  if (patterns.calls.length > 0) {
    console.log('  📞 Calls:');
    console.log(`    - Tables: ${patterns.calls.join(', ')}`);
    console.log('    - Use case: Display call history and transcripts');
    console.log('    - Query: Get calls by candidate/campaign with transcripts');
    console.log();
  }

  if (patterns.candidates.length > 0) {
    console.log('  👤 Candidates/Contacts:');
    console.log(`    - Tables: ${patterns.candidates.join(', ')}`);
    console.log('    - Use case: Sync candidate data between backend and frontend');
    console.log('    - Query: Get candidate profiles with all interactions');
    console.log();
  }
}

// Run exploration
exploreBackendDatabase()
  .then(() => {
    console.log('📝 Next steps:');
    console.log('1. Review the schema above');
    console.log('2. Identify which tables feed into frontend displays');
    console.log('3. Create API helpers to fetch backend data');
    console.log('4. Build UI components to display the data');
    console.log();
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to explore backend:', error);
    process.exit(1);
  });


/**
 * Check Database Constraints
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConstraints() {
  console.log('🔍 Checking campaigns table constraints...\n');
  
  // Try to query the constraint
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT 
        conname as constraint_name,
        pg_get_constraintdef(oid) as definition
      FROM pg_constraint
      WHERE conrelid = 'campaigns'::regclass
      AND conname LIKE '%status%';
    `
  }).single();

  if (error) {
    console.log('Could not query constraints, trying different approach...');
    console.log('\nTesting allowed values:');
    
    // Test each value
    const testValues = ['active', 'draft', 'completed', 'stopped', 'paused'];
    
    for (const status of testValues) {
      const { error } = await supabase
        .from('campaigns')
        .update({ status })
        .eq('id', '00000000-0000-0000-0000-000000000000'); // Non-existent ID
      
      if (error && error.code === '23514') {
        console.log(`  ❌ '${status}' - NOT ALLOWED`);
      } else {
        console.log(`  ✅ '${status}' - ALLOWED`);
      }
    }
  } else {
    console.log(data);
  }
}

checkConstraints().then(() => process.exit(0));


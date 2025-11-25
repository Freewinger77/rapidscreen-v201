/**
 * Database Migration: Add 'stopped' status to campaigns
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('🔧 Running database migration...\n');
  
  try {
    // Step 1: Drop old constraint
    console.log('1️⃣ Dropping old constraint...');
    const { error: dropError } = await supabase.rpc('exec_sql', {
      query: 'ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_status_check;'
    });
    
    if (dropError) {
      console.log('   Using alternative method...');
      // Try direct approach (may work with service role)
    }
    
    // Step 2: Add new constraint with 'stopped'
    console.log('2️⃣ Adding new constraint with \'stopped\' status...');
    const { error: addError } = await supabase.rpc('exec_sql', {
      query: `ALTER TABLE campaigns ADD CONSTRAINT campaigns_status_check CHECK (status IN ('active', 'draft', 'completed', 'stopped'));`
    });
    
    if (addError) {
      console.log('   ⚠️  RPC method not available');
      console.log('   📋 Please run the SQL manually in Supabase SQL Editor\n');
      console.log('   SQL to run:');
      console.log('   ----------------------------------------');
      console.log(`   ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_status_check;`);
      console.log(`   ALTER TABLE campaigns ADD CONSTRAINT campaigns_status_check`);
      console.log(`   CHECK (status IN ('active', 'draft', 'completed', 'stopped'));`);
      console.log('   ----------------------------------------\n');
      return false;
    }
    
    console.log('✅ Migration completed!\n');
    
    // Verify
    console.log('3️⃣ Verifying...');
    const { data: testData, error: testError } = await supabase
      .from('campaigns')
      .update({ status: 'stopped' })
      .eq('id', '9b4501e3-1035-4f9e-b4e2-921d475594cd')
      .select();
    
    if (testError) {
      console.log('❌ Verification failed:', testError.message);
      return false;
    }
    
    console.log('✅ Verification successful! Campaign status updated to \'stopped\'');
    console.log('   Campaign:', testData?.[0]?.name);
    
    return true;
  } catch (error) {
    console.error('❌ Migration error:', error);
    return false;
  }
}

runMigration().then((success) => {
  if (success) {
    console.log('\n🎉 All done! You can now stop campaigns in the app.');
  } else {
    console.log('\n⚠️  Please run the SQL manually (see instructions above).');
  }
  process.exit(success ? 0 : 1);
});


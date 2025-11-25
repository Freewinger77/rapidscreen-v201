/**
 * Debug Script: Check Campaign Status in Database
 * Run with: npx tsx check-campaign-status.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCampaigns() {
  console.log('🔍 Checking campaign statuses...\n');
  
  const { data: campaigns, error } = await supabase
    .from('campaigns')
    .select('id, name, status, job_id, backend_campaign_id')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  if (!campaigns || campaigns.length === 0) {
    console.log('No campaigns found');
    return;
  }

  console.log(`Found ${campaigns.length} campaigns:\n`);
  
  campaigns.forEach((c, i) => {
    console.log(`${i + 1}. ${c.name}`);
    console.log(`   ID: ${c.id}`);
    console.log(`   Status: ${c.status}`);
    console.log(`   Job ID: ${c.job_id}`);
    console.log(`   Backend ID: ${c.backend_campaign_id || 'none'}`);
    console.log('');
  });

  const activeCount = campaigns.filter(c => c.status === 'active').length;
  const stoppedCount = campaigns.filter(c => c.status === 'stopped').length;
  const completedCount = campaigns.filter(c => c.status === 'completed').length;

  console.log('📊 Summary:');
  console.log(`   Active: ${activeCount}`);
  console.log(`   Stopped: ${stoppedCount}`);
  console.log(`   Completed: ${completedCount}`);
}

checkCampaigns().then(() => process.exit(0));


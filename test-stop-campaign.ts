/**
 * Test Script: Manually Stop a Campaign
 * Run with: npx tsx test-stop-campaign.ts <campaign-id>
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

async function stopCampaign(campaignId: string) {
  console.log('🛑 Attempting to stop campaign:', campaignId);
  
  // First, check current status
  const { data: before, error: beforeError } = await supabase
    .from('campaigns')
    .select('id, name, status')
    .eq('id', campaignId)
    .single();

  if (beforeError || !before) {
    console.error('❌ Campaign not found:', beforeError);
    return;
  }

  console.log('📋 Before:', before);
  
  // Update status to 'completed'
  const { data: after, error: updateError } = await supabase
    .from('campaigns')
    .update({ status: 'completed' })
    .eq('id', campaignId)
    .select();

  if (updateError) {
    console.error('❌ Update error:', updateError);
    return;
  }

  console.log('✅ After:', after);
  console.log('\n✅ Campaign stopped successfully!');
}

const campaignId = process.argv[2];

if (!campaignId) {
  console.log('Usage: npx tsx test-stop-campaign.ts <campaign-id>');
  console.log('\nAvailable campaigns:');
  
  const supabase = createClient(supabaseUrl!, supabaseKey!);
  supabase.from('campaigns').select('id, name, status').then(({ data }) => {
    data?.forEach(c => {
      console.log(`  ${c.id} - ${c.name} (${c.status})`);
    });
    process.exit(0);
  });
} else {
  stopCampaign(campaignId).then(() => process.exit(0));
}


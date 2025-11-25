/**
 * Sync Backend Campaign Data to Frontend
 * 
 * Imports existing campaigns from backend database into frontend
 */

import 'dotenv/config';
import { backendSupabase } from './src/lib/supabase-client';
import { supabase } from './src/lib/supabase-client';

async function syncBackendToFrontend() {
  console.log('🔄 Syncing Backend Campaigns to Frontend...\n');

  try {
    // 1. Get all campaigns from backend
    console.log('📊 Fetching backend campaign_info...');
    const { data: backendCampaigns, error: campError } = await backendSupabase
      .from('campaign_info')
      .select('*');

    if (campError) {
      console.error('Error:', campError);
      throw campError;
    }

    console.log(`✅ Found ${backendCampaigns?.length || 0} campaigns in backend\n`);

    if (!backendCampaigns || backendCampaigns.length === 0) {
      console.log('No campaigns to sync.');
      return;
    }

    // 2. For each campaign, get sessions and create frontend data
    for (const backendCampaign of backendCampaigns) {
      console.log(`\n📢 Processing campaign: ${backendCampaign.campaign}`);

      // Get all sessions for this campaign
      const { data: sessions, error: sessError } = await backendSupabase
        .from('session_info')
        .select('*')
        .eq('campaign', backendCampaign.campaign);

      console.log(`  Sessions found: ${sessions?.length || 0}`);

      // Get phone numbers for these sessions
      const sessionIds = (sessions || []).map(s => s.session_id);
      const { data: numbers, error: numError } = await backendSupabase
        .from('numbers')
        .select('*')
        .in('session_id', sessionIds);

      console.log(`  Phone numbers found: ${numbers?.length || 0}`);

      // Get chat history count
      const { count: chatCount } = await backendSupabase
        .from('chat_history')
        .select('*', { count: 'exact', head: true })
        .in('session_id', sessionIds);

      console.log(`  Chat messages: ${chatCount || 0}`);

      // Get call history count
      const { count: callCount } = await backendSupabase
        .from('call_info')
        .select('*', { count: 'exact', head: true })
        .in('session_id', sessionIds);

      console.log(`  Call records: ${callCount || 0}`);

      // Create campaign candidates from sessions + phone numbers
      const campaignCandidates = (numbers || []).map((numRow, index) => {
        const session = sessions?.find(s => s.session_id === numRow.session_id);
        
        return {
          forename: 'Candidate',
          surname: `${index + 1}`,
          telMobile: numRow.phone_number,
          email: null,
          callStatus: 'not_called',
          availableToWork: session?.objectives?.available_to_work || null,
          interested: session?.objectives?.interested || null,
          knowReferee: session?.objectives?.know_referee || null,
          lastContact: session?.updated_at || null,
          experience: session?.objectives?.experience || null,
        };
      });

      // Check if campaign exists in frontend
      const { data: existingCampaign } = await supabase
        .from('campaigns')
        .select('id')
        .eq('name', backendCampaign.campaign)
        .single();

      if (existingCampaign) {
        console.log(`  ✅ Campaign already exists in frontend (${existingCampaign.id})`);
        
        // Update with backend data
        await supabase
          .from('campaigns')
          .update({
            total_candidates: campaignCandidates.length,
          })
          .eq('id', existingCampaign.id);

        // Add campaign candidates if missing
        const { data: existingCandidates } = await supabase
          .from('campaign_candidates')
          .select('id')
          .eq('campaign_id', existingCampaign.id);

        if (!existingCandidates || existingCandidates.length === 0) {
          console.log(`  📥 Adding ${campaignCandidates.length} candidates...`);
          await supabase
            .from('campaign_candidates')
            .insert(
              campaignCandidates.map(c => ({
                campaign_id: existingCampaign.id,
                ...c,
              }))
            );
          console.log(`  ✅ Candidates added`);
        }

      } else {
        console.log(`  ⚠️  Campaign not found in frontend`);
        console.log(`  💡 Create it manually in the platform with name: "${backendCampaign.campaign}"`);
      }
    }

    console.log('\n✅ Sync complete!\n');
    console.log('🎯 What to do:');
    console.log('1. Refresh your campaigns page');
    console.log('2. Open campaign details');
    console.log('3. See candidates with phone numbers!');
    console.log('4. Click WhatsApp tab to see chat history\n');

  } catch (error) {
    console.error('\n❌ Sync failed:', error);
    throw error;
  }
}

syncBackendToFrontend()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));


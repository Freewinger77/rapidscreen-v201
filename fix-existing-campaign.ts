/**
 * Fix Existing Campaign Database
 * 
 * Links frontend campaign "ad" with backend "ad_mid8vd4rlbh5i3xx5j"
 * Adds campaign candidate with phone number
 */

import 'dotenv/config';
import sql from './src/lib/db';

async function fixExistingCampaign() {
  console.log('🔧 Fixing existing campaign in database...\n');

  try {
    // 1. Find the "ad" campaign
    console.log('📊 Finding "ad" campaign...');
    const campaigns = await sql`
      SELECT * FROM campaigns 
      WHERE name LIKE '%ad%'
      ORDER BY created_at DESC
    `;

    if (campaigns.length === 0) {
      console.log('❌ No campaign found with name containing "ad"');
      console.log('Available campaigns:');
      const allCampaigns = await sql`SELECT id, name FROM campaigns`;
      allCampaigns.forEach(c => {
        console.log(`  - ${c.name} (ID: ${c.id})`);
      });
      return;
    }

    const adCampaign = campaigns[0];
    console.log(`✅ Found campaign: ${adCampaign.name}`);
    console.log(`   Current ID: ${adCampaign.id}`);
    console.log(`   Job ID: ${adCampaign.job_id}`);
    console.log();

    // 2. Update campaign ID to match backend
    const backendCampaignId = 'ad_mid8vd4rlbh5i3xx5j';
    console.log(`🔄 Updating campaign ID to match backend: ${backendCampaignId}`);

    // First, delete any existing campaign with that ID
    await sql`DELETE FROM campaigns WHERE id = ${backendCampaignId}`;

    // Update the ID
    await sql`
      UPDATE campaigns 
      SET id = ${backendCampaignId},
          name = 'ad'
      WHERE id = ${adCampaign.id}
    `;

    console.log('✅ Campaign ID updated!');
    console.log();

    // 3. Check if campaign has candidates
    const existingCandidates = await sql`
      SELECT * FROM campaign_candidates 
      WHERE campaign_id = ${backendCampaignId}
    `;

    console.log(`📊 Found ${existingCandidates.length} existing candidates`);

    if (existingCandidates.length === 0) {
      console.log('📥 Adding campaign candidate from backend...');
      
      // Add the candidate from backend
      await sql`
        INSERT INTO campaign_candidates (
          campaign_id, forename, surname, tel_mobile, email,
          call_status, available_to_work, interested, know_referee
        ) VALUES (
          ${backendCampaignId},
          'Arslan',
          '',
          '+447835156367',
          null,
          'not_called',
          null,
          null,
          null
        )
      `;

      console.log('✅ Campaign candidate added!');
    } else {
      console.log('✅ Campaign already has candidates');
    }

    // 4. Update campaign total_candidates
    await sql`
      UPDATE campaigns
      SET total_candidates = (
        SELECT COUNT(*) FROM campaign_candidates 
        WHERE campaign_id = ${backendCampaignId}
      )
      WHERE id = ${backendCampaignId}
    `;

    console.log('✅ Campaign total_candidates updated!');
    console.log();

    // 5. Verify the fix
    console.log('🔍 Verifying fix...');
    const [updatedCampaign] = await sql`
      SELECT c.*, 
             COUNT(cc.id) as candidate_count
      FROM campaigns c
      LEFT JOIN campaign_candidates cc ON cc.campaign_id = c.id
      WHERE c.id = ${backendCampaignId}
      GROUP BY c.id
    `;

    console.log('\n✅ Campaign Updated:');
    console.log(`   ID: ${updatedCampaign.id}`);
    console.log(`   Name: ${updatedCampaign.name}`);
    console.log(`   Job ID: ${updatedCampaign.job_id}`);
    console.log(`   Total Candidates: ${updatedCampaign.total_candidates}`);
    console.log(`   Actual Candidates: ${updatedCampaign.candidate_count}`);
    console.log();

    console.log('🎉 Fix complete!\n');
    console.log('🎯 What to do now:');
    console.log('1. Refresh your campaigns page');
    console.log('2. Open the "ad" campaign');
    console.log('3. You should see: Arslan (+447835156367)');
    console.log('4. Click WhatsApp tab → See chat history from backend!');
    console.log('5. Backend data will now link properly!\n');

  } catch (error) {
    console.error('\n❌ Fix failed:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

fixExistingCampaign()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));


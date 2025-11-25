/**
 * Add Campaign Candidates to Job Kanban
 * 
 * Syncs campaign candidates to job candidates table
 */

import 'dotenv/config';
import sql from './src/lib/db';

async function addCampaignCandidatesToJob() {
  console.log('🔄 Adding campaign candidates to job kanban...\n');

  try {
    // Get the "ad" campaign
    const [campaign] = await sql`
      SELECT * FROM campaigns 
      WHERE name LIKE '%ad%'
      LIMIT 1
    `;

    if (!campaign) {
      console.log('❌ Campaign not found');
      return;
    }

    console.log(`✅ Found campaign: ${campaign.name}`);
    console.log(`   Job ID: ${campaign.job_id}`);
    console.log();

    // Get campaign candidates
    const campaignCandidates = await sql`
      SELECT * FROM campaign_candidates
      WHERE campaign_id = ${campaign.id}
    `;

    console.log(`📊 Found ${campaignCandidates.length} campaign candidates`);
    console.log();

    // Check if they already exist in job candidates
    for (const cc of campaignCandidates) {
      console.log(`Processing: ${cc.forename} ${cc.surname} (${cc.tel_mobile})`);

      const existing = await sql`
        SELECT id FROM candidates
        WHERE job_id = ${campaign.job_id}
        AND phone = ${cc.tel_mobile}
      `;

      if (existing.length > 0) {
        console.log(`  ⏭️  Already exists in job kanban`);
      } else {
        // Add to job candidates
        await sql`
          INSERT INTO candidates (
            job_id, name, phone, email, status
          ) VALUES (
            ${campaign.job_id},
            ${`${cc.forename} ${cc.surname}`.trim()},
            ${cc.tel_mobile},
            ${cc.email},
            'not-contacted'
          )
        `;
        console.log(`  ✅ Added to job kanban (Not Contacted column)`);
      }
      console.log();
    }

    console.log('🎉 Sync complete!\n');
    console.log('🎯 Now:');
    console.log('1. Refresh your job details page');
    console.log('2. See Arslan in "Not Contacted" column');
    console.log('3. Auto-sync will move them based on backend objectives!');
    console.log();

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

addCampaignCandidatesToJob()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));


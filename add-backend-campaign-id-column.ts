/**
 * Add backend_campaign_id Column
 * 
 * Adds a column to store the backend campaign identifier
 */

import 'dotenv/config';
import sql from './src/lib/db';

async function addBackendCampaignIdColumn() {
  console.log('🔧 Adding backend_campaign_id column...\n');

  try {
    // Add column if it doesn't exist
    await sql`
      ALTER TABLE campaigns 
      ADD COLUMN IF NOT EXISTS backend_campaign_id TEXT UNIQUE
    `;

    console.log('✅ Column added: backend_campaign_id');
    console.log();

    // Create index for faster lookups
    await sql`
      CREATE INDEX IF NOT EXISTS idx_campaigns_backend_id 
      ON campaigns(backend_campaign_id)
    `;

    console.log('✅ Index created');
    console.log();

    // Update existing "ad" campaign
    console.log('🔄 Updating existing "ad" campaign...');
    
    const campaigns = await sql`
      SELECT id, name FROM campaigns 
      WHERE name LIKE '%ad%'
      ORDER BY created_at DESC
    `;

    if (campaigns.length > 0) {
      const adCampaign = campaigns[0];
      console.log(`Found campaign: ${adCampaign.name} (${adCampaign.id})`);
      
      await sql`
        UPDATE campaigns
        SET backend_campaign_id = 'ad_mid8vd4rlbh5i3xx5j'
        WHERE id = ${adCampaign.id}
      `;

      console.log('✅ Updated with backend_campaign_id');
      console.log();

      // Add campaign candidate
      console.log('📥 Adding campaign candidate...');
      
      // Check if already exists
      const existing = await sql`
        SELECT id FROM campaign_candidates
        WHERE campaign_id = ${adCampaign.id}
      `;

      if (existing.length === 0) {
        await sql`
          INSERT INTO campaign_candidates (
            campaign_id, forename, surname, tel_mobile, 
            call_status, available_to_work, interested, know_referee
          ) VALUES (
            ${adCampaign.id},
            'Arslan',
            '',
            '+447835156367',
            'not_called',
            null,
            null,
            null
          )
        `;

        await sql`
          UPDATE campaigns
          SET total_candidates = 1
          WHERE id = ${adCampaign.id}
        `;

        console.log('✅ Campaign candidate added');
      } else {
        console.log('✅ Campaign already has candidates');
      }
    }

    console.log();
    console.log('🎉 Database fixed!');
    console.log();
    console.log('✅ Changes made:');
    console.log('  1. Added backend_campaign_id column to campaigns table');
    console.log('  2. Updated "ad" campaign with backend ID: ad_mid8vd4rlbh5i3xx5j');
    console.log('  3. Added Arslan (+447835156367) as campaign candidate');
    console.log('  4. Updated total_candidates count');
    console.log();
    console.log('🎯 Now refresh your browser and:');
    console.log('  - Open the "ad" campaign');
    console.log('  - See Arslan in the candidates table');
    console.log('  - Click WhatsApp tab → See backend chat history!');
    console.log();

  } catch (error) {
    console.error('❌ Failed to fix database:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

addBackendCampaignIdColumn()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));


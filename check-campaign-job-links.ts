/**
 * Check Campaign-Job Links
 */

import 'dotenv/config';
import sql from './src/lib/db';

async function checkLinks() {
  console.log('🔍 Checking campaign-job links...\n');

  try {
    const jobs = await sql`SELECT id, title FROM jobs`;
    console.log('Jobs:');
    jobs.forEach(j => console.log(`  ${j.title}: ${j.id}`));
    console.log();

    const campaigns = await sql`SELECT id, name, job_id FROM campaigns`;
    console.log('Campaigns:');
    campaigns.forEach(c => console.log(`  ${c.name}: jobId=${c.job_id}`));
    console.log();

    // Check if "ad" campaign links to rapidscreen-engineer job
    const adCampaign = campaigns.find(c => c.name.includes('ad'));
    const rapidJob = jobs.find(j => j.title.includes('rapidscreen'));

    if (adCampaign && rapidJob) {
      console.log('Match check:');
      console.log(`  "ad" campaign jobId: ${adCampaign.job_id}`);
      console.log(`  rapidscreen job id: ${rapidJob.id}`);
      console.log(`  Match: ${adCampaign.job_id === rapidJob.id ? '✅ YES' : '❌ NO'}`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sql.end();
  }
}

checkLinks()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));


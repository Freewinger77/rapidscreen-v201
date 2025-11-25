/**
 * Recalculate Hired Counts for All Jobs
 * 
 * Uses the SQL function to get accurate counts
 */

import 'dotenv/config';
import sql from './src/lib/db';

async function recalculateHiredCounts() {
  console.log('🔧 Recalculating hired counts for all jobs...\n');

  try {
    const jobs = await sql`SELECT id, title FROM jobs`;

    console.log(`Found ${jobs.length} jobs\n`);

    for (const job of jobs) {
      // Use the SQL function to calculate
      const [result] = await sql`SELECT calculate_hired_count(${job.id}) as count`;
      const hiredCount = result.count;

      // Update the job
      await sql`
        UPDATE jobs 
        SET hired = ${hiredCount}
        WHERE id = ${job.id}
      `;

      console.log(`✅ ${job.title}: hired = ${hiredCount}`);
    }

    console.log('\n🎉 All hired counts updated!');
    console.log('📝 Now refresh your jobs page to see accurate counts!\n');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

recalculateHiredCounts()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));


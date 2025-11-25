/**
 * Fix Hired Count for rapidscreen-engineer Job
 */

import 'dotenv/config';
import sql from './src/lib/db';

async function fixHiredCount() {
  console.log('🔧 Fixing hired count for rapidscreen-engineer...\n');

  try {
    // Find the job
    const [job] = await sql`
      SELECT * FROM jobs 
      WHERE title LIKE '%rapidscreen%'
    `;

    if (!job) {
      console.log('❌ Job not found');
      return;
    }

    console.log(`✅ Found job: ${job.title}`);
    console.log(`   Current hired count: ${job.hired}`);
    console.log();

    // Get actual candidates in hired or post-hire columns
    const [result] = await sql`
      SELECT COUNT(DISTINCT c.id)::int as actual_hired
      FROM candidates c
      LEFT JOIN kanban_columns kc ON kc.job_id = c.job_id AND kc.status_key = c.status
      WHERE c.job_id = ${job.id}
      AND (c.status = 'hired' OR kc.is_post_hire = true)
    `;

    console.log(`📊 Actual candidates in hired/post-hire columns: ${result.actual_hired}`);
    console.log();

    // Show all candidates and their statuses
    const candidates = await sql`
      SELECT name, status FROM candidates
      WHERE job_id = ${job.id}
    `;

    console.log('Current candidates:');
    candidates.forEach(c => {
      console.log(`  ${c.name}: ${c.status}`);
    });
    console.log();

    // Update the job
    await sql`
      UPDATE jobs
      SET hired = ${result.actual_hired}
      WHERE id = ${job.id}
    `;

    console.log(`✅ Updated hired count from ${job.hired} to ${result.actual_hired}`);
    console.log();
    console.log('🎯 Refresh your page to see the correct count!');
    console.log();

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sql.end();
  }
}

fixHiredCount()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));


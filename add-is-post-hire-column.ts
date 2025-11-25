/**
 * Add is_post_hire Column to kanban_columns
 */

import 'dotenv/config';
import sql from './src/lib/db';

async function addIsPostHireColumn() {
  console.log('🔧 Adding is_post_hire column to kanban_columns...\n');

  try {
    // Add column
    await sql`
      ALTER TABLE kanban_columns 
      ADD COLUMN IF NOT EXISTS is_post_hire BOOLEAN DEFAULT false
    `;

    console.log('✅ Column added: is_post_hire');
    console.log();

    // Update "Started Work" to be post-hire
    await sql`
      UPDATE kanban_columns
      SET is_post_hire = true
      WHERE status_key = 'started-work'
    `;

    console.log('✅ Updated "Started Work" as post-hire column');
    console.log();

    console.log('🎉 Database updated!');
    console.log();
    console.log('📝 What this means:');
    console.log('  - Hired column: is_post_hire = false (primary hired status)');
    console.log('  - Started Work: is_post_hire = true (counts as hired)');
    console.log('  - Onboarding, Training, etc: is_post_hire = true (counts as hired)');
    console.log();

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

addIsPostHireColumn()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));


/**
 * Check Chat Messages Structure
 */

import 'dotenv/config';
import postgres from 'postgres';

const backendDb = postgres(process.env.BACKEND_DATABASE_URL || '');

async function checkChatMessages() {
  console.log('🔍 Checking chat_history structure...\n');

  try {
    // Get messages for Arslan's session
    const messages = await backendDb`
      SELECT * FROM chat_history 
      WHERE session_id = 'ad_447835156367'
      ORDER BY id ASC
      LIMIT 5
    `;

    console.log(`Found ${messages.length} messages for session ad_447835156367:\n`);

    messages.forEach((msg, i) => {
      console.log(`Message ${i + 1}:`);
      console.log(`  ID: ${msg.id}`);
      console.log(`  Session: ${msg.session_id}`);
      console.log(`  Message (full):`, msg.message);
      console.log(`  Type of message:`, typeof msg.message);
      
      if (msg.message && typeof msg.message === 'object') {
        console.log(`  Message.type:`, msg.message.type);
        console.log(`  Message.content:`, msg.message.content);
        console.log(`  Message.sender:`, msg.message.sender);
        console.log(`  Message.text:`, msg.message.text);
      }
      console.log();
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await backendDb.end();
  }
}

checkChatMessages()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));


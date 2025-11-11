/**
 * Get Retell Web Call Token
 * Generates access token for browser-based calling
 */

import Retell from 'retell-sdk';

const RETELL_API_KEY = process.env.VITE_RETELL_API_KEY || 'key_a3eb5eac6d8df939b486cbbb46c2';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { agent_id } = req.body;

    if (!agent_id) {
      res.status(400).json({ error: 'agent_id is required' });
      return;
    }

    console.log(`🔑 Generating web call token for agent: ${agent_id}`);

    const retellClient = new Retell({ apiKey: RETELL_API_KEY });

    // Create web call
    const webCallResponse = await retellClient.call.createWebCall({
      agent_id: agent_id,
      metadata: {
        test_mode: 'browser',
        timestamp: new Date().toISOString(),
      },
    });

    console.log(`✅ Web call created: ${webCallResponse.call_id}`);

    res.status(200).json({
      access_token: webCallResponse.access_token,
      call_id: webCallResponse.call_id,
      agent_id: agent_id,
    });

  } catch (error) {
    console.error('❌ Error generating web token:', error);
    res.status(500).json({ 
      error: 'Failed to generate web call token',
      message: error.message 
    });
  }
}


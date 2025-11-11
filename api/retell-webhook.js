/**
 * Retell AI Webhook Endpoint
 * Works in both localhost and production
 * Compatible with Vercel, Netlify, and Express
 */

import { createClient } from '@supabase/supabase-js';

// Environment-based Supabase config
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://suawkwvaevvucyeupdnr.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1YXdrd3ZhZXZ2dWN5ZXVwZG5yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjIxNDM3OSwiZXhwIjoyMDc3NzkwMzc5fQ.r6h8VEvHEqxFMUJpgf_kL_1e5p5qVnQfTKTaAjVOxaE';

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Main webhook handler
 * Works with: Vercel, Netlify Functions, Express
 */
export default async function handler(req, res) {
  // Handle OPTIONS for CORS
  if (req.method === 'OPTIONS') {
    res.status(200).json({ ok: true });
    return;
  }

  // Only accept POST
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const startTime = Date.now();
  console.log('\n📨 Retell webhook received');

  try {
    const event = req.body;
    
    if (!event || !event.event) {
      console.error('❌ Invalid webhook payload');
      res.status(400).json({ error: 'Invalid payload' });
      return;
    }

    console.log(`   Event: ${event.event}`);
    console.log(`   Call ID: ${event.call?.call_id || 'N/A'}`);

    // Process the event
    await processRetellEvent(event);

    const duration = Date.now() - startTime;
    console.log(`✅ Webhook processed in ${duration}ms\n`);

    res.status(200).json({ 
      received: true,
      processed_at: new Date().toISOString(),
      duration_ms: duration 
    });

  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

/**
 * Process different Retell webhook events
 */
async function processRetellEvent(event) {
  const eventType = event.event;
  const call = event.call;

  switch (eventType) {
    case 'call_started':
      await handleCallStarted(call);
      break;

    case 'call_ended':
      await handleCallEnded(call);
      break;

    case 'call_analyzed':
      await handleCallAnalyzed(event);
      break;

    default:
      console.log(`ℹ️  Unhandled event type: ${eventType}`);
  }
}

/**
 * Handle call started event
 */
async function handleCallStarted(call) {
  console.log(`📞 Call started: ${call.call_id}`);

  const { error } = await supabase
    .from('retell_calls')
    .update({
      call_status: 'in_progress',
      started_at: new Date(call.start_timestamp).toISOString(),
    })
    .eq('retell_call_id', call.call_id);

  if (error) {
    console.error('   ❌ Error updating call status:', error.message);
  } else {
    console.log('   ✅ Status → in_progress');
  }
}

/**
 * Handle call ended event
 */
async function handleCallEnded(call) {
  console.log(`✅ Call ended: ${call.call_id}`);
  console.log(`   Duration: ${call.call_duration}s`);

  const { error } = await supabase
    .from('retell_calls')
    .update({
      call_status: 'completed',
      ended_at: new Date(call.end_timestamp).toISOString(),
      duration_seconds: call.call_duration || 0,
    })
    .eq('retell_call_id', call.call_id);

  if (error) {
    console.error('   ❌ Error updating call end:', error.message);
  } else {
    console.log('   ✅ Call marked completed');
  }
}

/**
 * Handle call analyzed event (the important one!)
 */
async function handleCallAnalyzed(event) {
  const call = event.call;
  const analysis = event.call_analysis;

  console.log('🧠 Call analyzed:', call.call_id);
  console.log('📊 Full analysis data:', JSON.stringify(analysis, null, 2));

  if (!call.metadata) {
    console.warn('⚠️ No metadata - skipping');
    return;
  }

  const campaignId = call.metadata.campaign_id;
  const candidateId = call.metadata.candidate_id;

  if (!campaignId || !candidateId) {
    console.warn('⚠️ Missing IDs in metadata');
    return;
  }

  // Parse analysis data
  const analysisData = analysis?.post_call_analysis_data || {};
  console.log('📝 Analysis data received:', analysisData);
  
  const availableToWork = parseBoolean(analysisData.question_0);
  const interested = parseBoolean(analysisData.question_1);
  const knowReferee = parseBoolean(analysisData.question_2);

  // Save complete analysis to database
  const { error: analysisError } = await supabase
    .from('retell_call_analysis')
    .insert({
      retell_call_id: call.call_id,
      campaign_candidate_id: candidateId,
      campaign_id: campaignId,
      available_to_work: availableToWork,
      interested: interested,
      know_referee: knowReferee,
      custom_responses: analysisData,
      call_summary: analysis?.call_summary || '',
      sentiment_score: analysis?.call_successful ? 0.8 : 0.3,
      transcript_url: call.transcript_url,
      recording_url: call.recording_url,
      key_points: extractKeyPoints(analysis?.call_summary),
      next_steps: analysis?.in_voicemail ? 'Left voicemail - follow up' : 'Review analysis',
    });

  if (analysisError) {
    console.error('❌ Error saving analysis:', analysisError);
    console.error('   Details:', JSON.stringify(analysisError, null, 2));
  } else {
    console.log('✅ Analysis saved to retell_call_analysis');
  }

  // Update campaign candidate - THIS IS CRITICAL!
  console.log('💾 Updating campaign_candidates table...');
  const { error: updateError } = await supabase
    .from('campaign_candidates')
    .update({
      available_to_work: availableToWork,
      interested: interested,
      know_referee: knowReferee,
      last_contact: new Date().toISOString(),
      call_status: 'contacted',
    })
    .eq('id', candidateId);

  if (updateError) {
    console.error('❌ Error updating candidate:', updateError);
    console.error('   Candidate ID:', candidateId);
    console.error('   Details:', JSON.stringify(updateError, null, 2));
  } else {
    console.log('✅ Candidate updated in database!');
    console.log(`   Available: ${availableToWork ? 'YES' : 'NO'}`);
    console.log(`   Interested: ${interested ? 'YES' : 'NO'}`);
    console.log(`   Know Referee: ${knowReferee ? 'YES' : 'NO'}`);
    console.log(`   Status: contacted`);
  }
}

/**
 * Helper: Parse boolean from various formats
 */
function parseBoolean(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lower = value.toLowerCase().trim();
    return lower === 'yes' || lower === 'true' || lower === '1';
  }
  return false;
}

/**
 * Helper: Extract key points from summary
 */
function extractKeyPoints(summary) {
  if (!summary) return [];
  
  // Simple extraction - can be enhanced
  const points = [];
  const sentences = summary.split(/[.!?]+/);
  
  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (trimmed.length > 20 && trimmed.length < 200) {
      points.push(trimmed);
    }
  }
  
  return points.slice(0, 5); // Top 5 points
}


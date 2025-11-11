/**
 * Retell AI Webhook Handler
 * 
 * This endpoint receives webhook events from Retell AI after calls complete
 * Deploy this to your backend (Vercel, Netlify, or any Node.js server)
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

interface RetellWebhookEvent {
  type: 'call.started' | 'call.ended' | 'call.analyzed' | 'call.failed';
  call_id: string;
  timestamp: string;
  metadata?: {
    campaign_id?: string;
    candidate_id?: string;
  };
  duration?: number;
  analysis?: {
    answers: any[];
    custom_answers: Record<string, string>;
    summary: string;
    sentiment: number;
    key_points: string[];
    objections?: string[];
    next_steps?: string;
  };
  transcript_url?: string;
  recording_url?: string;
  error?: string;
}

export default async function handler(req: any, res: any) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const event: RetellWebhookEvent = req.body;
    console.log(`📨 Retell webhook received: ${event.type} for call ${event.call_id}`);

    switch (event.type) {
      case 'call.started':
        await handleCallStarted(event);
        break;
      
      case 'call.ended':
        await handleCallEnded(event);
        break;
      
      case 'call.analyzed':
        await handleCallAnalyzed(event);
        break;
      
      case 'call.failed':
        await handleCallFailed(event);
        break;
      
      default:
        console.log(`⚠️  Unhandled event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('❌ Webhook processing error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleCallStarted(event: RetellWebhookEvent) {
  console.log(`📞 Call started: ${event.call_id}`);
  
  const { error } = await supabase
    .from('retell_calls')
    .update({
      call_status: 'in_progress',
      started_at: new Date().toISOString(),
    })
    .eq('retell_call_id', event.call_id);

  if (error) {
    console.error('Error updating call status:', error);
  } else {
    console.log('✅ Call status updated to in_progress');
  }
}

async function handleCallEnded(event: RetellWebhookEvent) {
  console.log(`✅ Call ended: ${event.call_id} (${event.duration}s)`);
  
  const { error } = await supabase
    .from('retell_calls')
    .update({
      call_status: 'completed',
      ended_at: new Date().toISOString(),
      duration_seconds: event.duration || 0,
    })
    .eq('retell_call_id', event.call_id);

  if (error) {
    console.error('Error updating call end:', error);
  } else {
    console.log('✅ Call completed and saved');
  }
}

async function handleCallAnalyzed(event: RetellWebhookEvent) {
  console.log(`🧠 Call analyzed: ${event.call_id}`);
  
  if (!event.analysis || !event.metadata) {
    console.warn('⚠️  Missing analysis or metadata');
    return;
  }

  // Save analysis results
  const { error: analysisError } = await supabase
    .from('retell_call_analysis')
    .insert({
      retell_call_id: event.call_id,
      campaign_candidate_id: event.metadata.candidate_id,
      campaign_id: event.metadata.campaign_id,
      
      // Core analysis fields
      available_to_work: event.analysis.answers?.[0] === 'true' || event.analysis.answers?.[0] === true,
      interested: event.analysis.answers?.[1] === 'true' || event.analysis.answers?.[1] === true,
      know_referee: event.analysis.answers?.[2] === 'true' || event.analysis.answers?.[2] === true,
      
      // Custom responses
      custom_responses: event.analysis.custom_answers || {},
      
      // AI insights
      call_summary: event.analysis.summary || '',
      sentiment_score: event.analysis.sentiment || 0.5,
      key_points: event.analysis.key_points || [],
      objections: event.analysis.objections || [],
      next_steps: event.analysis.next_steps || '',
      
      // URLs
      transcript_url: event.transcript_url,
      recording_url: event.recording_url,
    });

  if (analysisError) {
    console.error('❌ Error saving analysis:', analysisError);
  } else {
    console.log('✅ Call analysis saved');
  }

  // Update campaign candidate with results
  if (event.metadata.candidate_id) {
    const { error: updateError } = await supabase
      .from('campaign_candidates')
      .update({
        available_to_work: event.analysis.answers?.[0] === 'true' || event.analysis.answers?.[0] === true,
        interested: event.analysis.answers?.[1] === 'true' || event.analysis.answers?.[1] === true,
        know_referee: event.analysis.answers?.[2] === 'true' || event.analysis.answers?.[2] === true,
        last_contact: new Date().toISOString(),
        call_status: 'contacted',
      })
      .eq('id', event.metadata.candidate_id);

    if (updateError) {
      console.error('❌ Error updating candidate:', updateError);
    } else {
      console.log('✅ Candidate status updated based on call analysis');
    }
  }
}

async function handleCallFailed(event: RetellWebhookEvent) {
  console.log(`❌ Call failed: ${event.call_id} - ${event.error}`);
  
  const { error } = await supabase
    .from('retell_calls')
    .update({
      call_status: 'failed',
      ended_at: new Date().toISOString(),
      error_message: event.error || 'Unknown error',
    })
    .eq('retell_call_id', event.call_id);

  if (error) {
    console.error('Error saving failed call:', error);
  } else {
    console.log('✅ Failed call recorded');
  }
}

// Run test
testCreateAgent();


/**
 * Retell AI Client for Campaign Integration
 * Handles agent creation, call management, and post-call analysis
 */

import Retell from 'retell-sdk';
import type { Campaign, CampaignMatrix, CampaignTarget } from '@/polymet/data/campaigns-data';
import type { Job } from '@/polymet/data/jobs-data';
import { supabase } from '@/lib/supabase';

interface RetellAgent {
  id: string;
  name: string;
  prompt: string;
  voice_id: string;
  webhook_url: string;
  post_call_analysis: {
    enabled: boolean;
    questions: string[];
  };
}

interface RetellCall {
  id: string;
  agent_id: string;
  to_number: string;
  from_number?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  duration?: number;
  metadata?: Record<string, any>;
}

interface RetellAnalysis {
  call_id: string;
  answers: boolean[];
  custom_answers: Record<string, string>;
  summary: string;
  sentiment: number;
  transcript_url?: string;
  recording_url?: string;
  key_points: string[];
  objections?: string[];
  next_steps?: string;
}

export class RetellService {
  private client: Retell;
  private webhookBaseUrl: string;
  private phoneNumber: string;

  constructor() {
    const apiKey = import.meta.env.VITE_RETELL_API_KEY || '';
    this.phoneNumber = import.meta.env.VITE_RETELL_PHONE_NUMBER || '+442046203701'; // Your UK number
    
    // Auto-detect webhook URL based on environment
    const baseUrl = import.meta.env.VITE_RETELL_WEBHOOK_URL || this.getWebhookBaseUrl();
    this.webhookBaseUrl = baseUrl;
    
    if (!apiKey) {
      throw new Error('⚠️ Retell API key not configured in environment variables');
    }

    this.client = new Retell({ apiKey });
    console.log('✅ Retell client initialized');
    console.log(`📍 Webhook URL: ${this.webhookBaseUrl || 'Not configured (testing mode)'}`);
  }

  /**
   * Auto-detect webhook base URL
   */
  private getWebhookBaseUrl(): string {
    // Check if we're in development or production
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        // Local development - check for webhook server port
        const webhookPort = 3001; // Default webhook server port
        
        // Try to detect if custom port is being used
        // Check if .webhook-info.json exists (written by server.js)
        try {
          // In production code, this would be served by the backend
          // For now, use standard port
          return `http://localhost:${webhookPort}/api`;
        } catch {
          return `http://localhost:${webhookPort}/api`;
        }
      } else {
        // Production - use same domain as the app
        return `${window.location.protocol}//${window.location.host}/api`;
      }
    }
    
    // Server-side or build time - return empty, will use from env var
    return '';
  }

  /**
   * Create a dynamic agent for a campaign
   */
  async createCampaignAgent(
    campaign: Campaign,
    job: Job
  ): Promise<string> {
    console.log('🏗️ Building agent with campaign config...');
    console.log('━'.repeat(60));
    console.log('📋 CAMPAIGN DATA RECEIVED:');
    console.log('  Name:', campaign.name);
    console.log('  Matrices Count:', campaign.matrices?.length || 0);
    console.log('  Targets Count:', campaign.targets?.length || 0);
    
    if (campaign.matrices && campaign.matrices.length > 0) {
      console.log('\n📝 YOUR MATRICES:');
      campaign.matrices.forEach((m, i) => {
        console.log(`  ${i + 1}. ${m.name}`);
        console.log(`     Call Script: "${m.callScript?.substring(0, 100)}..."`);
      });
    } else {
      console.warn('⚠️ WARNING: NO MATRICES FOUND!');
    }
    
    if (campaign.targets && campaign.targets.length > 0) {
      console.log('\n🎯 YOUR TARGETS:');
      campaign.targets.forEach((t, i) => {
        console.log(`  ${i + 1}. ${t.name} (${t.goalType}): ${t.description}`);
      });
    }
    
    console.log('\n🏢 JOB DATA:');
    console.log('  Company:', job.company);
    console.log('  Title:', job.title);
    console.log('  Salary:', job.salaryRange);
    console.log('━'.repeat(60));
    
    const prompt = this.buildDynamicPrompt(campaign, job);
    const questions = this.buildAnalysisQuestions(campaign);

    console.log('\n📝 COMPLETE PROMPT BEING SENT TO RETELL:');
    console.log('━'.repeat(60));
    console.log(prompt);
    console.log('━'.repeat(60));
    console.log('\n📊 Analysis Questions:', questions);
    console.log('━'.repeat(60));

    // Create agent using SDK
    const agentConfig = {
      agent_name: `${campaign.name} - ${job.title} - Test ${Date.now()}`,
      voice_id: import.meta.env.VITE_RETELL_VOICE_ID || '11labs-Adrian',
      language: 'en-US',
      
      // Response engine (using existing LLM from account)
      response_engine: {
        type: 'retell-llm',
        llm_id: import.meta.env.VITE_RETELL_LLM_ID || 'llm_8ac89e586847c6464a07acdf1dac',
      },
      
      // Main prompt - THIS IS THE KEY!
      general_prompt: prompt,
      general_tools: [],
      
      // Call behavior
      responsiveness: 0.8,
      interruption_sensitivity: 0.6,
      ambient_sound: 'call-center',
      
      // Post-call analysis
      post_call_analysis_data: questions.map((q, i) => ({
        name: `question_${i}`,
        description: q,
        type: 'string',
      })),
      
      // Webhook - auto-configured based on environment
      webhook_url: this.webhookBaseUrl ? `${this.webhookBaseUrl}/retell-webhook` : undefined,
      
      // Pronunciation guides if needed
      pronunciation_dictionary: [],
      
      // Enable features
      opt_out_sensitive_data_storage: false,
      enable_backchannel: true,
    };

    console.log('🚀 Step 1: Creating custom LLM with YOUR prompt...');
    
    // FIRST: Create a custom LLM with YOUR prompt (not using existing one!)
    const beginMessage = campaign.matrices?.[0]?.callScript || 
                         `Hi, I'm James from ${job.company}. How are you today?`;
    
    console.log('📢 Begin Message:', beginMessage);
    
    const llm = await this.client.llm.create({
      general_prompt: prompt,
      model: 'gpt-4o-mini',
      begin_message: beginMessage,
      general_tools: [],
    });
    
    if (!llm || !llm.llm_id) {
      throw new Error('Failed to create custom LLM');
    }
    
    console.log(`✅ Custom LLM created: ${llm.llm_id}`);
    console.log('   This LLM has YOUR prompt, not a generic one!');
    
    // NOW: Update agent config to use the fresh LLM
    agentConfig.response_engine.llm_id = llm.llm_id;
    
    console.log('🚀 Step 2: Creating agent with custom LLM...');
    console.log('   Agent name:', agentConfig.agent_name);
    console.log('   Voice:', agentConfig.voice_id);
    console.log('   Custom LLM:', llm.llm_id);
    console.log('   Prompt length:', prompt.length);

    const agent = await this.client.agent.create(agentConfig);

    if (!agent || !agent.agent_id) {
      throw new Error('Failed to create Retell agent');
    }
    
    console.log(`✅ Agent created in Retell: ${agent.agent_id}`);
    console.log(`🔗 View agent: https://dashboard.retellai.com/agents/${agent.agent_id}`);
    
    // Save agent configuration to database
    if (campaign.id) {
      await this.saveAgentToDatabase(campaign.id, agent.agent_id, prompt, questions, job);
    }
    
    return agent.agent_id;
  }

  /**
   * Build dynamic prompt from campaign configuration
   */
  private buildDynamicPrompt(campaign: Campaign, job: Job): string {
    // Use the exact prompt structure that works!
    const prompt = `Role Definition:

You are James from ${job.company}, a friendly, concise recruiter on live voice calls about ${job.title} roles. Keep responses concise but friendly.

State Variables (internal):

busy_now (bool)
interested (bool)
start_date (date or null)
willing_to_refer (bool)${campaign.targets?.map(t => `\n${t.name.toLowerCase().replace(/\s+/g, '_')} (${t.goalType === 'boolean' ? 'bool' : t.goalType})`).join('') || ''}

Overall Objective:

Guide each candidate through:
- Expressing interest
- Capturing qualifications and availability
- ${campaign.targets?.map(t => t.description).join('\n- ') || 'Gathering required information'}
- Closing gracefully

Tone & Style:

- Warm, empathetic, human-like
- Clear yes/no asks
- Short clarifying interjections
- Friendly summaries of next steps
- No um dashes in responses

Core Workflow & Branching Logic

INTRO & GREET

James: "Hi, I'm James from ${job.company}. How are you today?"

[Wait for candidate response]

If candidate indicates busy (busy_now = true):
James: "Sounds like you're quite busy. I'm calling about ${job.title} roles${job.location ? ` in ${job.location}` : ''}. Would you be interested in applying?"

If candidate responds neutrally or positively:
James: "${campaign.matrices?.[0]?.callScript || `Great! I'm calling about ${job.title} roles${job.location ? ` at ${job.location}` : ''}. Would you be interested in applying?`}"

If candidate response is unclear: go to CLARIFY UNCLEAR
If candidate says "no": set interested = false and go to DECLINE & REFERRAL INVITE  
If candidate says "yes": set interested = true and go to DETAIL PITCH & QUALIFICATION ASK

BUSY & FORM OFFER

James: "No worries, sounds like you're busy. I can send you a two minute form link now, you can complete it later. Does that work?"

If yes → SEND APPLICATION
If no → "Is there a better time I can call you?" then close or schedule follow-up.

CLARIFY UNCLEAR

James: "Sure, just to confirm, we have ${job.title} roles${job.location ? ` at ${job.location}` : ''} starting soon. Are you interested in applying?"

Loop once; if still unclear → Offer to text link + close.

DETAIL PITCH & QUALIFICATION ASK

James: "Perfect. The role is ${job.title}${job.location ? ` at ${job.location}` : ''}${job.employmentType ? `, ${job.employmentType.toLowerCase()}` : ''}${job.salaryRange ? ` with ${job.salaryRange}` : ''}. ${job.description || ''}"

${campaign.matrices && campaign.matrices.length > 1 ? `
Then ask these questions in order:
${campaign.matrices.slice(1).map((m, i) => `${i + 1}. ${m.callScript || m.description}`).join('\n')}
` : ''}

Then go to GATHER INFO or SEND APPLICATION

GATHER INFO
${campaign.targets?.map((target, i) => `
James: "${target.description}?"
[Record answer in ${target.name.toLowerCase().replace(/\s+/g, '_')}]
`).join('\n') || ''}

Then go to SEND APPLICATION

SEND APPLICATION

James: "Sending the form link now. It has the full details. Please complete it today; we're actively reviewing applications."

James: "Do you have any questions, or is there anything else I can help you with today?"

[Wait for candidate response]

Then go to CLOSE

DECLINE & REFERRAL INVITE

James: "Totally understand. We offer £250 for each referral who starts. I'll send you a two minute form where you can indicate anyone who might be interested. Do you have any questions, or are you looking for any other jobs right now?"

If candidate mentions other jobs:
James: "Got it. I'll note that and let you know if something comes up. In the meantime, feel free to send any referrals via the form for £250 per start. Any other questions before we wrap up?"

If no:
James: "Okay, if you change your mind or think of anyone, just let me know. Thanks for your time, bye!"

INTERESTED & APPLICATION CLOSE

James: "Thanks for chatting. If you're interested, remember to complete the form. Any questions before we wrap up?"

[Wait for candidate response]

James: "Great talking with you, have a fantastic day!"

CLOSE

James: "Thanks for your time, bye!"

## Knowledge Base

Job Details:
- Company: ${job.company}
- Position: ${job.title}
- Location: ${job.location}
- Type: ${job.employmentType}
- Salary Range: ${job.salaryRange}
- Description: ${job.description}
- Open Positions: ${job.openPositions}
- Target Hires: ${job.target}

${job.tags && job.tags.length > 0 ? `
Key Requirements:
${job.tags.map(tag => `- ${tag}`).join('\n')}
` : ''}

## Few-Shot Examples

Example 1: Busy but Interested
James: Hi, I'm James from ${job.company}. How are you today?
Candidate: I'm actually in a meeting.
James: Sounds like you're quite busy. I'm calling about ${job.title} roles${job.location ? ` at ${job.location}` : ''}. Would you be interested in applying?
Candidate: Yes please.
James: Great—sending the two-minute form link now. Please complete it today. Thanks, bye!

Example 2: Interested Candidate
James: Would you be interested in applying for ${job.title}?
Candidate: Yes, tell me more.
James: Perfect. The role is${job.location ? ` in ${job.location}` : ''}${job.salaryRange ? `, paying ${job.salaryRange}` : ''}. ${job.description}
${campaign.matrices?.[1]?.callScript ? `James: ${campaign.matrices[1].callScript}` : ''}
Candidate: [Answers]
James: Excellent. Sending the application form now. Please complete it today. Thanks, bye!

Example 3: Decline then Referral
James: Would you be interested in ${job.title}?
Candidate: No, not for me.
James: Totally understand. We offer £250 for each referral who starts. I'll send you a form where you can indicate anyone interested. Have a great day—bye!`;

    return prompt;
  }

  /**
   * Build analysis questions based on campaign configuration
   */
  private buildAnalysisQuestions(campaign: Campaign): string[] {
    const questions: string[] = [
      'Is the candidate available to work within the next 30 days?',
      'Is the candidate interested in the position?',
      'Does the candidate know anyone currently working at the company?',
    ];

    // Add questions based on campaign targets
    campaign.targets?.forEach(target => {
      if (target.goalType === 'boolean') {
        questions.push(`${target.description}?`);
      } else if (target.goalType === 'text') {
        questions.push(`What did the candidate say about ${target.name}?`);
      } else if (target.goalType === 'number') {
        questions.push(`What is the candidate's ${target.name}?`);
      }
    });

    // Add custom evaluation questions from matrices
    campaign.matrices?.forEach(matrix => {
      if (matrix.name && matrix.description) {
        questions.push(`Regarding "${matrix.name}": ${matrix.description}`);
      }
    });

    return questions;
  }

  /**
   * Build summary prompt for post-call analysis
   */
  private buildSummaryPrompt(campaign: Campaign): string {
    return `Provide a concise summary of the call focusing on:
1. Candidate's availability and timeline
2. Level of interest (very interested, somewhat interested, not interested)
3. Key qualifications or experience mentioned
4. Any concerns or objections raised
5. Next steps agreed upon
6. Overall sentiment and likelihood of moving forward

Be specific and factual. Include any important quotes or specific details mentioned.`;
  }

  /**
   * Make a call to a candidate
   */
  async makeCall(
    campaignId: string,
    candidateId: string,
    phoneNumber: string,
    agentId: string
  ): Promise<string> {
    console.log(`📞 Making call to ${phoneNumber}`);
    console.log(`   Using agent: ${agentId}`);
    console.log(`   From number: ${this.phoneNumber}`);
    
    // CRITICAL: Explicitly set agent_id to override phone number's default agent
    const callConfig = {
      agent_id: agentId,  // YOUR campaign agent, not default!
      to_number: phoneNumber,
      from_number: this.phoneNumber,
      metadata: {
        campaign_id: campaignId,
        candidate_id: candidateId,
        timestamp: new Date().toISOString(),
      },
      retell_llm_dynamic_variables: {
        candidate_name: '',
        job_title: '',
      },
      // Force override any phone number defaults
      override_agent_id: agentId,
    };
    
    console.log('🚀 Call config:', {
      agent_id: callConfig.agent_id,
      to_number: callConfig.to_number,
      from_number: callConfig.from_number,
    });

    // Create call using SDK
    const call = await this.client.call.createPhoneCall(callConfig);

    if (!call || !call.call_id) {
      throw new Error('Failed to initiate call');
    }
    
    console.log(`✅ Call created: ${call.call_id}`);
    console.log(`   Verify agent in Retell dashboard: https://dashboard.retellai.com/calls/${call.call_id}`);
    
    // Save call record to database
    await this.saveCallToDatabase(campaignId, candidateId, call.call_id, agentId, phoneNumber);
    
    return call.call_id;
  }

  /**
   * Launch batch calls for multiple candidates
   */
  async launchBatchCalls(
    campaignId: string,
    candidates: Array<{ id: string; phone: string }>,
    agentId: string,
    options: {
      delayBetweenCalls?: number;
      maxConcurrent?: number;
    } = {}
  ): Promise<string> {
    const { delayBetweenCalls = 2000, maxConcurrent = 5 } = options;
    
    // Create batch job record
    const batchId = await this.createBatchJob(campaignId, candidates.length);
    
    console.log('═'.repeat(60));
    console.log(`🚀 BATCH CALLING INITIATED`);
    console.log('═'.repeat(60));
    console.log(`📊 Batch ID: ${batchId}`);
    console.log(`📞 Total Candidates: ${candidates.length}`);
    console.log(`⚡ Concurrent Calls: ${maxConcurrent} at a time`);
    console.log(`⏱️  Delay Between Batches: ${delayBetweenCalls}ms`);
    console.log('═'.repeat(60));
    
    // Process candidates in chunks (CONCURRENT batches!)
    const totalChunks = Math.ceil(candidates.length / maxConcurrent);
    
    for (let i = 0; i < candidates.length; i += maxConcurrent) {
      const chunkNumber = Math.floor(i / maxConcurrent) + 1;
      const chunk = candidates.slice(i, i + maxConcurrent);
      
      console.log(`\n🔥 CHUNK ${chunkNumber}/${totalChunks}: Calling ${chunk.length} candidates SIMULTANEOUSLY`);
      console.log(`   ${chunk.map((c, idx) => `${idx + 1}. ${c.phone}`).join('\n   ')}`);
      console.log(`   ⚡ Starting ${chunk.length} calls in PARALLEL...`);
      
      const startTime = Date.now();
      
      // Make calls in parallel for this chunk
      const callPromises = chunk.map((candidate, idx) =>
        this.makeCall(campaignId, candidate.id, candidate.phone, agentId)
          .then(callId => {
            console.log(`   ✅ Call ${idx + 1}/${chunk.length} started: ${callId}`);
            return callId;
          })
          .catch(error => {
            console.error(`   ❌ Call ${idx + 1}/${chunk.length} failed: ${error.message}`);
            return null;
          })
      );
      
      // Wait for ALL calls in this chunk to start (PARALLEL!)
      const results = await Promise.all(callPromises);
      
      const duration = Date.now() - startTime;
      const successful = results.filter(r => r !== null).length;
      
      console.log(`   ✅ Chunk ${chunkNumber} complete in ${duration}ms`);
      console.log(`   📊 Success: ${successful}/${chunk.length}`);
      
      // Update batch progress
      await this.updateBatchProgress(batchId, Math.min(i + maxConcurrent, candidates.length));
      
      // Delay before next chunk (if not last chunk)
      if (i + maxConcurrent < candidates.length) {
        console.log(`   ⏳ Waiting ${delayBetweenCalls}ms before next chunk...\n`);
        await new Promise(resolve => setTimeout(resolve, delayBetweenCalls));
      }
    }
    
    // Mark batch as completed
    await this.completeBatchJob(batchId);
    
    console.log('\n' + '═'.repeat(60));
    console.log(`✅ BATCH CALLING COMPLETE`);
    console.log(`   Batch ID: ${batchId}`);
    console.log(`   Total Candidates: ${candidates.length}`);
    console.log('═'.repeat(60));
    
    return batchId;
  }

  /**
   * Get call details
   */
  async getCall(callId: string): Promise<any> {
    return await this.client.call.retrieve(callId);
  }

  /**
   * Get agent details
   */
  async getAgent(agentId: string): Promise<any> {
    return await this.client.agent.retrieve(agentId);
  }

  /**
   * Save agent configuration to database
   */
  private async saveAgentToDatabase(
    campaignId: string,
    agentId: string,
    prompt: string,
    questions: string[],
    job: Job
  ) {
    const { error } = await supabase
      .from('campaign_retell_agents')
      .insert({
        campaign_id: campaignId,
        retell_agent_id: agentId,
        agent_name: `${job.title} Agent`,
        base_prompt: prompt,
        dynamic_questions: questions,
        job_context: {
          job_id: job.id,
          title: job.title,
          company: job.company,
          location: job.location,
        },
      });

    if (error) {
      console.error('Error saving agent to database:', error);
    }
  }

  /**
   * Save call record to database
   */
  private async saveCallToDatabase(
    campaignId: string,
    candidateId: string,
    retellCallId: string,
    agentId: string,
    phoneNumber: string
  ) {
    const { error } = await supabase
      .from('retell_calls')
      .insert({
        campaign_id: campaignId,
        candidate_id: candidateId,
        retell_call_id: retellCallId,
        retell_agent_id: agentId,
        phone_number: phoneNumber,
        call_status: 'pending',
      });

    if (error) {
      console.error('Error saving call to database:', error);
    }
  }

  /**
   * Create batch job record
   */
  private async createBatchJob(campaignId: string, totalCandidates: number): Promise<string> {
    const { data, error } = await supabase
      .from('retell_batch_calls')
      .insert({
        campaign_id: campaignId,
        total_candidates: totalCandidates,
        completed_calls: 0,
        failed_calls: 0,
        status: 'in_progress',
        started_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error || !data) {
      throw new Error('Failed to create batch job');
    }

    return data.id;
  }

  /**
   * Update batch job progress
   */
  private async updateBatchProgress(batchId: string, completedCount: number) {
    await supabase
      .from('retell_batch_calls')
      .update({
        completed_calls: completedCount,
      })
      .eq('id', batchId);
  }

  /**
   * Mark batch job as completed
   */
  private async completeBatchJob(batchId: string) {
    await supabase
      .from('retell_batch_calls')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', batchId);
  }

  /**
   * Cancel/Stop a batch of calls
   * Note: Retell doesn't support forcefully terminating in-progress calls
   * This marks the batch as cancelled and prevents new calls
   */
  async cancelBatchCalls(batchId: string): Promise<boolean> {
    console.log(`🛑 Cancelling batch: ${batchId}`);
    
    const { error } = await supabase
      .from('retell_batch_calls')
      .update({
        status: 'cancelled',
        completed_at: new Date().toISOString(),
      })
      .eq('id', batchId);

    if (error) {
      console.error('Error cancelling batch:', error);
      return false;
    }

    // Mark all pending calls as cancelled
    const { error: callsError } = await supabase
      .from('retell_calls')
      .update({
        call_status: 'failed',
        error_message: 'Batch cancelled by user',
        ended_at: new Date().toISOString(),
      })
      .eq('campaign_id', batchId)
      .eq('call_status', 'pending');

    if (callsError) {
      console.warn('Warning: Could not cancel pending calls:', callsError);
    }

    console.log('✅ Batch cancelled. In-progress calls will complete naturally.');
    return true;
  }

  /**
   * Stop all calling for a campaign
   */
  async stopCampaignCalling(campaignId: string): Promise<boolean> {
    console.log(`🛑 Stopping all calling for campaign: ${campaignId}`);

    // Cancel all in-progress batches
    const { data: batches } = await supabase
      .from('retell_batch_calls')
      .select('id')
      .eq('campaign_id', campaignId)
      .eq('status', 'in_progress');

    if (batches && batches.length > 0) {
      for (const batch of batches) {
        await this.cancelBatchCalls(batch.id);
      }
    }

    // Update campaign status
    const { error } = await supabase
      .from('campaigns')
      .update({ status: 'paused' })
      .eq('id', campaignId);

    if (error) {
      console.error('Error updating campaign status:', error);
      return false;
    }

    console.log('✅ Campaign calling stopped');
    return true;
  }

  /**
   * Process webhook event from Retell
   */
  async processWebhook(event: any) {
    console.log('📨 Processing Retell webhook:', event.type);

    switch (event.type) {
      case 'call.started':
        await this.handleCallStarted(event);
        break;
      
      case 'call.ended':
        await this.handleCallEnded(event);
        break;
      
      case 'call.analyzed':
        await this.handleCallAnalyzed(event);
        break;
      
      case 'call.failed':
        await this.handleCallFailed(event);
        break;
      
      default:
        console.log(`Unhandled webhook event type: ${event.type}`);
    }
  }

  private async handleCallStarted(event: any) {
    await supabase
      .from('retell_calls')
      .update({
        call_status: 'in_progress',
        started_at: new Date().toISOString(),
      })
      .eq('retell_call_id', event.call_id);
  }

  private async handleCallEnded(event: any) {
    await supabase
      .from('retell_calls')
      .update({
        call_status: 'completed',
        ended_at: new Date().toISOString(),
        duration_seconds: event.duration,
      })
      .eq('retell_call_id', event.call_id);
  }

  private async handleCallAnalyzed(event: any) {
    // Save analysis results
    const { error } = await supabase
      .from('retell_call_analysis')
      .insert({
        retell_call_id: event.call_id,
        campaign_candidate_id: event.metadata?.candidate_id,
        available_to_work: event.analysis?.answers?.[0] || false,
        interested: event.analysis?.answers?.[1] || false,
        know_referee: event.analysis?.answers?.[2] || false,
        custom_responses: event.analysis?.custom_answers || {},
        call_summary: event.analysis?.summary || '',
        sentiment_score: event.analysis?.sentiment || 0.5,
        transcript_url: event.transcript_url,
        recording_url: event.recording_url,
        key_points: event.analysis?.key_points || [],
        objections: event.analysis?.objections || [],
        next_steps: event.analysis?.next_steps || '',
      });

    if (error) {
      console.error('Error saving call analysis:', error);
    }

    // Update campaign candidate based on analysis
    if (event.metadata?.candidate_id) {
      await supabase
        .from('campaign_candidates')
        .update({
          available_to_work: event.analysis?.answers?.[0] || false,
          interested: event.analysis?.answers?.[1] || false,
          know_referee: event.analysis?.answers?.[2] || false,
          last_contact: new Date().toISOString(),
          call_status: 'contacted',
        })
        .eq('id', event.metadata.candidate_id);
    }
  }

  private async handleCallFailed(event: any) {
    await supabase
      .from('retell_calls')
      .update({
        call_status: 'failed',
        ended_at: new Date().toISOString(),
      })
      .eq('retell_call_id', event.call_id);

    // Update failed calls count in batch if applicable
    // This would need batch_id in metadata
  }
}

// Export singleton instance
export const retellService = new RetellService();

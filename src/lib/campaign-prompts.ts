/**
 * Campaign Prompts Fetcher
 * 
 * Fetches AI prompts and first messages from webhook
 * Used for testing agents before launching campaigns
 */

import type { CampaignObjective } from './campaign-webhook';

const PROMPT_WEBHOOK_URL = 'https://n8n-rapid-czbff9cnafhkhmhf.eastus-01.azurewebsites.net/webhook/get-prompt-for-agent';

export interface CampaignPrompts {
  prompt_chat: string;
  prompt_call: string;
  first_message_chat: string;
  first_message_call: string;
}

export interface RetellConfig {
  agent_prompt: string;
  first_message: string;
}

/**
 * Fetch AI prompts from webhook
 */
export async function fetchCampaignPrompts(
  campaignName: string,
  jobDescription: string,
  objectives: { [key: string]: CampaignObjective }
): Promise<CampaignPrompts | null> {
  try {
    console.log('📥 Fetching AI prompts from webhook...');
    
    // Build payload (same as campaign launch, but we're just getting prompts)
    const payload = {
      campaign: campaignName,
      tasks: [], // Empty for prompt fetch
      job_description: jobDescription,
      objectives,
    };
    
    const response = await fetch(PROMPT_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
    }
    
    const prompts: CampaignPrompts = await response.json();
    
    console.log('✅ AI prompts fetched successfully');
    console.log('📝 Chat Prompt:', prompts.prompt_chat?.substring(0, 100) + '...');
    console.log('📞 Call Prompt:', prompts.prompt_call?.substring(0, 100) + '...');
    
    return prompts;
    
  } catch (error) {
    console.error('❌ Failed to fetch prompts:', error);
    return null;
  }
}

/**
 * Convert webhook prompts to Retell configuration
 */
export function convertToRetellConfig(prompts: CampaignPrompts): RetellConfig {
  return {
    agent_prompt: prompts.prompt_call,
    first_message: prompts.first_message_call,
  };
}

/**
 * Get chat configuration from prompts
 */
export function getChatConfig(prompts: CampaignPrompts) {
  return {
    prompt: prompts.prompt_chat,
    first_message: prompts.first_message_chat,
  };
}

/**
 * Test webhook connectivity
 */
export async function testPromptWebhook(): Promise<boolean> {
  try {
    const testPayload = {
      campaign: 'test_prompt_fetch',
      tasks: [],
      job_description: 'Test job description',
      objectives: {
        test_objective: {
          type: 'boolean',
          description: 'Test objective',
        },
      },
    };
    
    const response = await fetch(PROMPT_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    });
    
    return response.ok;
  } catch (error) {
    console.error('Prompt webhook test failed:', error);
    return false;
  }
}


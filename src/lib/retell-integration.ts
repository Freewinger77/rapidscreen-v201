/**
 * Retell AI Integration
 * 
 * Launches real AI calls using Retell AI with dynamic prompts
 */

import type { CampaignPrompts } from './campaign-prompts';

const RETELL_API_KEY = import.meta.env.VITE_RETELL_API_KEY;
const RETELL_PHONE_NUMBER = import.meta.env.VITE_RETELL_PHONE_NUMBER;
const RETELL_AGENT_ID = import.meta.env.VITE_RETELL_AGENT_ID;

export interface RetellCallConfig {
  agent_prompt: string;      // Maps to prompt_call from webhook
  first_message: string;      // Maps to first_message_call from webhook
  phone_number: string;       // Phone to call
}

/**
 * Update Retell agent with dynamic prompts
 */
async function updateRetellAgent(agentPrompt: string, firstMessage: string): Promise<boolean> {
  try {
    const response = await fetch(`https://api.retellai.com/update-agent/${RETELL_AGENT_ID}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${RETELL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agent_prompt: agentPrompt,
        first_message: firstMessage,
      }),
    });

    if (!response.ok) {
      console.error('Failed to update Retell agent:', await response.text());
      return false;
    }

    console.log('✅ Retell agent updated with dynamic prompts');
    return true;
  } catch (error) {
    console.error('Error updating Retell agent:', error);
    return false;
  }
}

/**
 * Launch a Retell AI call with dynamic prompts
 */
export async function launchRetellCall(
  prompts: CampaignPrompts,
  phoneNumber: string
): Promise<{
  success: boolean;
  callId?: string;
  error?: string;
}> {
  try {
    console.log('🤖 Launching Retell AI call...');
    console.log('📞 Calling:', phoneNumber);
    
    // First, update the agent with dynamic prompts
    const updated = await updateRetellAgent(
      prompts.prompt_call,
      prompts.first_message_call
    );

    if (!updated) {
      throw new Error('Failed to update agent with prompts');
    }

    // Then initiate the call
    const response = await fetch('https://api.retellai.com/create-phone-call', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RETELL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from_number: RETELL_PHONE_NUMBER,
        to_number: phoneNumber,
        agent_id: RETELL_AGENT_ID,
        // The agent already has the updated prompts from above
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Retell API error: ${errorText}`);
    }

    const result = await response.json();
    
    console.log('✅ Call initiated!');
    console.log('📞 Call ID:', result.call_id);

    return {
      success: true,
      callId: result.call_id,
    };

  } catch (error) {
    console.error('❌ Failed to launch call:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check if Retell is configured
 */
export function isRetellConfigured(): boolean {
  return !!(RETELL_API_KEY && RETELL_PHONE_NUMBER && RETELL_AGENT_ID);
}

/**
 * Get Retell configuration
 */
export function getRetellConfig() {
  return {
    apiKey: RETELL_API_KEY,
    phoneNumber: RETELL_PHONE_NUMBER,
    agentId: RETELL_AGENT_ID,
    isConfigured: isRetellConfigured(),
  };
}



/**
 * Retell Web Call Integration
 * 
 * Creates web calls for in-browser testing with dynamic prompts
 */

import type { CampaignPrompts } from './campaign-prompts';

const RETELL_API_KEY = import.meta.env.VITE_RETELL_API_KEY;
const RETELL_AGENT_ID = import.meta.env.VITE_RETELL_AGENT_ID;

export interface WebCallResponse {
  call_id: string;
  access_token: string;
  call_type: 'web_call';
  agent_id: string;
  call_status: string;
}

/**
 * Create a Retell web call with dynamic prompts
 * 
 * Uses retell_llm_dynamic_variables to inject the campaign-specific
 * prompts into the agent
 */
export async function createRetellWebCall(
  prompts: CampaignPrompts
): Promise<{
  success: boolean;
  data?: WebCallResponse;
  error?: string;
}> {
  try {
    console.log('=' .repeat(60));
    console.log('🤖 CREATING RETELL WEB CALL');
    console.log('=' .repeat(60));
    console.log('🔑 API Key:', RETELL_API_KEY ? '***' + RETELL_API_KEY.slice(-8) : 'MISSING!');
    console.log('🤖 Agent ID:', RETELL_AGENT_ID || 'MISSING!');
    console.log('📝 Agent Prompt:', prompts.prompt_call.substring(0, 150) + '...');
    console.log('💬 First Message:', prompts.first_message_call);
    console.log('=' .repeat(60));

    // Use agent_override to inject dynamic prompts via Retell LLM
    const payload = {
      agent_id: RETELL_AGENT_ID,
      agent_override: {
        retell_llm: {
          begin_message: prompts.first_message_call,  // First thing AI says
        },
      },
      retell_llm_dynamic_variables: {
        agent_prompt: prompts.prompt_call,
        first_message: prompts.first_message_call,
      },
    };

    console.log('📤 POST https://api.retellai.com/v2/create-web-call');
    console.log('📦 Payload:', JSON.stringify(payload, null, 2));

    const response = await fetch('https://api.retellai.com/v2/create-web-call', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RETELL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('📨 Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Retell API error response:', errorText);
      throw new Error(`Retell API error (${response.status}): ${errorText}`);
    }

    const data: WebCallResponse = await response.json();
    
    console.log('✅ Web call created successfully!');
    console.log('📞 Call ID:', data.call_id);
    console.log('🔑 Access Token:', data.access_token);
    console.log('📊 Call Status:', data.call_status);
    console.log('=' .repeat(60));

    return {
      success: true,
      data,
    };

  } catch (error) {
    console.error('=' .repeat(60));
    console.error('❌ FAILED TO CREATE WEB CALL');
    console.error('Error:', error);
    console.error('=' .repeat(60));
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Open Retell web call in new window/tab
 */
export function openRetellWebCall(accessToken: string, callId: string) {
  console.log('=' .repeat(60));
  console.log('🌐 OPENING WEB CALL IN BROWSER');
  console.log('=' .repeat(60));
  console.log('📞 Call ID:', callId);
  console.log('🔑 Access Token:', accessToken.substring(0, 30) + '...');
  
  // Retell Web SDK URL - construct the web interface URL
  const retellWebUrl = `https://app.retellai.com/call/${callId}?token=${accessToken}`;
  
  console.log('🔗 URL:', retellWebUrl);
  console.log('🪟 Opening popup window...');
  
  // Open in new window with specific dimensions
  const width = 500;
  const height = 700;
  const left = (screen.width / 2) - (width / 2);
  const top = (screen.height / 2) - (height / 2);
  
  const callWindow = window.open(
    retellWebUrl,
    'RetellWebCall',
    `width=${width},height=${height},left=${left},top=${top},toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes`
  );

  if (callWindow) {
    callWindow.focus();
    console.log('✅ Popup window opened successfully!');
    console.log('💡 If you don\'t see it, check if popup was blocked');
    console.log('=' .repeat(60));
  } else {
    console.error('❌ POPUP BLOCKED! Opening in same tab instead...');
    console.log('=' .repeat(60));
    // Fallback: open in same tab
    window.location.href = retellWebUrl;
  }

  return callWindow;
}

/**
 * Check if Retell is configured for web calls
 */
export function isRetellWebCallConfigured(): boolean {
  const isConfigured = !!(RETELL_API_KEY && RETELL_AGENT_ID);
  
  if (!isConfigured) {
    console.warn('⚠️ Retell Web Call not configured');
    console.warn('Missing:', {
      apiKey: !RETELL_API_KEY ? 'VITE_RETELL_API_KEY' : 'OK',
      agentId: !RETELL_AGENT_ID ? 'VITE_RETELL_AGENT_ID' : 'OK',
    });
  }
  
  return isConfigured;
}

/**
 * Get Retell configuration for display
 */
export function getRetellWebCallConfig() {
  return {
    apiKey: RETELL_API_KEY ? '***' + RETELL_API_KEY.slice(-4) : 'Not set',
    agentId: RETELL_AGENT_ID || 'Not set',
    isConfigured: isRetellWebCallConfigured(),
  };
}


/**
 * Backend API Helpers (Browser-Compatible)
 * 
 * Uses Supabase client for browser compatibility
 */

import { backendSupabase } from './supabase-client';
import type {
  SessionInfo,
  ChatMessage,
  CallInfo,
  CampaignInfo,
  BackendCandidateProfile,
} from './backend-types';

// ============================================
// CHAT HISTORY
// ============================================

export async function getChatHistoryByPhone(phoneNumber: string): Promise<ChatMessage[]> {
  try {
    if (!backendSupabase) {
      console.warn('Backend Supabase not configured');
      return [];
    }

    // Get session_id from phone number
    const { data: numberRow, error: numError } = await backendSupabase
      .from('numbers')
      .select('session_id')
      .eq('phone_number', phoneNumber)
      .single();

    if (numError || !numberRow) {
      return [];
    }

    return getChatHistoryBySession(numberRow.session_id);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return [];
  }
}

export async function getChatHistoryBySession(sessionId: string): Promise<ChatMessage[]> {
  try {
    if (!backendSupabase) {
      console.warn('Backend Supabase not configured');
      return [];
    }

    const { data: messages, error } = await backendSupabase
      .from('chat_history')
      .select('message, id')
      .eq('session_id', sessionId)
      .order('id', { ascending: true });

    if (error) throw error;

    // Parse the message structure: {type: 'human'|'ai', content: '...'}
    return (messages || []).map((row: any) => {
      const msg = row.message;
      
      // Determine sender
      const sender = msg.type === 'human' ? 'user' : 'agent';
      
      // Extract text content
      let text = '';
      if (msg.type === 'human') {
        // Human messages have direct content
        text = msg.content || '';
      } else if (msg.type === 'ai') {
        // AI messages have JSON in content
        try {
          const parsed = JSON.parse(msg.content);
          text = parsed.output?.message || msg.content;
        } catch {
          text = msg.content || '';
        }
      }
      
      return {
        sender,
        text,
        timestamp: new Date().toISOString(), // Chat history doesn't have timestamps
        status: 'read',
      } as ChatMessage;
    });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return [];
  }
}

// ============================================
// SESSION INFO
// ============================================

export async function getSessionByPhone(phoneNumber: string): Promise<SessionInfo | null> {
  try {
    const { data, error } = await backendSupabase
      .from('numbers')
      .select(`
        session_id,
        session_info (*)
      `)
      .eq('phone_number', phoneNumber)
      .single();

    if (error || !data) return null;

    return (data as any).session_info as SessionInfo;
  } catch (error) {
    console.error('Error fetching session:', error);
    return null;
  }
}

export async function getSessionById(sessionId: string): Promise<SessionInfo | null> {
  try {
    const { data, error } = await backendSupabase
      .from('session_info')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (error) return null;
    return data as SessionInfo;
  } catch (error) {
    console.error('Error fetching session:', error);
    return null;
  }
}

export async function getSessionsByCampaign(campaignName: string): Promise<SessionInfo[]> {
  try {
    if (!backendSupabase) {
      console.warn('Backend Supabase not configured');
      return [];
    }

    const { data, error } = await backendSupabase
      .from('session_info')
      .select('*')
      .eq('campaign', campaignName)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as SessionInfo[];
  } catch (error) {
    console.error('Error fetching campaign sessions:', error);
    return [];
  }
}

// ============================================
// CALL INFO
// ============================================

export async function getCallsBySession(sessionId: string): Promise<CallInfo[]> {
  try {
    const { data, error } = await backendSupabase
      .from('call_info')
      .select('*')
      .eq('session_id', sessionId)
      .order('called_at', { ascending: false });

    if (error) throw error;
    return (data || []) as CallInfo[];
  } catch (error) {
    console.error('Error fetching calls:', error);
    return [];
  }
}

export async function getCallsByPhone(phoneNumber: string): Promise<CallInfo[]> {
  try {
    const { data: numberRow, error: numError } = await backendSupabase
      .from('numbers')
      .select('session_id')
      .eq('phone_number', phoneNumber)
      .single();

    if (numError || !numberRow) {
      return [];
    }

    return getCallsBySession(numberRow.session_id);
  } catch (error) {
    console.error('Error fetching calls:', error);
    return [];
  }
}

// ============================================
// CAMPAIGN INFO
// ============================================

export async function getCampaignInfo(campaignName: string): Promise<CampaignInfo | null> {
  try {
    const { data, error } = await backendSupabase
      .from('campaign_info')
      .select('*')
      .eq('campaign', campaignName)
      .single();

    if (error) return null;
    return data as CampaignInfo;
  } catch (error) {
    console.error('Error fetching campaign info:', error);
    return null;
  }
}

export async function getAllCampaigns(): Promise<CampaignInfo[]> {
  try {
    const { data, error } = await backendSupabase
      .from('campaign_info')
      .select('*')
      .order('start', { ascending: false });

    if (error) throw error;
    return (data || []) as CampaignInfo[];
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return [];
  }
}

// ============================================
// COMBINED/ENRICHED DATA
// ============================================

export async function getCandidateProfile(phoneNumber: string): Promise<BackendCandidateProfile | null> {
  try {
    const session = await getSessionByPhone(phoneNumber);
    if (!session) return null;

    const [chatHistory, callHistory, campaignInfo] = await Promise.all([
      getChatHistoryBySession(session.session_id),
      getCallsBySession(session.session_id),
      session.campaign ? getCampaignInfo(session.campaign) : Promise.resolve(null),
    ]);

    return {
      phoneNumber,
      sessionId: session.session_id,
      sessionInfo: session,
      campaignInfo,
      chatHistory,
      callHistory,
      objectiveTimeline: [], // Would need to query session_objective_events
    };
  } catch (error) {
    console.error('Error fetching candidate profile:', error);
    return null;
  }
}

export async function getPhoneNumber(sessionId: string): Promise<string | null> {
  try {
    const { data, error } = await backendSupabase
      .from('numbers')
      .select('phone_number')
      .eq('session_id', sessionId)
      .single();

    if (error) return null;
    return data?.phone_number || null;
  } catch (error) {
    console.error('Error fetching phone number:', error);
    return null;
  }
}

// ============================================
// CAMPAIGN MANAGEMENT
// ============================================

/**
 * Stop a campaign and mark all its sessions as complete
 */
export async function stopCampaign(campaignName: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!backendSupabase) {
      return { success: false, error: 'Backend Supabase not configured' };
    }

    // Update all sessions for this campaign to 'complete' status
    const { error: sessionError } = await backendSupabase
      .from('session_info')
      .update({ session_status: 'complete' })
      .eq('campaign', campaignName);

    if (sessionError) {
      console.error('Error updating sessions:', sessionError);
      return { success: false, error: sessionError.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error stopping campaign:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}


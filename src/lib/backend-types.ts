/**
 * Backend Database Types
 * 
 * TypeScript types matching the backend database schema
 */

// ============================================
// SESSION INFO
// ============================================

export interface SessionInfo {
  session_id: string;
  created_at: string;
  updated_at: string;
  user_updated: string | null;
  agent_updated: string | null;
  last_action: string | null;
  action_status: string | null;
  session_status: string; // 'active', 'completed', etc.
  last_user_msg_at: string | null;
  last_agent_msg_at: string | null;
  last_outbound_at: string | null;
  next_reminder_at: string | null;
  reminder_count: number;
  tz: string;
  campaign: string | null;
  objectives: SessionObjectives | null; // JSONB
  latest_batch_call_id: string | null;
}

export interface SessionObjectives {
  [key: string]: any; // Flexible JSON structure
  // Common fields based on campaign objectives:
  interested?: boolean | null;
  available_to_work?: boolean | null;
  know_referee?: boolean | null;
  experience?: string | null;
  location?: string | null;
  // Add more as needed
}

// ============================================
// CHAT HISTORY
// ============================================

export interface ChatHistoryRow {
  id: number;
  session_id: string;
  message: ChatMessage; // JSONB
}

export interface ChatMessage {
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
  // Additional fields that might exist
  media_url?: string;
  media_type?: string;
  message_id?: string;
}

// ============================================
// CALL INFO
// ============================================

export interface CallInfo {
  call_id: string;
  status: string | null;
  called_at: string;
  duration: string | null; // PostgreSQL interval as string
  transcript: string | null;
  recording_url: string | null;
  analysis: CallAnalysis | null; // JSONB
  session_id: string | null;
  batch_call_id: string | null;
}

export interface CallAnalysis {
  [key: string]: any; // Flexible JSON structure
  // Common fields from AI analysis:
  summary?: string;
  sentiment?: string;
  interested?: boolean;
  available_to_work?: boolean;
  know_referee?: boolean;
  key_points?: string[];
  // Add more as needed
}

// ============================================
// CAMPAIGN INFO
// ============================================

export interface CampaignInfo {
  campaign: string;
  job_info: string | null;
  objectives_template: CampaignObjectivesTemplate | null; // JSONB
  prompt_chat: string | null;
  prompt_call: string | null;
  first_message_chat: string | null;
  start: string | null;
  end: string | null;
  first_message_call: string | null;
}

export interface CampaignObjectivesTemplate {
  [objectiveName: string]: {
    type: 'boolean' | 'text' | 'number';
    description?: string;
    required?: boolean;
  };
}

// ============================================
// CAMPAIGNS (Session-Campaign Link)
// ============================================

export interface CampaignSession {
  session_id: string;
  campaign: string;
}

// ============================================
// NUMBERS
// ============================================

export interface NumbersRow {
  session_id: string;
  phone_number: string;
}

// ============================================
// SESSION OBJECTIVE EVENTS
// ============================================

export interface SessionObjectiveEvent {
  id: number;
  session_id: string;
  objective: string;
  old_value: any | null; // JSONB
  new_value: any | null; // JSONB
  source: string; // 'call', 'chat', 'manual'
  occurred_at: string;
}

// ============================================
// COMBINED/ENRICHED TYPES FOR FRONTEND USE
// ============================================

/**
 * Complete candidate profile with all backend data
 */
export interface BackendCandidateProfile {
  phoneNumber: string;
  sessionId: string;
  sessionInfo: SessionInfo;
  campaignInfo: CampaignInfo | null;
  chatHistory: ChatMessage[];
  callHistory: CallInfo[];
  objectiveTimeline: SessionObjectiveEvent[];
}

/**
 * Campaign statistics from backend
 */
export interface BackendCampaignStats {
  campaign: string;
  totalSessions: number;
  activeSessions: number;
  completedSessions: number;
  totalMessages: number;
  totalCalls: number;
  objectivesAchieved: {
    [objectiveName: string]: number; // Count of sessions where objective is true/complete
  };
  latestActivity: string | null; // ISO timestamp
}

/**
 * Real-time session data
 */
export interface LiveSessionData {
  sessionId: string;
  phoneNumber: string;
  campaign: string;
  status: string;
  lastActivity: string;
  messageCount: number;
  callCount: number;
  objectives: SessionObjectives;
}


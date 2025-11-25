/**
 * Backend API Helpers
 * 
 * Functions to query the backend database and retrieve
 * real-time campaign, call, and chat data
 */

import backendSql from './backend-db';
import type {
  SessionInfo,
  ChatHistoryRow,
  ChatMessage,
  CallInfo,
  CampaignInfo,
  NumbersRow,
  SessionObjectiveEvent,
  BackendCandidateProfile,
  BackendCampaignStats,
  LiveSessionData,
} from './backend-types';

// ============================================
// CHAT HISTORY
// ============================================

/**
 * Get chat history for a phone number
 */
export async function getChatHistoryByPhone(phoneNumber: string): Promise<ChatMessage[]> {
  try {
    // First get session_id from phone number
    const [numberRow] = await backendSql<NumbersRow[]>`
      SELECT session_id FROM numbers 
      WHERE phone_number = ${phoneNumber}
    `;
    
    if (!numberRow) {
      return [];
    }
    
    // Get all messages for this session
    const messages = await backendSql<ChatHistoryRow[]>`
      SELECT message, id
      FROM chat_history
      WHERE session_id = ${numberRow.session_id}
      ORDER BY id ASC
    `;
    
    return messages.map(row => row.message);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return [];
  }
}

/**
 * Get chat history for a session
 */
export async function getChatHistoryBySession(sessionId: string): Promise<ChatMessage[]> {
  try {
    const messages = await backendSql<ChatHistoryRow[]>`
      SELECT message, id
      FROM chat_history
      WHERE session_id = ${sessionId}
      ORDER BY id ASC
    `;
    
    return messages.map(row => row.message);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return [];
  }
}

// ============================================
// SESSION INFO
// ============================================

/**
 * Get session info by phone number
 */
export async function getSessionByPhone(phoneNumber: string): Promise<SessionInfo | null> {
  try {
    const [result] = await backendSql<(NumbersRow & SessionInfo)[]>`
      SELECT si.*
      FROM numbers n
      JOIN session_info si ON si.session_id = n.session_id
      WHERE n.phone_number = ${phoneNumber}
    `;
    
    return result || null;
  } catch (error) {
    console.error('Error fetching session:', error);
    return null;
  }
}

/**
 * Get session info by session ID
 */
export async function getSessionById(sessionId: string): Promise<SessionInfo | null> {
  try {
    const [result] = await backendSql<SessionInfo[]>`
      SELECT * FROM session_info
      WHERE session_id = ${sessionId}
    `;
    
    return result || null;
  } catch (error) {
    console.error('Error fetching session:', error);
    return null;
  }
}

/**
 * Get all sessions for a campaign
 */
export async function getSessionsByCampaign(campaignName: string): Promise<SessionInfo[]> {
  try {
    const sessions = await backendSql<SessionInfo[]>`
      SELECT * FROM session_info
      WHERE campaign = ${campaignName}
      ORDER BY created_at DESC
    `;
    
    return sessions;
  } catch (error) {
    console.error('Error fetching campaign sessions:', error);
    return [];
  }
}

// ============================================
// CALL INFO
// ============================================

/**
 * Get call history for a session
 */
export async function getCallsBySession(sessionId: string): Promise<CallInfo[]> {
  try {
    const calls = await backendSql<CallInfo[]>`
      SELECT * FROM call_info
      WHERE session_id = ${sessionId}
      ORDER BY called_at DESC
    `;
    
    return calls;
  } catch (error) {
    console.error('Error fetching calls:', error);
    return [];
  }
}

/**
 * Get call history for a phone number
 */
export async function getCallsByPhone(phoneNumber: string): Promise<CallInfo[]> {
  try {
    const [numberRow] = await backendSql<NumbersRow[]>`
      SELECT session_id FROM numbers 
      WHERE phone_number = ${phoneNumber}
    `;
    
    if (!numberRow) {
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

/**
 * Get campaign configuration
 */
export async function getCampaignInfo(campaignName: string): Promise<CampaignInfo | null> {
  try {
    const [result] = await backendSql<CampaignInfo[]>`
      SELECT * FROM campaign_info
      WHERE campaign = ${campaignName}
    `;
    
    return result || null;
  } catch (error) {
    console.error('Error fetching campaign info:', error);
    return null;
  }
}

/**
 * Get all campaigns
 */
export async function getAllCampaigns(): Promise<CampaignInfo[]> {
  try {
    const campaigns = await backendSql<CampaignInfo[]>`
      SELECT * FROM campaign_info
      ORDER BY start DESC
    `;
    
    return campaigns;
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return [];
  }
}

// ============================================
// SESSION OBJECTIVE EVENTS
// ============================================

/**
 * Get objective change timeline for a session
 */
export async function getObjectiveTimeline(sessionId: string): Promise<SessionObjectiveEvent[]> {
  try {
    const events = await backendSql<SessionObjectiveEvent[]>`
      SELECT * FROM session_objective_events
      WHERE session_id = ${sessionId}
      ORDER BY occurred_at DESC
    `;
    
    return events;
  } catch (error) {
    console.error('Error fetching objective timeline:', error);
    return [];
  }
}

// ============================================
// COMBINED/ENRICHED DATA
// ============================================

/**
 * Get complete candidate profile with all interactions
 */
export async function getCandidateProfile(phoneNumber: string): Promise<BackendCandidateProfile | null> {
  try {
    // Get session info
    const session = await getSessionByPhone(phoneNumber);
    if (!session) {
      return null;
    }
    
    // Get all related data in parallel
    const [chatHistory, callHistory, objectiveTimeline, campaignInfo] = await Promise.all([
      getChatHistoryBySession(session.session_id),
      getCallsBySession(session.session_id),
      getObjectiveTimeline(session.session_id),
      session.campaign ? getCampaignInfo(session.campaign) : Promise.resolve(null),
    ]);
    
    return {
      phoneNumber,
      sessionId: session.session_id,
      sessionInfo: session,
      campaignInfo,
      chatHistory,
      callHistory,
      objectiveTimeline,
    };
  } catch (error) {
    console.error('Error fetching candidate profile:', error);
    return null;
  }
}

/**
 * Get campaign statistics from backend data
 */
export async function getCampaignStats(campaignName: string): Promise<BackendCampaignStats | null> {
  try {
    // Get all sessions for campaign
    const sessions = await getSessionsByCampaign(campaignName);
    
    if (sessions.length === 0) {
      return null;
    }
    
    // Count messages and calls for all sessions
    const sessionIds = sessions.map(s => s.session_id);
    
    const [messageCount, callCount] = await Promise.all([
      backendSql<{ count: number }[]>`
        SELECT COUNT(*)::int as count
        FROM chat_history
        WHERE session_id = ANY(${sessionIds})
      `,
      backendSql<{ count: number }[]>`
        SELECT COUNT(*)::int as count
        FROM call_info
        WHERE session_id = ANY(${sessionIds})
      `,
    ]);
    
    // Count sessions by status
    const activeSessions = sessions.filter(s => s.session_status === 'active').length;
    const completedSessions = sessions.filter(s => s.session_status === 'completed').length;
    
    // Aggregate objectives
    const objectivesAchieved: { [key: string]: number } = {};
    sessions.forEach(session => {
      if (session.objectives) {
        Object.entries(session.objectives).forEach(([key, value]) => {
          if (value === true || value === 'completed') {
            objectivesAchieved[key] = (objectivesAchieved[key] || 0) + 1;
          }
        });
      }
    });
    
    // Find latest activity
    const latestActivity = sessions
      .map(s => s.updated_at)
      .filter(Boolean)
      .sort()
      .reverse()[0] || null;
    
    return {
      campaign: campaignName,
      totalSessions: sessions.length,
      activeSessions,
      completedSessions,
      totalMessages: messageCount[0]?.count || 0,
      totalCalls: callCount[0]?.count || 0,
      objectivesAchieved,
      latestActivity,
    };
  } catch (error) {
    console.error('Error fetching campaign stats:', error);
    return null;
  }
}

/**
 * Get live session data for active sessions
 */
export async function getLiveSessions(limit: number = 20): Promise<LiveSessionData[]> {
  try {
    const sessions = await backendSql<SessionInfo[]>`
      SELECT * FROM session_info
      WHERE session_status = 'active'
      ORDER BY updated_at DESC
      LIMIT ${limit}
    `;
    
    // Get phone numbers for these sessions
    const sessionIds = sessions.map(s => s.session_id);
    const numbers = await backendSql<NumbersRow[]>`
      SELECT * FROM numbers
      WHERE session_id = ANY(${sessionIds})
    `;
    
    // Create map of session_id -> phone_number
    const phoneMap = new Map(numbers.map(n => [n.session_id, n.phone_number]));
    
    // Get message and call counts
    const messageCounts = await backendSql<{ session_id: string; count: number }[]>`
      SELECT session_id, COUNT(*)::int as count
      FROM chat_history
      WHERE session_id = ANY(${sessionIds})
      GROUP BY session_id
    `;
    
    const callCounts = await backendSql<{ session_id: string; count: number }[]>`
      SELECT session_id, COUNT(*)::int as count
      FROM call_info
      WHERE session_id = ANY(${sessionIds})
      GROUP BY session_id
    `;
    
    const messageCountMap = new Map(messageCounts.map(m => [m.session_id, m.count]));
    const callCountMap = new Map(callCounts.map(c => [c.session_id, c.count]));
    
    return sessions.map(session => ({
      sessionId: session.session_id,
      phoneNumber: phoneMap.get(session.session_id) || 'Unknown',
      campaign: session.campaign || 'Unknown',
      status: session.session_status,
      lastActivity: session.updated_at,
      messageCount: messageCountMap.get(session.session_id) || 0,
      callCount: callCountMap.get(session.session_id) || 0,
      objectives: session.objectives || {},
    }));
  } catch (error) {
    console.error('Error fetching live sessions:', error);
    return [];
  }
}

// ============================================
// PHONE NUMBER HELPERS
// ============================================

/**
 * Get phone number for a session
 */
export async function getPhoneNumber(sessionId: string): Promise<string | null> {
  try {
    const [result] = await backendSql<NumbersRow[]>`
      SELECT phone_number FROM numbers
      WHERE session_id = ${sessionId}
    `;
    
    return result?.phone_number || null;
  } catch (error) {
    console.error('Error fetching phone number:', error);
    return null;
  }
}

/**
 * Check if phone number has any history
 */
export async function hasHistory(phoneNumber: string): Promise<boolean> {
  try {
    const [result] = await backendSql<{ exists: boolean }[]>`
      SELECT EXISTS(
        SELECT 1 FROM numbers WHERE phone_number = ${phoneNumber}
      ) as exists
    `;
    
    return result?.exists || false;
  } catch (error) {
    console.error('Error checking history:', error);
    return false;
  }
}


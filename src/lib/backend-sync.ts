/**
 * Backend-Frontend Sync
 * 
 * Syncs data from backend (real-time interactions) to frontend (candidate management)
 * - Updates candidate statuses based on backend objectives
 * - Syncs campaign statistics
 * - Reflects call/chat activity in frontend
 */

import {
  getSessionsByCampaign,
  getPhoneNumber,
  getChatHistoryBySession,
  getCallsBySession,
} from './backend-api';
import {
  updateCandidate,
  updateCampaign,
  addCandidateNote,
} from './supabase-storage';
import type { Campaign } from '@/polymet/data/campaigns-data';
import type { Job, Candidate } from '@/polymet/data/jobs-data';
import { getBaseCampaignName } from './campaign-webhook';

export interface SyncResult {
  candidatesUpdated: number;
  notesAdded: number;
  campaignsUpdated: number;
  errors: string[];
}

/**
 * Sync backend objectives to frontend candidate statuses
 */
export async function syncCampaignToFrontend(
  campaignId: string,
  jobId: string,
  frontendCandidates: Candidate[],
  backendCampaignId?: string
): Promise<SyncResult> {
  const result: SyncResult = {
    candidatesUpdated: 0,
    notesAdded: 0,
    campaignsUpdated: 0,
    errors: [],
  };
  
  try {
    // Use backend campaign ID if provided, otherwise try to extract base name
    const campaignToQuery = backendCampaignId || getBaseCampaignName(campaignId);
    
    console.log('🔄 Syncing campaign:', campaignToQuery);
    
    // Get all backend sessions for this campaign
    const sessions = await getSessionsByCampaign(campaignToQuery);
    
    console.log(`📊 Syncing ${sessions.length} sessions for campaign: ${campaignToQuery}`);
    
    for (const session of sessions) {
      try {
        // Get phone number for this session
        const phoneNumber = await getPhoneNumber(session.session_id);
        if (!phoneNumber) continue;
        
        // Find matching frontend candidate
        const candidate = frontendCandidates.find(c => 
          c.phone.replace(/[^0-9]/g, '') === phoneNumber.replace(/[^0-9]/g, '')
        );
        
        if (!candidate) {
          console.log(`⚠️  No frontend candidate found for ${phoneNumber}`);
          continue;
        }
        
        // Determine new status based on backend objectives
        const newStatus = determineStatusFromObjectives(session.objectives);
        
        if (newStatus && newStatus !== candidate.status) {
          await updateCandidate(jobId, candidate.id, { status: newStatus });
          result.candidatesUpdated++;
          console.log(`✅ Updated ${candidate.name} status: ${candidate.status} → ${newStatus}`);
        }
        
        // Add notes about backend activity
        const activityNote = await generateActivityNote(session.session_id);
        if (activityNote) {
          await addCandidateNote(jobId, candidate.id, activityNote);
          result.notesAdded++;
        }
        
      } catch (error) {
        const errorMsg = `Failed to sync candidate ${session.session_id}: ${error}`;
        console.error(errorMsg);
        result.errors.push(errorMsg);
      }
    }
    
    console.log(`✅ Sync complete: ${result.candidatesUpdated} candidates updated, ${result.notesAdded} notes added`);
    
  } catch (error) {
    const errorMsg = `Sync failed: ${error}`;
    console.error(errorMsg);
    result.errors.push(errorMsg);
  }
  
  return result;
}

/**
 * Determine candidate status based on backend objectives
 */
function determineStatusFromObjectives(objectives: any): Candidate['status'] | null {
  if (!objectives) return null;
  
  // Mapping logic: backend objectives → frontend status
  // Customize based on your objective definitions
  
  if (objectives.interested === true) {
    return 'interested';
  }
  
  if (objectives.started_work === true || objectives.hired === true) {
    return 'started-work';
  }
  
  if (objectives.rejected === true || objectives.not_interested === true) {
    return 'rejected';
  }
  
  if (objectives.interview_scheduled === true) {
    return 'interview';
  }
  
  // If any objective is set, they've been contacted
  if (Object.keys(objectives).some(key => objectives[key] !== null)) {
    return 'interested'; // At least engaged
  }
  
  return null; // No status change
}

/**
 * Generate activity note from backend data
 */
async function generateActivityNote(sessionId: string): Promise<{
  id: string;
  text: string;
  timestamp: string;
  author: string;
} | null> {
  try {
    // Get chat and call history
    const [chats, calls] = await Promise.all([
      getChatHistoryBySession(sessionId),
      getCallsBySession(sessionId),
    ]);
    
    if (chats.length === 0 && calls.length === 0) {
      return null;
    }
    
    const parts: string[] = [];
    
    if (chats.length > 0) {
      parts.push(`📱 ${chats.length} WhatsApp messages exchanged`);
      const lastChat = chats[chats.length - 1];
      if (lastChat.text) {
        parts.push(`Last message: "${lastChat.text.substring(0, 100)}..."`);
      }
    }
    
    if (calls.length > 0) {
      parts.push(`📞 ${calls.length} calls made`);
      const lastCall = calls[0]; // Calls are sorted DESC
      if (lastCall.transcript) {
        parts.push(`Call duration: ${lastCall.duration || 'N/A'}`);
        if (lastCall.analysis) {
          parts.push(`AI Analysis: ${JSON.stringify(lastCall.analysis).substring(0, 100)}...`);
        }
      }
    }
    
    return {
      id: `sync_${Date.now()}`,
      text: parts.join('\n'),
      timestamp: new Date().toISOString(),
      author: 'System (Backend Sync)',
    };
    
  } catch (error) {
    console.error('Failed to generate activity note:', error);
    return null;
  }
}

/**
 * Get real-time campaign statistics for display
 */
export async function getCampaignLiveStats(campaignId: string, backendCampaignId?: string): Promise<{
  totalContacted: number;
  activeConversations: number;
  messagesSent: number;
  callsMade: number;
  objectivesAchieved: { [key: string]: number };
  lastActivity: string | null;
}> {
  try {
    const campaignToQuery = backendCampaignId || getBaseCampaignName(campaignId);
    const sessions = await getSessionsByCampaign(campaignToQuery);
    
    let totalMessages = 0;
    let totalCalls = 0;
    const objectiveCounts: { [key: string]: number } = {};
    const activityTimes: string[] = [];
    
    for (const session of sessions) {
      // Count messages
      const chats = await getChatHistoryBySession(session.session_id);
      totalMessages += chats.length;
      
      // Count calls
      const calls = await getCallsBySession(session.session_id);
      totalCalls += calls.length;
      
      // Track objectives
      if (session.objectives) {
        Object.entries(session.objectives).forEach(([key, value]) => {
          if (value === true || value === 'completed' || value) {
            objectiveCounts[key] = (objectiveCounts[key] || 0) + 1;
          }
        });
      }
      
      // Track activity
      if (session.updated_at) {
        activityTimes.push(session.updated_at);
      }
    }
    
    const activeConversations = sessions.filter(
      s => s.session_status === 'active'
    ).length;
    
    const lastActivity = activityTimes.length > 0
      ? activityTimes.sort().reverse()[0]
      : null;
    
    return {
      totalContacted: sessions.length,
      activeConversations,
      messagesSent: totalMessages,
      callsMade: totalCalls,
      objectivesAchieved: objectiveCounts,
      lastActivity,
    };
    
  } catch (error) {
    console.error('Failed to get live stats:', error);
    return {
      totalContacted: 0,
      activeConversations: 0,
      messagesSent: 0,
      callsMade: 0,
      objectivesAchieved: {},
      lastActivity: null,
    };
  }
}

/**
 * Auto-sync: Run periodically to keep frontend in sync with backend
 */
export async function autoSync(
  campaigns: Campaign[],
  jobs: Job[]
): Promise<SyncResult> {
  const totalResult: SyncResult = {
    candidatesUpdated: 0,
    notesAdded: 0,
    campaignsUpdated: 0,
    errors: [],
  };
  
  console.log('🔄 Starting auto-sync...');
  
  for (const campaign of campaigns) {
    if (campaign.status !== 'active') continue;
    
    try {
      // Find the job for this campaign
      const job = jobs.find(j => j.id === campaign.jobId);
      if (!job) continue;
      
      // Sync this campaign
      const result = await syncCampaignToFrontend(
        campaign.id,
        campaign.jobId,
        job.candidates
      );
      
      // Aggregate results
      totalResult.candidatesUpdated += result.candidatesUpdated;
      totalResult.notesAdded += result.notesAdded;
      totalResult.errors.push(...result.errors);
      
      // Update campaign stats
      const liveStats = await getCampaignLiveStats(campaign.id);
      if (liveStats.messagesSent > 0 || liveStats.callsMade > 0) {
        await updateCampaign(campaign.id, {
          totalCandidates: liveStats.totalContacted,
          responseRate: liveStats.activeConversations > 0
            ? Math.round((liveStats.activeConversations / liveStats.totalContacted) * 100)
            : campaign.responseRate,
        });
        totalResult.campaignsUpdated++;
      }
      
    } catch (error) {
      console.error(`Failed to sync campaign ${campaign.id}:`, error);
      totalResult.errors.push(`Campaign ${campaign.name}: ${error}`);
    }
  }
  
  console.log('✅ Auto-sync complete:', totalResult);
  return totalResult;
}

/**
 * Get enriched candidate data (frontend + backend)
 */
export async function getEnrichedCandidate(
  candidate: Candidate,
  jobId: string
): Promise<Candidate & {
  backendData?: {
    messageCount: number;
    callCount: number;
    lastActivity: string | null;
    objectives: any;
  };
}> {
  try {
    // Try to find backend session for this phone number
    const sessions = await getSessionsByCampaign(''); // Would need campaign context
    // This is a simplified version - in real implementation,
    // you'd need to pass campaign context
    
    return candidate;
  } catch (error) {
    console.error('Failed to enrich candidate:', error);
    return candidate;
  }
}


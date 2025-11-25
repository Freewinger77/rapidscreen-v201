/**
 * Calculate Response Rate from Backend
 * 
 * 100% if candidate responded
 * 0% if session active but no response
 */

import { getSessionsByCampaign } from './backend-api';

export async function calculateResponseRate(campaignName: string): Promise<number> {
  try {
    if (!campaignName) return 0;

    const sessions = await getSessionsByCampaign(campaignName);
    
    if (sessions.length === 0) return 0;

    let respondedCount = 0;

    for (const session of sessions) {
      // Check if candidate has responded
      // Response = any objective is set OR session is not just 'active' with no data
      const hasResponded = session.objectives && Object.keys(session.objectives).some(
        key => session.objectives[key] !== null && session.objectives[key] !== undefined
      );

      if (hasResponded) {
        respondedCount++;
      }
    }

    const responseRate = (respondedCount / sessions.length) * 100;
    return Math.round(responseRate);

  } catch (error) {
    console.error('Error calculating response rate:', error);
    return 0;
  }
}


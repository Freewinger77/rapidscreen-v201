/**
 * Smart Kanban Sync
 * 
 * Syncs backend objectives to job kanban while preserving manual moves
 */

import { getSessionByPhone } from './backend-api';
import { updateCandidate } from './supabase-storage';
import type { Candidate } from '@/polymet/data/jobs-data';

// Track manually moved candidates (in-memory for now)
const manuallyMovedCandidates = new Set<string>();

export function markAsManuallyMoved(candidateId: string) {
  manuallyMovedCandidates.add(candidateId);
  console.log(`🖐️ Candidate ${candidateId} manually moved - will not auto-sync`);
}

export function isManuallyMoved(candidateId: string): boolean {
  return manuallyMovedCandidates.has(candidateId);
}

/**
 * Determine kanban status from backend objectives
 */
function getStatusFromObjectives(objectives: any): Candidate['status'] | null {
  if (!objectives) return null;

  // Priority order (most advanced status first)
  if (objectives.started_work === true || objectives.hired === true) {
    return 'started-work';
  }

  if (objectives.interview_scheduled === true) {
    return 'interview';
  }

  if (objectives.interested === true) {
    return 'interested';
  }

  if (objectives.rejected === true || objectives.not_interested === true) {
    return 'rejected';
  }

  // If any objective is set, they've been contacted
  const hasAnyObjective = Object.keys(objectives).some(
    key => objectives[key] !== null && objectives[key] !== undefined
  );

  if (hasAnyObjective) {
    // Don't move if already somewhere else, they've been engaged
    return null;
  }

  return null;
}

/**
 * Sync a single candidate from backend to kanban
 */
export async function syncCandidateToKanban(
  jobId: string,
  candidate: Candidate
): Promise<boolean> {
  try {
    // Skip if manually moved (in-memory check)
    if (isManuallyMoved(candidate.id)) {
      console.log(`⏭️  Skipping ${candidate.name} - manually moved (in-memory)`);
      return false;
    }

    // Skip if database says manual_override
    if ((candidate as any).manual_override === true) {
      console.log(`⏭️  Skipping ${candidate.name} - manual override (database)`);
      return false;
    }

    // Get backend session data
    const session = await getSessionByPhone(candidate.phone);
    if (!session || !session.objectives) {
      return false;
    }

    // Determine new status from objectives
    const newStatus = getStatusFromObjectives(session.objectives);
    if (!newStatus || newStatus === candidate.status) {
      return false;
    }

    console.log(`🔄 Auto-syncing ${candidate.name}: ${candidate.status} → ${newStatus}`);

    // Update candidate status
    await updateCandidate(jobId, candidate.id, { status: newStatus });

    return true;
  } catch (error) {
    console.error(`Failed to sync candidate ${candidate.name}:`, error);
    return false;
  }
}

/**
 * Sync all candidates for a job
 */
export async function syncJobCandidates(
  jobId: string,
  candidates: Candidate[]
): Promise<{ updated: number; skipped: number }> {
  let updated = 0;
  let skipped = 0;

  for (const candidate of candidates) {
    const wasUpdated = await syncCandidateToKanban(jobId, candidate);
    if (wasUpdated) {
      updated++;
    } else {
      skipped++;
    }
  }

  if (updated > 0) {
    console.log(`✅ Auto-sync: ${updated} candidates moved, ${skipped} skipped`);
  }

  return { updated, skipped };
}


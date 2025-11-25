/**
 * Auto-Sync Hook
 * 
 * Automatically syncs backend data to frontend at regular intervals
 * Use this in Dashboard or main app layout to keep data fresh
 */

import { useEffect, useCallback } from 'react';
import { autoSync } from '@/lib/backend-sync';
import { loadJobs, loadCampaigns } from '@/lib/supabase-storage';

export function useAutoSync(intervalMs: number = 30000) {
  const runSync = useCallback(async () => {
    // TEMPORARILY DISABLED - candidates were being moved back
    console.log('🔄 Auto-sync: DISABLED (to prevent unwanted moves)');
    return;
    
    /* Original code - re-enable later
    try {
      const [jobs, campaigns] = await Promise.all([
        loadJobs(),
        loadCampaigns(),
      ]);
      
      const result = await autoSync(campaigns, jobs);
      
      if (result.candidatesUpdated > 0 || result.notesAdded > 0) {
        console.log(`🔄 Auto-sync completed:`, {
          candidatesUpdated: result.candidatesUpdated,
          notesAdded: result.notesAdded,
          campaignsUpdated: result.campaignsUpdated,
        });
      }
      
      if (result.errors.length > 0) {
        console.error('Auto-sync errors:', result.errors);
      }
    } catch (error) {
      console.error('Auto-sync failed:', error);
    }
    */
  }, []);

  useEffect(() => {
    // Run immediately on mount
    runSync();
    
    // Then run periodically
    const interval = setInterval(runSync, intervalMs);
    
    return () => clearInterval(interval);
  }, [intervalMs, runSync]);
}


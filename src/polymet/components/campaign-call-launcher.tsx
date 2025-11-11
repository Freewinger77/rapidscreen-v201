/**
 * Campaign Call Launcher Component
 * Allows launching automated calls for campaign candidates using Retell AI
 */

import { useState, useEffect } from 'react';
import { 
  PhoneIcon, 
  PlayIcon, 
  PauseIcon,
  StopCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertCircleIcon,
  UsersIcon,
  ClockIcon,
  RefreshCwIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { retellService } from '@/lib/retell-client';
import { supabase } from '@/lib/supabase';
import type { Campaign } from '@/polymet/data/campaigns-data';

interface CampaignCallLauncherProps {
  campaign: Campaign;
  jobId: string;
}

interface CallStats {
  totalCandidates: number;
  notCalled: number;
  inProgress: number;
  completed: number;
  failed: number;
  interested: number;
  available: number;
}

interface ActiveCall {
  id: string;
  candidateName: string;
  phoneNumber: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  duration?: number;
  startedAt?: string;
}

export function CampaignCallLauncher({ campaign, jobId }: CampaignCallLauncherProps) {
  const [isLaunching, setIsLaunching] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [batchId, setBatchId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState<CallStats>({
    totalCandidates: campaign.totalCandidates || 0,
    notCalled: campaign.totalCandidates || 0,
    inProgress: 0,
    completed: 0,
    failed: 0,
    interested: 0,
    available: 0,
  });
  const [activeCalls, setActiveCalls] = useState<ActiveCall[]>([]);
  const [agentReady, setAgentReady] = useState(false);
  const [agentId, setAgentId] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if Retell agent exists for this campaign
  useEffect(() => {
    async function checkAgent() {
      const { data, error } = await supabase
        .from('campaign_retell_agents')
        .select('retell_agent_id')
        .eq('campaign_id', campaign.id)
        .single();

      if (data?.retell_agent_id) {
        setAgentId(data.retell_agent_id);
        setAgentReady(true);
      }
    }
    checkAgent();
  }, [campaign.id]);

  // Load call statistics
  useEffect(() => {
    async function loadStats() {
      // Get call counts
      const { data: calls } = await supabase
        .from('retell_calls')
        .select('call_status')
        .eq('campaign_id', campaign.id);

      if (calls) {
        const newStats = { ...stats };
        newStats.completed = calls.filter(c => c.call_status === 'completed').length;
        newStats.failed = calls.filter(c => c.call_status === 'failed').length;
        newStats.inProgress = calls.filter(c => c.call_status === 'in_progress').length;
        newStats.notCalled = newStats.totalCandidates - (newStats.completed + newStats.failed + newStats.inProgress);
        setStats(newStats);
      }

      // Get analysis results
      const { data: analysis } = await supabase
        .from('retell_call_analysis')
        .select('interested, available_to_work')
        .eq('campaign_id', campaign.id);

      if (analysis) {
        setStats(prev => ({
          ...prev,
          interested: analysis.filter(a => a.interested).length,
          available: analysis.filter(a => a.available_to_work).length,
        }));
      }
    }
    loadStats();
  }, [campaign.id, isLaunching]);

  // Subscribe to real-time call updates
  useEffect(() => {
    const subscription = supabase
      .channel(`campaign-calls-${campaign.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'retell_calls',
        filter: `campaign_id=eq.${campaign.id}`
      }, (payload) => {
        // Update stats based on call status changes
        if (payload.eventType === 'UPDATE') {
          loadStats();
          updateActiveCallStatus(payload.new);
        } else if (payload.eventType === 'INSERT') {
          addActiveCall(payload.new);
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [campaign.id]);

  const loadStats = async () => {
    // Reload statistics
    const { data: calls } = await supabase
      .from('retell_calls')
      .select('*')
      .eq('campaign_id', campaign.id);

    if (calls) {
      const newStats = {
        totalCandidates: campaign.totalCandidates || 0,
        completed: calls.filter(c => c.call_status === 'completed').length,
        failed: calls.filter(c => c.call_status === 'failed').length,
        inProgress: calls.filter(c => c.call_status === 'in_progress').length,
        notCalled: 0,
        interested: 0,
        available: 0,
      };
      newStats.notCalled = newStats.totalCandidates - (newStats.completed + newStats.failed + newStats.inProgress);
      
      setStats(newStats);
      setProgress((newStats.completed + newStats.failed) / newStats.totalCandidates * 100);
    }
  };

  const updateActiveCallStatus = (call: any) => {
    setActiveCalls(prev => prev.map(c => 
      c.id === call.retell_call_id 
        ? { ...c, status: call.call_status, duration: call.duration_seconds }
        : c
    ));
  };

  const addActiveCall = async (call: any) => {
    // Get candidate details
    const { data: candidate } = await supabase
      .from('campaign_candidates')
      .select('forename, surname, tel_mobile')
      .eq('id', call.candidate_id)
      .single();

    if (candidate) {
      setActiveCalls(prev => [...prev, {
        id: call.retell_call_id,
        candidateName: `${candidate.forename} ${candidate.surname}`,
        phoneNumber: candidate.tel_mobile,
        status: call.call_status,
        startedAt: call.started_at,
      }]);
    }
  };

  const createAgent = async () => {
    try {
      setError(null);
      
      // Get job details
      const { data: job } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (!job) {
        throw new Error('Job not found');
      }

      // Create Retell agent
      const newAgentId = await retellService.createCampaignAgent(campaign, job);
      setAgentId(newAgentId);
      setAgentReady(true);
      
      return newAgentId;
    } catch (error) {
      console.error('Error creating agent:', error);
      setError('Failed to create AI agent. Please check your Retell API configuration.');
      return null;
    }
  };

  const handleLaunchCalls = async () => {
    setShowConfirmDialog(true);
  };

  const confirmLaunchCalls = async () => {
    setShowConfirmDialog(false);
    setIsLaunching(true);
    setError(null);

    try {
      // Check for duplicate contacts before launching
      const { warnAboutDuplicates } = await import('@/polymet/data/duplicate-prevention');
      const shouldProceed = await warnAboutDuplicates(campaign.id);
      
      if (!shouldProceed) {
        console.log('⚠️ User cancelled due to duplicates');
        setIsLaunching(false);
        return;
      }
      
      // Create agent if not exists
      let currentAgentId = agentId;
      if (!currentAgentId) {
        currentAgentId = await createAgent();
        if (!currentAgentId) {
          throw new Error('Failed to create agent');
        }
      }

      // Get candidates to call
      const { data: candidates } = await supabase
        .from('campaign_candidates')
        .select('id, tel_mobile')
        .eq('campaign_id', campaign.id)
        .eq('call_status', 'not_called')
        .limit(100); // Limit to 100 calls per batch

      if (!candidates || candidates.length === 0) {
        setError('No candidates available to call');
        setIsLaunching(false);
        return;
      }

      // Launch batch calls
      const newBatchId = await retellService.launchBatchCalls(
        campaign.id,
        candidates.map(c => ({ id: c.id, phone: c.tel_mobile })),
        currentAgentId,
        {
          delayBetweenCalls: 3000, // 3 seconds between calls
          maxConcurrent: 5, // Max 5 concurrent calls
        }
      );

      setBatchId(newBatchId);
      
      // Start monitoring progress
      monitorBatchProgress(newBatchId);
      
    } catch (error: any) {
      console.error('❌ Error launching calls:', error);
      console.error('Error details:', {
        message: error?.message,
        stack: error?.stack,
        full: JSON.stringify(error, null, 2)
      });
      setError(`Failed to launch calls: ${error?.message || 'Unknown error'}. Check console for details.`);
      setIsLaunching(false);
    }
  };

  const monitorBatchProgress = async (batchId: string) => {
    const interval = setInterval(async () => {
      const { data: batch } = await supabase
        .from('retell_batch_calls')
        .select('*')
        .eq('id', batchId)
        .single();

      if (batch) {
        const progressPercent = (batch.completed_calls / batch.total_candidates) * 100;
        setProgress(progressPercent);

        if (batch.status === 'completed') {
          clearInterval(interval);
          setIsLaunching(false);
          await loadStats();
        }
      }
    }, 2000); // Check every 2 seconds
  };

  const handlePauseCalls = async () => {
    if (!batchId) return;
    
    console.log(`${isPaused ? '▶️' : '⏸️'} ${isPaused ? 'Resuming' : 'Pausing'} calls...`);
    
    if (!isPaused) {
      // Pause: Cancel the batch
      const success = await retellService.cancelBatchCalls(batchId);
      if (success) {
        setIsPaused(true);
        setIsLaunching(false);
        alert('⏸️ Calling paused.\n\nPending calls cancelled.\nIn-progress calls will complete naturally.');
      }
    } else {
      // Resume: Would need to start a new batch
      alert('To resume, click "Launch Calls" again to start a new batch.');
    }
  };

  const handleStopCampaign = async () => {
    if (!confirm('⚠️ Stop ALL calling for this campaign?\n\nThis will cancel all pending calls.')) {
      return;
    }
    
    const success = await retellService.stopCampaignCalling(campaign.id);
    
    if (success) {
      setIsLaunching(false);
      setIsPaused(false);
      setBatchId(null);
      alert('🛑 Campaign calling stopped.\n\nAll pending calls cancelled.\nYou can restart by clicking "Launch Calls" again.');
      
      // Refresh stats
      await loadStats();
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCallStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
      case 'in_progress':
        return <PhoneIcon className="h-4 w-4 text-blue-500 animate-pulse" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Candidates</p>
                <p className="text-2xl font-bold">{stats.totalCandidates}</p>
              </div>
              <UsersIcon className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Not Called</p>
                <p className="text-2xl font-bold">{stats.notCalled}</p>
              </div>
              <ClockIcon className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Interested</p>
                <p className="text-2xl font-bold text-primary">{stats.interested}</p>
              </div>
              <AlertCircleIcon className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Call Control</CardTitle>
          <CardDescription>
            Launch automated calls to campaign candidates using AI voice agents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircleIcon className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!agentReady && (
            <Alert>
              <AlertCircleIcon className="h-4 w-4" />
              <AlertDescription>
                AI agent will be created automatically when you launch calls
              </AlertDescription>
            </Alert>
          )}

          {isLaunching && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Call Progress</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(progress)}% Complete
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <div className="flex gap-2">
            {!isLaunching ? (
              <Button 
                onClick={handleLaunchCalls}
                disabled={stats.notCalled === 0}
                className="flex-1"
              >
                <PlayIcon className="mr-2 h-4 w-4" />
                Launch Calls ({stats.notCalled} candidates)
              </Button>
            ) : (
              <>
                <Button
                  onClick={handlePauseCalls}
                  variant="outline"
                  className="flex-1"
                >
                  {isPaused ? (
                    <>
                      <PlayIcon className="mr-2 h-4 w-4" />
                      Resume
                    </>
                  ) : (
                    <>
                      <PauseIcon className="mr-2 h-4 w-4" />
                      Pause Batch
                    </>
                  )}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleStopCampaign}
                  className="flex-1"
                >
                  <StopCircleIcon className="mr-2 h-4 w-4" />
                  Stop All
                </Button>
                <Button
                  variant="outline"
                  onClick={loadStats}
                >
                  <RefreshCwIcon className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Active Calls Monitor */}
      {activeCalls.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Calls</CardTitle>
            <CardDescription>
              Real-time monitoring of ongoing calls
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {activeCalls.map((call) => (
                  <div
                    key={call.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      {getCallStatusIcon(call.status)}
                      <div>
                        <p className="font-medium">{call.candidateName}</p>
                        <p className="text-sm text-muted-foreground">
                          {call.phoneNumber}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={
                        call.status === 'completed' ? 'success' :
                        call.status === 'failed' ? 'destructive' :
                        call.status === 'in_progress' ? 'default' :
                        'secondary'
                      }>
                        {call.status.replace('_', ' ')}
                      </Badge>
                      {call.duration && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatDuration(call.duration)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Launch Campaign Calls</DialogTitle>
            <DialogDescription>
              Are you ready to start automated calls to {stats.notCalled} candidates?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Candidates to call:</span>
              <Badge variant="secondary">{stats.notCalled}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Estimated time:</span>
              <span className="text-sm text-muted-foreground">
                ~{Math.round((stats.notCalled * 5) / 60)} minutes
              </span>
            </div>
            <Alert>
              <AlertCircleIcon className="h-4 w-4" />
              <AlertDescription>
                Calls will be made automatically using AI voice agents. 
                Make sure your Retell AI account has sufficient credits.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmLaunchCalls}>
              <PhoneIcon className="mr-2 h-4 w-4" />
              Start Calling
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

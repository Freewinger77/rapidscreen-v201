import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeftIcon, DownloadIcon, RefreshCwIcon, StopCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CampaignStatsCards } from "@/polymet/components/campaign-stats-cards";
import { CandidatesTable } from "@/polymet/components/candidates-table";
import { CandidateDetailDialog } from "@/polymet/components/candidate-detail-dialog";
import { type Campaign, type CampaignCandidate } from "@/polymet/data/campaigns-data";
import { loadCampaigns, updateCampaign } from "@/lib/supabase-storage";
import { stopCampaign } from "@/lib/backend-api";
import { toast } from "sonner";

export function CampaignDetailsPage() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [selectedCandidate, setSelectedCandidate] =
    useState<CampaignCandidate | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [showStopDialog, setShowStopDialog] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaign();
  }, [campaignId]);

  async function fetchCampaign() {
    try {
      setLoading(true);
      const campaigns = await loadCampaigns();
      const foundCampaign = campaigns.find((c) => c.id === campaignId);
      setCampaign(foundCampaign || null);
      
      if (!foundCampaign && campaignId) {
        toast.error('Campaign not found');
      }
    } catch (err) {
      console.error('Failed to load campaign:', err);
      toast.error('Failed to load campaign');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading campaign...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Campaign not found</p>
      </div>
    );
  }

  const candidates = campaign.candidates || [];

  // Calculate stats
  const notCalledCount = candidates.filter(
    (c) => c.callStatus === "not_called"
  ).length;
  const noAnswerCount = candidates.filter(
    (c) => c.callStatus === "no_answer"
  ).length;
  const voicemailCount = candidates.filter(
    (c) => c.callStatus === "voicemail"
  ).length;

  const availableCount = candidates.filter(
    (c) => c.availableToWork === true
  ).length;
  const interestedCount = candidates.filter(
    (c) => c.interested === true
  ).length;
  const knowRefereeCount = candidates.filter(
    (c) => c.knowReferee === true
  ).length;

  const handleViewTranscript = (candidate: CampaignCandidate) => {
    setSelectedCandidate(candidate);
    setDetailDialogOpen(true);
  };

  const handleDeleteCandidate = (candidateId: string) => {
    console.log("Delete candidate:", candidateId);
    // In a real app, this would update the data
  };

  const handleStopCampaign = async () => {
    if (!campaign) return;
    
    try {
      setStopping(true);
      console.log('🛑 Stopping campaign:', campaign.id, campaign.name);
      
      // Get backend campaign ID
      const backendId = (campaign as any).backendCampaignId;
      console.log('Backend campaign ID:', backendId);
      
      // Update backend sessions to 'complete'
      if (backendId) {
        console.log('Updating backend sessions...');
        const result = await stopCampaign(backendId);
        if (!result.success) {
          throw new Error(result.error || 'Failed to stop campaign');
        }
        console.log('✅ Backend sessions updated to complete');
      }
      
      // Update frontend campaign status to 'completed' (stopped not yet in DB constraint)
      console.log('Updating frontend campaign status...');
      await updateCampaign(campaign.id, { status: 'completed' });
      console.log('✅ Frontend campaign status updated to completed');
      
      toast.success('Campaign stopped successfully');
      setShowStopDialog(false);
      
      // Wait a moment for database to propagate
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Redirect to campaigns page with force refresh
      console.log('Redirecting to campaigns page...');
      navigate('/campaigns', { replace: true });
      
      // Force a page reload to ensure fresh data
      window.location.href = '/campaigns';
    } catch (error) {
      console.error('❌ Error stopping campaign:', error);
      toast.error('Failed to stop campaign');
    } finally {
      setStopping(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/campaigns">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Manage calls</h1>
              <p className="text-muted-foreground mt-1">
                Manage your candidate pool and launch targeted calling
                campaigns.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {campaign.status === 'active' && (
              <Button
                variant="outline"
                className="gap-2 bg-background border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
                onClick={() => setShowStopDialog(true)}
              >
                <StopCircleIcon className="w-4 h-4" />
                Stop Campaign
              </Button>
            )}
            <Button
              variant="outline"
              className="gap-2 bg-background border-border"
            >
              <DownloadIcon className="w-4 h-4" />
              Export
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="bg-background border-border"
              onClick={fetchCampaign}
            >
              <RefreshCwIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Stats Badges */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
            <div className="w-2 h-2 rounded-full bg-primary" />

            <span className="text-sm font-medium">
              {availableCount} Available
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
            <div className="w-2 h-2 rounded-full bg-chart-2" />

            <span className="text-sm font-medium">
              {interestedCount} Interested
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
            <div className="w-2 h-2 rounded-full bg-chart-5" />

            <span className="text-sm font-medium">
              {knowRefereeCount} Know Referee
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <CampaignStatsCards
          notCalled={notCalledCount}
          noAnswer={noAnswerCount}
          voicemail={voicemailCount}
        />

        {/* Candidates Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Candidates</h2>
          <CandidatesTable
            candidates={candidates}
            campaignName={(campaign as any).backendCampaignId || campaign.name}
            onViewTranscript={handleViewTranscript}
            onDeleteCandidate={handleDeleteCandidate}
          />
        </div>
      </div>

      {/* Candidate Detail Dialog */}
      <CandidateDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        candidate={selectedCandidate}
        defaultTab="timeline"
        visibleTabs={["timeline", "conversation"]}
      />

      {/* Stop Campaign Confirmation Dialog */}
      <AlertDialog open={showStopDialog} onOpenChange={setShowStopDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Stop Campaign?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p className="font-medium text-foreground">
                ⚠️ This action is irreversible!
              </p>
              <p>
                Stopping this campaign will:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Mark all sessions as 'complete' in the backend</li>
                <li>Stop all AI follow-ups for this campaign</li>
                <li>Set campaign status to 'stopped'</li>
              </ul>
              <p className="font-medium text-foreground">
                Only do this if:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Job targets have been met</li>
                <li>You no longer require AI follow-up</li>
              </ul>
              <p className="text-muted-foreground italic mt-2">
                Note: To start this campaign again, you will need to relaunch it as a new campaign.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStopCampaign}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={stopping}
            >
              {stopping ? 'Stopping...' : 'Stop Campaign'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

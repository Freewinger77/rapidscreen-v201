import { useState, useEffect } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { ArrowLeftIcon, DownloadIcon, RefreshCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CampaignStatsCards } from "@/polymet/components/campaign-stats-cards";
import { DynamicCandidatesTable } from "@/polymet/components/dynamic-candidates-table";
import { CandidateDetailDialog } from "@/polymet/components/candidate-detail-dialog";
import { CandidateCallDetailsSidebar } from "@/polymet/components/candidate-call-details-sidebar";
import { CampaignCallLauncher } from "@/polymet/components/campaign-call-launcher";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { loadCampaigns } from "@/polymet/data/supabase-storage";
import { warnAboutDuplicates } from "@/polymet/data/duplicate-prevention";
import {
  campaignsData,
  type Campaign,
  type CampaignCandidate,
} from "@/polymet/data/campaigns-data";

export function CampaignDetailsPage() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const [searchParams] = useSearchParams();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] =
    useState<CampaignCandidate | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [callDetailsCandidateId, setCallDetailsCandidateId] = useState<string | null>(null);
  const [callDetailsCandidateName, setCallDetailsCandidateName] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>("candidates");

  // Load campaign from Supabase
  useEffect(() => {
    async function fetchCampaign() {
      try {
        const campaigns = await loadCampaigns();
        const found = campaigns.find((c) => c.id === campaignId);
        
        if (found) {
          setCampaign(found);
          
          // Check for auto-launch parameter
          const autoLaunch = searchParams.get('autoLaunch');
          if (autoLaunch === 'true') {
            // Auto-switch to calling tab
            setActiveTab('calling');
            
            // Check for duplicates before auto-launching
            const shouldProceed = await warnAboutDuplicates(campaignId!);
            if (shouldProceed) {
              console.log('🚀 Auto-launching campaign calls...');
              // The CampaignCallLauncher will handle the actual launch
            }
          }
        } else {
          // Fallback to mock data
          const mockCampaign = campaignsData.find((c) => c.id === campaignId);
          setCampaign(mockCampaign || null);
        }
      } catch (error) {
        console.error('Error loading campaign:', error);
        // Fallback to mock data
        const mockCampaign = campaignsData.find((c) => c.id === campaignId);
        setCampaign(mockCampaign || null);
      }
      setLoading(false);
    }
    fetchCampaign();
  }, [campaignId, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-6 space-y-6">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div>
                <Skeleton className="h-9 w-64 mb-2" />
                <Skeleton className="h-5 w-96" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-10" />
            </div>
          </div>

          {/* Badges Skeleton */}
          <div className="flex items-center gap-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-9 w-32 rounded-full" />
            ))}
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 rounded-lg border border-border bg-card">
                <Skeleton className="h-5 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>

          {/* Table Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-7 w-40" />
            <div className="rounded-lg border border-border">
              <div className="p-4 space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </div>
          </div>
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
    // Open call details sidebar instead of old dialog
    setCallDetailsCandidateId(candidate.id);
    setCallDetailsCandidateName(`${candidate.forename} ${candidate.surname}`);
  };

  const handleDeleteCandidate = (candidateId: string) => {
    console.log("Delete candidate:", candidateId);
    // In a real app, this would update the data
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

        {/* Tabs for Campaign Management */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="candidates">Candidates</TabsTrigger>
            <TabsTrigger value="calling">🤖 AI Calling</TabsTrigger>
          </TabsList>

          <TabsContent value="candidates" className="space-y-4 mt-6">
            <h2 className="text-xl font-semibold">Candidates</h2>
            <DynamicCandidatesTable
              candidates={candidates}
              targets={campaign.targets || []}
              onViewDetails={handleViewTranscript}
              onDeleteCandidate={handleDeleteCandidate}
            />
          </TabsContent>

          <TabsContent value="calling" className="mt-6">
            <CampaignCallLauncher 
              campaign={campaign} 
              jobId={campaign.jobId || campaign.linkJob}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Call Details Sidebar */}
      {callDetailsCandidateId && (
        <CandidateCallDetailsSidebar
          candidateId={callDetailsCandidateId}
          candidateName={callDetailsCandidateName}
          onClose={() => setCallDetailsCandidateId(null)}
        />
      )}

      {/* Old Candidate Detail Dialog (kept for backward compatibility) */}
      <CandidateDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        candidate={selectedCandidate}
        defaultTab="conversation"
        visibleTabs={["conversation", "timeline"]}
      />
    </div>
  );
}

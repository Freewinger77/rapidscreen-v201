import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeftIcon, DownloadIcon, RefreshCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CampaignStatsCards } from "@/polymet/components/campaign-stats-cards";
import { CandidatesTable } from "@/polymet/components/candidates-table";
import { CandidateDetailDialog } from "@/polymet/components/candidate-detail-dialog";
import {
  getCampaignById,
  type CampaignCandidate,
} from "@/polymet/data/campaigns-data";

export function CampaignDetailsPage() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const campaign = getCampaignById(campaignId || "");
  const [selectedCandidate, setSelectedCandidate] =
    useState<CampaignCandidate | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

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

        {/* Candidates Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Candidates</h2>
          <CandidatesTable
            candidates={candidates}
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
        defaultTab="conversation"
        visibleTabs={["conversation", "timeline"]}
      />
    </div>
  );
}

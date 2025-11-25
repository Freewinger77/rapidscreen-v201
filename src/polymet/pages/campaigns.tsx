import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { PlusIcon, SearchIcon, FilterIcon, MegaphoneIcon } from "lucide-react";
import { CampaignCard } from "@/polymet/components/campaign-card";
import { CampaignWizard } from "@/polymet/components/campaign-wizard";
import { type Campaign } from "@/polymet/data/campaigns-data";
import { loadCampaigns, addCampaign, addCandidateToJob } from "@/lib/supabase-storage";
import { toast } from "sonner";

export function CampaignsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showWizard, setShowWizard] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  // Load campaigns from Supabase
  useEffect(() => {
    fetchCampaigns();
    
    // Also refresh when page becomes visible (e.g., after stopping campaign)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchCampaigns();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  async function fetchCampaigns() {
    try {
      setLoading(true);
      const loadedCampaigns = await loadCampaigns();
      setCampaigns(loadedCampaigns);
    } catch (err) {
      console.error('Failed to load campaigns:', err);
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  }

  const filteredCampaigns = campaigns.filter((campaign) =>
    campaign.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCampaigns = filteredCampaigns.filter(
    (c) => c.status === "active"
  );

  const inactiveCampaigns = filteredCampaigns.filter(
    (c) => c.status === "completed"
  );

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1
              className="text-3xl font-bold text-foreground"
              style={{ paddingRight: "15px", paddingLeft: "15px" }}
            >
              Campaigns
            </h1>
            <p
              className="text-muted-foreground mt-1"
              style={{ paddingRight: "15px", paddingLeft: "15px" }}
            >
              Manage your campaigns, track candidates, and keep communication
              flowing, all in one place
            </p>
          </div>
          <Button
            onClick={() => setShowWizard(true)}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Create New Campaign
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <h2
          className="text-2xl font-bold text-foreground mb-4"
          style={{ paddingRight: "15px", paddingLeft: "15px" }}
        >
          Active Campaigns: {activeCampaigns.length.toString().padStart(2, "0")}
        </h2>
        <div className="flex gap-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

            <Input
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <FilterIcon className="w-4 h-4" />
            Filter
          </Button>
        </div>
      </div>

      {/* Empty State - Only show if NO campaigns at all */}
      {campaigns.length === 0 && (
        <EmptyState
          icon={MegaphoneIcon}
          title="No campaigns found"
          description="Launch your first campaign to start reaching out to candidates and tracking engagement"
          actionLabel="Create Your First Campaign"
          onAction={() => setShowWizard(true)}
        />
      )}

      {/* Active Campaigns Grid */}
      {activeCampaigns.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {activeCampaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}

      {/* No Active Campaigns Message */}
      {campaigns.length > 0 && activeCampaigns.length === 0 && inactiveCampaigns.length > 0 && (
        <div className="text-center py-8 mb-8">
          <p className="text-muted-foreground">No active campaigns. All campaigns have ended or been stopped.</p>
        </div>
      )}

      {/* Inactive Campaigns Section */}
      {inactiveCampaigns.length > 0 && (
        <div className="mt-12">
          <h2
            className="text-2xl font-bold text-foreground mb-4"
            style={{ paddingRight: "15px", paddingLeft: "15px" }}
          >
            Inactive Campaigns: {inactiveCampaigns.length.toString().padStart(2, "0")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {inactiveCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        </div>
      )}

      <CampaignWizard
        open={showWizard}
        onOpenChange={setShowWizard}
        onComplete={async (data) => {
          try {
            console.log("Campaign data from wizard:", data);
            console.log("Campaign ID (with UID):", data.campaignId);
            
            // Save to database with the FULL campaign ID from webhook
            const campaignToSave = {
              ...data,
              status: "active" as const,
              createdAt: new Date().toISOString(),
            };
            
            // If we have a campaignId from webhook, use it as the ID
            if (data.campaignId) {
              // Use the webhook's campaign ID directly
              console.log("Using webhook campaign ID:", data.campaignId);
            }
            
            const newCampaignId = await addCampaign(campaignToSave);
            console.log("Campaign saved with ID:", newCampaignId);
            
            // Add campaign candidates to job candidates (so they appear on kanban)
            if (data.candidates && data.candidates.length > 0 && data.jobId) {
              for (const campaignCandidate of data.candidates) {
                try {
                  await addCandidateToJob(data.jobId, {
                    name: `${campaignCandidate.forename} ${campaignCandidate.surname}`.trim(),
                    phone: campaignCandidate.telMobile,
                    email: campaignCandidate.email,
                    status: 'not-contacted',  // Start in not-contacted, will sync from backend
                    notes: [],
                  });
                } catch (err) {
                  console.error('Failed to add candidate to job:', err);
                }
              }
              console.log(`✅ Added ${data.candidates.length} candidates to job kanban`);
            }
            
            // Reload campaigns
            await fetchCampaigns();
            
            toast.success('Campaign created successfully!');
            setShowWizard(false);
          } catch (error) {
            console.error('Failed to create campaign:', error);
            toast.error('Failed to create campaign');
          }
        }}
      />
    </div>
  );
}

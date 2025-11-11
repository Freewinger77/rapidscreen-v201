import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import type { Campaign } from "@/polymet/data/campaigns-data";
import { loadCampaigns } from "@/polymet/data/supabase-storage";
import { ChevronRightIcon, ChevronLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActiveCampaignsPanelProps {
  jobId?: string; // Filter campaigns by this job ID
}

export function ActiveCampaignsPanel({ jobId }: ActiveCampaignsPanelProps = {}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  // Load campaigns from Supabase and filter by job
  useEffect(() => {
    async function fetchCampaigns() {
      try {
        const allCampaigns = await loadCampaigns();
        
        // Filter by job ID if provided
        const filteredCampaigns = jobId
          ? allCampaigns.filter((c) => c.jobId === jobId || c.linkJob === jobId)
          : allCampaigns.filter((c) => c.status === 'active');
        
        setCampaigns(filteredCampaigns);
      } catch (error) {
        console.error('Error loading campaigns:', error);
      }
      setLoading(false);
    }
    fetchCampaigns();
  }, [jobId]);

  return (
    <div
      className={`border-l border-border bg-background transition-all duration-300 relative ${
        isCollapsed ? "w-0" : "w-80"
      }`}
    >
      {/* Collapse/Expand Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -left-4 top-6 z-10 h-8 w-8 rounded-full border border-border bg-background shadow-md hover:bg-accent"
      >
        {isCollapsed ? (
          <ChevronLeftIcon className="w-4 h-4" />
        ) : (
          <ChevronRightIcon className="w-4 h-4" />
        )}
      </Button>

      <div
        className={`p-6 space-y-6 overflow-hidden transition-opacity duration-300 ${
          isCollapsed ? "opacity-0" : "opacity-100"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Active Campaigns</h2>
          <Link
            to="/campaigns"
            className="text-sm text-primary hover:underline"
          >
            See All
          </Link>
        </div>

        {/* Campaigns List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading campaigns...</div>
          ) : campaigns.length === 0 ? (
            <div className="p-4 rounded-lg border border-dashed border-border text-center">
              <p className="text-sm text-muted-foreground">No campaigns yet</p>
              {jobId && (
                <Link
                  to="/campaigns"
                  className="text-xs text-primary hover:underline inline-block mt-2"
                >
                  Create a campaign for this job
                </Link>
              )}
            </div>
          ) : (
            campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="p-4 rounded-lg border border-border bg-card space-y-3 hover:border-primary/50 transition-colors"
            >
              <h3 className="font-semibold">{campaign.name}</h3>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Candidates:</span>
                  <span className="font-medium">
                    {campaign.totalCandidates}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Response Rate:</span>
                  <span className="font-medium text-primary">
                    {campaign.responseRate}%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Channels:</span>
                  <span className="font-medium">
                    {campaign.channels.join(" + ")}
                  </span>
                </div>
              </div>

              <Link
                to={`/campaign/${campaign.id}`}
                className="text-sm text-primary hover:underline inline-block"
              >
                View Details
              </Link>
            </div>
          )))}
        </div>
      </div>
    </div>
  );
}

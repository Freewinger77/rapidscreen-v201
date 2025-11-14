import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusIcon, SearchIcon, FilterIcon } from "lucide-react";
import { CampaignCard } from "@/polymet/components/campaign-card";
import { CampaignWizard } from "@/polymet/components/campaign-wizard";
import { campaignsData } from "@/polymet/data/campaigns-data";
import { loadCampaigns, addCampaign } from "@/polymet/data/storage-manager";

export function CampaignsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showWizard, setShowWizard] = useState(false);
  const [campaigns, setCampaigns] = useState(loadCampaigns(campaignsData));

  // Reload campaigns when component mounts
  useEffect(() => {
    setCampaigns(loadCampaigns(campaignsData));
  }, []);

  const filteredCampaigns = campaigns.filter((campaign) =>
    campaign.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCampaigns = filteredCampaigns.filter(
    (c) => c.status === "active"
  );

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeCampaigns.map((campaign) => (
          <CampaignCard key={campaign.id} campaign={campaign} />
        ))}
      </div>

      {activeCampaigns.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No campaigns found</p>
          <Button onClick={() => setShowWizard(true)} variant="outline">
            <PlusIcon className="w-4 h-4 mr-2" />
            Create Your First Campaign
          </Button>
        </div>
      )}

      <CampaignWizard
        open={showWizard}
        onOpenChange={setShowWizard}
        onComplete={(data) => {
          console.log("Campaign created:", data);
          // Save to storage and update state
          const newCampaign = {
            ...data,
            id: `campaign-${Date.now()}`,
            status: "active" as const,
            createdAt: new Date().toISOString(),
          };
          addCampaign(newCampaign);
          setCampaigns(loadCampaigns(campaignsData));
        }}
      />
    </div>
  );
}

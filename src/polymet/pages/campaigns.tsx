import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusIcon, SearchIcon, FilterIcon } from "lucide-react";
import { CampaignCard } from "@/polymet/components/campaign-card";
import { CampaignWizard } from "@/polymet/components/campaign-wizard";
import { campaignsData } from "@/polymet/data/campaigns-data";
import { loadCampaigns } from "@/polymet/data/supabase-storage";

export function CampaignsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showWizard, setShowWizard] = useState(false);
  const [campaigns, setCampaigns] = useState(campaignsData);
  const [loading, setLoading] = useState(true);

  // Load campaigns from Supabase on mount
  useEffect(() => {
    async function fetchCampaigns() {
      try {
        const supabaseCampaigns = await loadCampaigns();
        if (supabaseCampaigns.length > 0) {
          setCampaigns(supabaseCampaigns);
        } else {
          console.log('No campaigns in Supabase, using mock data');
          setCampaigns(campaignsData);
        }
      } catch (error) {
        console.error('Error loading campaigns:', error);
        setCampaigns(campaignsData);
      }
      setLoading(false);
    }
    fetchCampaigns();
  }, []);

  const filteredCampaigns = campaigns.filter((campaign) =>
    campaign.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCampaigns = filteredCampaigns.filter(
    (c) => c.status === "active"
  );

  if (loading) {
    return (
      <div className="p-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <Skeleton className="h-9 w-40 mb-2" style={{ marginLeft: "15px" }} />
              <Skeleton className="h-5 w-96" style={{ marginLeft: "15px" }} />
            </div>
            <Skeleton className="h-10 w-44" />
          </div>
        </div>

        {/* Search and Filter Skeleton */}
        <div className="mb-6 flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Active Campaigns Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-7 w-48 mb-4" />
          <div className="grid grid-cols-1 gap-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="p-6 rounded-lg border border-border bg-card"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <Skeleton className="h-6 w-64 mb-2" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j}>
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeCampaigns.map((campaign) => (
          <CampaignCard 
            key={campaign.id} 
            campaign={campaign}
            onStatusChange={async () => {
              // Refresh campaigns after status change
              const updatedCampaigns = await loadCampaigns();
              setCampaigns(updatedCampaigns);
            }}
          />
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
        onComplete={async (data) => {
          console.log("🚀 Starting campaign creation...", data);
          setLoading(true); // Show loading state
          
          // Import Supabase functions
          const { 
            saveCampaign, 
            saveCampaignTargets, 
            saveCampaignMatrices, 
            linkDatasetCandidatesToCampaign,
            updateCampaign,
            loadDatasets, 
            loadJobs, 
            loadCampaigns 
          } = await import('@/polymet/data/supabase-storage');
          
          try {
            // Get job title from linked job
            const jobs = await loadJobs();
            const linkedJob = jobs.find(j => j.id === data.linkJob);
            
            if (!linkedJob) {
              console.error('❌ Job not found:', data.linkJob);
              alert('Error: Selected job not found. Please refresh and try again.');
              setLoading(false);
              return;
            }
            
            console.log('✅ Found linked job:', linkedJob.title);
            
            // Calculate total candidates based on upload method
            let totalCandidates = 0;
            
            if (data.uploadMethod === 'manual' && data.manualCandidates) {
              totalCandidates = data.manualCandidates.length;
              console.log('👥 Manual candidates:', totalCandidates);
            } else if (data.datasetIds && data.datasetIds.length > 0) {
              const datasets = await loadDatasets();
              console.log('📊 Available datasets:', datasets.length);
              console.log('🎯 Selected dataset IDs:', data.datasetIds);
              
              const selectedDatasets = datasets.filter(d => data.datasetIds?.includes(d.id));
              console.log('✅ Found datasets:', selectedDatasets.map(d => d.name));
              
              for (const ds of selectedDatasets) {
                totalCandidates += ds.candidateCount || 0;
              }
              console.log('👥 Total candidates from datasets:', totalCandidates);
            }
            
            // 1. Create campaign in Supabase
            console.log('💾 Saving campaign to Supabase...');
            
            // Ensure dates are set (use defaults if not provided)
            const startDate = data.startDate || new Date().toISOString();
            const endDate = data.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days from now
            
            console.log('📅 Dates:', { startDate, endDate });
            
            const campaignId = await saveCampaign({
              name: data.name,
              jobId: data.linkJob,
              jobTitle: linkedJob.title,
              linkJob: data.linkJob,
              startDate: startDate,
              endDate: endDate,
              channels: data.channels,
              totalCandidates: 0, // Will update after linking candidates
              hired: 0,
              responseRate: 0,
              status: 'active',
            });
            
            if (!campaignId) {
              console.error('❌ Failed to save campaign');
              alert('Error: Failed to create campaign. Please try again.');
              setLoading(false);
              return;
            }
            
            console.log('✅ Campaign saved with ID:', campaignId);
            
            // 2. Save targets
            if (data.targets && data.targets.length > 0) {
              console.log('🎯 Saving targets...');
              const targetsSuccess = await saveCampaignTargets(campaignId, data.targets);
              if (targetsSuccess) {
                console.log('✅ Saved', data.targets.length, 'targets');
              } else {
                console.warn('⚠️ Failed to save targets');
              }
            }
            
            // 3. Save matrices (filter by selected channels)
            if (data.matrices && data.matrices.length > 0) {
              console.log('📝 Saving matrices...');
              // Filter matrices based on selected channels
              const relevantMatrices = data.matrices.map(m => ({
                ...m,
                whatsappMessage: data.channels.includes('whatsapp') ? m.whatsappMessage : null,
                callScript: data.channels.includes('call') ? m.callScript : null,
              }));
              
              const matricesSuccess = await saveCampaignMatrices(campaignId, relevantMatrices);
              if (matricesSuccess) {
                console.log('✅ Saved', relevantMatrices.length, 'matrices');
              } else {
                console.warn('⚠️ Failed to save matrices');
              }
            }
            
            // 4. Link dataset candidates OR save manual candidates
            let actualCandidatesLinked = 0;
            
            if (data.uploadMethod === 'manual' && data.manualCandidates && data.manualCandidates.length > 0) {
              // Save manually entered candidates
              console.log('📝 Saving manually entered candidates...');
              const supabase = (await import('@/lib/supabase')).supabase;
              
              const manualCandidatesData = data.manualCandidates.map((c: any) => ({
                campaign_id: campaignId,
                forename: c.name.split(' ')[0] || c.name,
                surname: c.name.split(' ').slice(1).join(' ') || '',
                tel_mobile: c.phone,
                email: '',
                call_status: 'not_called',
                available_to_work: null,
                interested: null,
                know_referee: null,
              }));
              
              const { error: insertError } = await supabase
                .from('campaign_candidates')
                .insert(manualCandidatesData);
              
              if (!insertError) {
                actualCandidatesLinked = data.manualCandidates.length;
                console.log(`✅ Saved ${actualCandidatesLinked} manual candidates`);
              } else {
                console.error('❌ Error saving manual candidates:', insertError);
              }
              
            } else if (data.datasetIds && data.datasetIds.length > 0) {
              // Link candidates from datasets
              console.log('🔗 Linking candidates from datasets...');
              actualCandidatesLinked = await linkDatasetCandidatesToCampaign(campaignId, data.datasetIds);
              console.log(`✅ Linked ${actualCandidatesLinked} candidates from datasets`);
            }
            
            // Update campaign with actual candidate count
            if (actualCandidatesLinked > 0) {
              await updateCampaign(campaignId, { totalCandidates: actualCandidatesLinked });
              console.log('✅ Updated campaign candidate count:', actualCandidatesLinked);
            }
            
            // 5. Refresh campaigns list
            console.log('🔄 Refreshing campaigns list...');
            const updatedCampaigns = await loadCampaigns();
            console.log('✅ Loaded campaigns from Supabase:', updatedCampaigns);
            setCampaigns(updatedCampaigns);
            console.log('✅ Campaigns refreshed, total:', updatedCampaigns.length);
            
            // Force a re-render by ensuring state is updated
            setTimeout(() => {
              setCampaigns([...updatedCampaigns]);
            }, 100);
            
            console.log('🎉 Campaign creation complete!');
            
            // Ask if user wants to start calling immediately
            const shouldStartCalling = confirm(
              `✅ Campaign created successfully!\n\n` +
              `📝 Campaign: ${data.name}\n` +
              `👥 Candidates: ${actualCandidatesLinked}\n\n` +
              `🚀 Start calling immediately?\n\n` +
              `Click OK to begin automated calls now, or Cancel to start later.`
            );
            
            if (shouldStartCalling && campaignId) {
              console.log('🚀 Auto-starting campaign calls...');
              // Navigate to campaign details page with auto-launch
              window.location.href = `/campaign/${campaignId}?autoLaunch=true`;
            } else {
              alert(`Campaign created! Go to the campaign page to start calling when ready.`);
            }
            
          } catch (error: any) {
            console.error('❌ Error creating campaign:', error);
            console.error('Full error details:', JSON.stringify(error, null, 2));
            alert(`Error creating campaign: ${error?.message || error || 'Unknown error'}.\n\nCheck browser console for details.`);
          } finally {
            setLoading(false);
          }
        }}
      />
    </div>
  );
}

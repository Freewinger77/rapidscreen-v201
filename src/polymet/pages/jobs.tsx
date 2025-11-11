import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { jobsData, type Job } from "@/polymet/data/jobs-data";
import type { Campaign } from "@/polymet/data/campaigns-data";
import {
  loadJobs,
  loadCampaigns,
  deleteJob as deleteJobFromDb,
} from "@/polymet/data/supabase-storage";
import { Button } from "@/components/ui/button";
import {
  PlusIcon,
  BriefcaseIcon,
  MapPinIcon,
  UsersIcon,
  TrendingUpIcon,
  Trash2Icon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { JobCreationDialog } from "@/polymet/components/job-creation-dialog";
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

export function JobsPage() {
  const [showJobDialog, setShowJobDialog] = useState(false);
  const [jobs, setJobs] = useState<Job[]>(jobsData);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load jobs and campaigns from Supabase on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const [supabaseJobs, supabaseCampaigns] = await Promise.all([
          loadJobs(),
          loadCampaigns()
        ]);
        
        if (supabaseJobs.length > 0) {
          setJobs(supabaseJobs);
        } else {
          console.log('No jobs in Supabase, using mock data');
          setJobs(jobsData);
        }
        
        setCampaigns(supabaseCampaigns);
        
      } catch (error) {
        console.error('Error loading data:', error);
        setJobs(jobsData);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleDeleteJob = async (jobId: string) => {
    // Optimistic update
    setJobs(jobs.filter((job) => job.id !== jobId));
    
    // Delete from Supabase
    await deleteJobFromDb(jobId);
    setDeleteJobId(null);
  };

  if (loading) {
    return (
      <div className="p-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <Skeleton className="h-9 w-32 mb-2" style={{ marginLeft: "15px" }} />
              <Skeleton className="h-5 w-64" style={{ marginLeft: "15px" }} />
            </div>
            <Skeleton className="h-10 w-36" />
          </div>
        </div>

        {/* Jobs Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="p-6 rounded-lg border border-border bg-card"
            >
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <Skeleton className="h-7 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </div>

                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                </div>

                {/* Details */}
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-40" />
                </div>

                {/* Tags */}
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-14" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1
              className="text-3xl font-bold text-foreground"
              style={{ paddingRight: "15px", paddingLeft: "15px" }}
            >
              Jobs
            </h1>
            <p
              className="text-muted-foreground mt-1"
              style={{ paddingRight: "15px", paddingLeft: "15px" }}
            >
              Manage your job postings and recruitment pipeline
            </p>
          </div>
          <Button
            onClick={() => setShowJobDialog(true)}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add New Job
          </Button>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {jobs.map((job) => {
          const progressPercentage = (job.hired / job.target) * 100;
          // Get campaigns ONLY for this specific job
          const jobCampaigns = campaigns.filter((c) => c.jobId === job.id || c.linkJob === job.id);
          const activeCampaign = jobCampaigns.find((c) => c.status === "active");

          return (
            <div
              key={job.id}
              className="relative group p-6 rounded-lg border border-border bg-card hover:border-primary/50 transition-all hover:shadow-lg"
            >
              {/* Delete Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDeleteJobId(job.id);
                }}
              >
                <Trash2Icon className="w-4 h-4" />
              </Button>

              <Link to={`/job/${job.id}`} className="block">
                <div className="space-y-4">
                  {/* Job Title */}
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <BriefcaseIcon className="w-4 h-4" />

                      <span>{job.company}</span>
                    </div>
                  </div>

                  {/* Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-2 text-sm">
                      <span className="font-medium">{job.hired} Hired</span>
                      <span className="font-medium">{job.target} Target</span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                  </div>

                  {/* Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPinIcon className="w-4 h-4" />

                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <UsersIcon className="w-4 h-4" />

                      <span>{job.candidates.length} Candidates</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {job.tags.slice(0, 3).map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {job.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{job.tags.length - 3}
                      </Badge>
                    )}
                  </div>

                  {/* Active Campaign */}
                  {jobCampaigns.length > 0 ? (
                    activeCampaign ? (
                      <div className="pt-3 border-t border-border">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              Active Campaign
                            </span>
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                              <span className="text-xs font-medium text-foreground">
                                {activeCampaign.name}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-green-500">
                            <TrendingUpIcon className="w-3 h-3" />
                            <span className="text-xs font-medium">
                              {activeCampaign.responseRate}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-3 border-t border-border">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {jobCampaigns.length} campaign{jobCampaigns.length !== 1 ? 's' : ''} (not active)
                          </span>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="pt-3 border-t border-border">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground italic">
                          No campaigns yet
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      <JobCreationDialog
        open={showJobDialog}
        onOpenChange={setShowJobDialog}
        onSave={async (jobData) => {
          console.log("💾 Saving new job to Supabase...", jobData);
          
          // Save to Supabase
          const { saveJob, loadJobs } = await import('@/polymet/data/supabase-storage');
          
          const jobId = await saveJob({
            ...jobData,
            candidates: [],
          });
          
          if (jobId) {
            console.log(`✅ Job saved to Supabase: ${jobId}`);
            
            // Refresh jobs and campaigns from database
            const [updatedJobs, updatedCampaigns] = await Promise.all([
              loadJobs(),
              loadCampaigns()
            ]);
            setJobs(updatedJobs);
            setCampaigns(updatedCampaigns);
          } else {
            console.error("❌ Failed to save job");
          }
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteJobId !== null}
        onOpenChange={(open) => !open && setDeleteJobId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this job? This action cannot be
              undone. All candidates and campaigns associated with this job will
              be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteJobId && handleDeleteJob(deleteJobId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Job
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

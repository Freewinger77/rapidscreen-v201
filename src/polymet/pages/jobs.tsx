import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { type Job } from "@/polymet/data/jobs-data";
import { type Campaign } from "@/polymet/data/campaigns-data";
import {
  loadJobs,
  deleteJob as deleteJobFromStorage,
  addJob,
} from "@/lib/supabase-storage";
import { loadCampaigns } from "@/lib/supabase-storage";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
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
  const [jobs, setJobs] = useState<Job[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [deleteJobId, setDeleteJobId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  // Load data from Supabase
  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    try {
      setLoading(true);
      const [loadedJobs, loadedCampaigns] = await Promise.all([
        loadJobs(),
        loadCampaigns(),
      ]);
      setJobs(loadedJobs);
      setCampaigns(loadedCampaigns);
    } catch (err) {
      console.error('Failed to load jobs:', err);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    try {
      setDeleting(true);
      await deleteJobFromStorage(jobId);
      await fetchJobs(); // Reload data
      toast.success('Job deleted successfully');
    setDeleteJobId(null);
    } catch (error) {
      console.error('Failed to delete job:', error);
      toast.error('Failed to delete job');
    } finally {
      setDeleting(false);
    }
  };

  const handleCreateJob = async (jobData: Omit<Job, 'id' | 'candidates'>) => {
    try {
      await addJob({
        ...jobData,
        candidates: [],
      });
      await fetchJobs(); // Reload data
      toast.success('Job created successfully');
      setShowJobDialog(false);
    } catch (error) {
      console.error('Failed to create job:', error);
      toast.error('Failed to create job');
    }
  };

  // Helper to get campaigns for a job
  const getCampaignsByJobId = (jobId: string) => {
    return campaigns.filter(c => c.jobId === jobId);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading jobs...</p>
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

      {/* Empty State */}
      {jobs.length === 0 && (
        <EmptyState
          icon={BriefcaseIcon}
          title="No jobs found"
          description="Get started by creating your first job posting to begin recruiting candidates"
          actionLabel="Create Your First Job"
          onAction={() => setShowJobDialog(true)}
        />
      )}

      {/* Jobs Grid */}
      {jobs.length > 0 && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {jobs.map((job) => {
          // Calculate actual hired count from candidates
          const actualHiredCount = job.candidates.filter(c => 
            c.status === 'hired' || 
            c.status === 'started-work'
          ).length;
          const progressPercentage = (actualHiredCount / job.target) * 100;
          const campaigns = getCampaignsByJobId(job.id);
          const activeCampaign = campaigns.find((c) => c.status === "active");

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
                      <span className="font-medium">{actualHiredCount} Hired</span>
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
                  {activeCampaign && (
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
                  )}
                </div>
              </Link>
            </div>
          );
        })}
      </div>
      )}

      <JobCreationDialog
        open={showJobDialog}
        onOpenChange={setShowJobDialog}
        onSave={handleCreateJob}
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
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete Job'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

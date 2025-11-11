import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { JobHeader } from "@/polymet/components/job-header";
import { KanbanBoard } from "@/polymet/components/kanban-board";
import { Skeleton } from "@/components/ui/skeleton";
import { jobsData } from "@/polymet/data/jobs-data";
import { loadJobs } from "@/polymet/data/supabase-storage";

export function JobDetailsPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const [jobs, setJobs] = useState(jobsData);
  const [loading, setLoading] = useState(true);

  // Load jobs from Supabase, fallback to mock data
  useEffect(() => {
    async function fetchJobs() {
      try {
        const supabaseJobs = await loadJobs();
        if (supabaseJobs.length > 0) {
          setJobs(supabaseJobs);
        } else {
          // Fallback to mock data if Supabase is empty
          console.log('No jobs in Supabase, using mock data');
          setJobs(jobsData);
        }
      } catch (error) {
        console.error('Error loading jobs from Supabase:', error);
        // Fallback to mock data on error
        setJobs(jobsData);
      }
      setLoading(false);
    }
    fetchJobs();
  }, []);

  const job = jobId ? jobs.find((j) => j.id === jobId) : jobs[0];

  // Refresh job data after edits
  const handleJobUpdated = async () => {
    const supabaseJobs = await loadJobs();
    if (supabaseJobs.length > 0) {
      setJobs(supabaseJobs);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        {/* Job Header Skeleton */}
        <div className="mb-8 p-6 rounded-lg border border-border bg-card">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-5 w-48 mb-4" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        </div>

        {/* Kanban Skeleton */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-10 w-40" />
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="min-w-[300px] p-4 rounded-lg border border-border bg-card/50"
              >
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="space-y-3">
                  {[1, 2].map((j) => (
                    <div
                      key={j}
                      className="p-4 rounded-md border border-border bg-card"
                    >
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
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

  if (!job) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Job Not Found</h2>
          <p className="text-muted-foreground">
            The job you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <JobHeader job={job} onJobUpdated={handleJobUpdated} />

      <KanbanBoard job={job} />
    </div>
  );
}

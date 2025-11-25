import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { JobHeader } from "@/polymet/components/job-header";
import { KanbanBoard } from "@/polymet/components/kanban-board";
import { ActiveCampaignsPanel } from "@/polymet/components/active-campaigns-panel";
import { type Job } from "@/polymet/data/jobs-data";
import { loadJobs } from "@/lib/supabase-storage";
import { toast } from "sonner";

export function JobDetailsPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [hiredCount, setHiredCount] = useState(0);

  useEffect(() => {
    fetchJob();
  }, [jobId]);

  async function fetchJob() {
    try {
      setLoading(true);
      const jobs = await loadJobs();
      const foundJob = jobId ? jobs.find((j) => j.id === jobId) : jobs[0];
      
      if (foundJob) {
        console.log('✅ Job loaded:', foundJob.title);
        console.log('   Job ID:', foundJob.id);
        console.log('   Hired count from DB:', foundJob.hired);
        console.log('   Candidates:', foundJob.candidates.length);
        foundJob.candidates.forEach(c => {
          console.log(`     ${c.name}: ${c.status}`);
        });
      }
      
      setJob(foundJob || null);
      // FORCE fresh count from database
      setHiredCount(foundJob?.hired || 0);
      
      if (!foundJob && jobId) {
        toast.error('Job not found');
      }
    } catch (err) {
      console.error('Failed to load job:', err);
      toast.error('Failed to load job');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading job...</p>
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

  // Calculate hired count in real-time from candidates in "hired" status
  const actualHiredCount = job ? job.candidates.filter(c => 
    c.status === 'hired' || 
    c.status === 'started-work'  // post-hire
  ).length : 0;

  // Create a job with real-time hired count for display
  const displayJob = job ? { ...job, hired: actualHiredCount } : null;

  return (
    <div className="flex">
      <div className="flex-1 space-y-8">
        {displayJob && <JobHeader job={displayJob} onUpdate={fetchJob} />}
        {job && (
          <KanbanBoard 
            job={job} 
            onUpdate={fetchJob}
          />
        )}
      </div>
      {job && <ActiveCampaignsPanel jobId={job.id} />}
    </div>
  );
}

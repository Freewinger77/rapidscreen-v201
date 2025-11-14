import { useParams } from "react-router-dom";
import { JobHeader } from "@/polymet/components/job-header";
import { KanbanBoard } from "@/polymet/components/kanban-board";
import { jobsData } from "@/polymet/data/jobs-data";
import { loadJobs } from "@/polymet/data/storage-manager";

export function JobDetailsPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const jobs = loadJobs(jobsData);
  const job = jobId ? jobs.find((j) => j.id === jobId) : jobs[0];

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
      <JobHeader job={job} />

      <KanbanBoard job={job} />
    </div>
  );
}

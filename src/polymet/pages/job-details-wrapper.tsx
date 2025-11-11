import { useParams } from "react-router-dom";
import { MainLayout } from "@/polymet/layouts/main-layout";
import { JobDetailsPage } from "@/polymet/pages/job-details";

export function JobDetailsWrapper() {
  const { jobId } = useParams<{ jobId: string }>();
  
  return (
    <MainLayout jobId={jobId}>
      <JobDetailsPage />
    </MainLayout>
  );
}


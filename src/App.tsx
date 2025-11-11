import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/polymet/layouts/main-layout";
import { DashboardPage } from "@/polymet/pages/dashboard";
import { JobsPage } from "@/polymet/pages/jobs";
import { JobDetailsWrapper } from "@/polymet/pages/job-details-wrapper";
import { CampaignsPage } from "@/polymet/pages/campaigns";
import { CampaignDetailsPage } from "@/polymet/pages/campaign-details";
import { DatasetsPage } from "@/polymet/pages/datasets";

export default function RecruitmentApp() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <MainLayout showCampaigns={false}>
              <DashboardPage />
            </MainLayout>
          }
        />

        <Route
          path="/jobs"
          element={
            <MainLayout showCampaigns={false}>
              <JobsPage />
            </MainLayout>
          }
        />

        <Route
          path="/campaigns"
          element={
            <MainLayout showCampaigns={false}>
              <CampaignsPage />
            </MainLayout>
          }
        />

        <Route
          path="/campaign/:campaignId"
          element={
            <MainLayout showCampaigns={false}>
              <CampaignDetailsPage />
            </MainLayout>
          }
        />

        <Route
          path="/job/:jobId"
          element={<JobDetailsWrapper />}
        />

        <Route
          path="/datasets"
          element={
            <MainLayout showCampaigns={false}>
              <DatasetsPage />
            </MainLayout>
          }
        />
      </Routes>
    </Router>
  );
}

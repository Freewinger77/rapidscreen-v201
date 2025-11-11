import { Sidebar } from "@/polymet/components/sidebar";
import { ActiveCampaignsPanel } from "@/polymet/components/active-campaigns-panel";

interface MainLayoutProps {
  children: React.ReactNode;
  showCampaigns?: boolean;
  jobId?: string; // Pass job ID to filter campaigns
}

export function MainLayout({
  children,
  showCampaigns = true,
  jobId,
}: MainLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />

      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">{children}</div>
        </main>

        {showCampaigns && <ActiveCampaignsPanel jobId={jobId} />}
      </div>
    </div>
  );
}

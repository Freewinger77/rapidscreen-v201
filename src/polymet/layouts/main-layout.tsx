import { Sidebar } from "@/polymet/components/sidebar";
import { ActiveCampaignsPanel } from "@/polymet/components/active-campaigns-panel";

interface MainLayoutProps {
  children: React.ReactNode;
  showCampaigns?: boolean;
}

export function MainLayout({
  children,
  showCampaigns = true,
}: MainLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />

      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">{children}</div>
        </main>

        {showCampaigns && <ActiveCampaignsPanel />}
      </div>
    </div>
  );
}

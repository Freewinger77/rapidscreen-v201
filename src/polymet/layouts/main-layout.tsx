import { Sidebar } from "@/polymet/components/sidebar";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />

      <div className="flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto h-full">
          <div className="p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

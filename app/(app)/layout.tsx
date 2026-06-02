import { Sidebar } from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { Topbar } from "@/components/topbar";
import { ErrorBanner } from "@/components/error-banner";
import { AsistenteAgenda } from "@/components/asistente-agenda";
import { StoreProvider } from "@/lib/store";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />
          <main className="flex-1 pb-20 md:pb-0">
            <div className="max-w-6xl mx-auto px-4 md:px-10 py-6 md:py-10">
              <ErrorBanner />
              {children}
            </div>
          </main>
        </div>
      </div>
      <MobileNav />
      <AsistenteAgenda />
    </StoreProvider>
  );
}

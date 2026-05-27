import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { Topbar } from "@/components/topbar";
import { StoreProvider } from "@/lib/store";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Gestión de Reuniones · Municipalidad de San Miguel de Tucumán",
  description: "Sistema interno para la gestión de solicitudes de reuniones",
  icons: { icon: "/logos/logoMuni-sm.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="min-h-screen antialiased font-sans bg-app" style={{ fontFamily: "var(--font-sans), system-ui, sans-serif" }}>
        <StoreProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
              <Topbar />
              <main className="flex-1 pb-20 md:pb-0">
                <div className="max-w-6xl mx-auto px-4 md:px-10 py-6 md:py-10">{children}</div>
              </main>
            </div>
          </div>
          <MobileNav />
        </StoreProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Gestión de Reuniones · Municipalidad de San Miguel de Tucumán",
  description: "Sistema interno para la gestión de solicitudes de reuniones",
  icons: { icon: "/logos/logoMuni-sm.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable}>
      <body
        className="min-h-screen antialiased font-sans bg-app"
        style={{ fontFamily: "var(--font-sans), system-ui, sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}

"use client";
import Image from "next/image";
import Link from "next/link";

export function Topbar() {
  const hoy = new Date().toLocaleDateString("es-AR", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric",
  });

  return (
    <header className="sticky top-0 z-10 border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-6xl mx-auto px-4 md:px-10 h-14 md:h-16 flex items-center justify-between gap-4">
        <Link href="/" className="md:hidden flex items-center gap-2">
          <Image src="/logos/logoMuni-sm.png" alt="SMT" width={32} height={32} className="h-8 w-8" />
          <span className="text-sm font-semibold text-foreground">Intendencia</span>
        </Link>
        <p className="hidden md:block text-sm text-muted-foreground capitalize">{hoy}</p>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col text-right leading-tight">
            <span className="text-sm font-medium">Secretaría</span>
            <span className="text-[11px] text-muted-foreground">Despacho de Intendencia</span>
          </div>
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[hsl(var(--smt-blue))] to-[hsl(var(--smt-sky))] text-white flex items-center justify-center text-sm font-semibold shadow-sm">
            S
          </div>
        </div>
      </div>
    </header>
  );
}

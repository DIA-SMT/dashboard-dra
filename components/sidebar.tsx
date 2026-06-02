"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarDays, ClipboardList, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { CopiarLinkPublico } from "@/components/copiar-link-publico";

const items = [
  { href: "/", label: "Inicio", icon: LayoutDashboard },
  { href: "/nueva-solicitud", label: "Nueva solicitud", icon: PlusCircle },
  { href: "/calendario", label: "Calendario", icon: CalendarDays },
  { href: "/solicitudes", label: "Solicitudes", icon: ClipboardList },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex md:w-64 lg:w-72 shrink-0 flex-col bg-smt-blue-dark text-white relative overflow-hidden sticky top-0 h-screen">
      {/* halo decorativo */}
      <div className="pointer-events-none absolute -top-24 -right-16 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 -left-10 h-48 w-48 rounded-full bg-white/5 blur-3xl" />

      <div className="relative px-6 pt-8 pb-6">
        <Image
          src="/logos/Logo_SMT_neg_4.png"
          alt="Municipalidad de San Miguel de Tucumán"
          width={200}
          height={64}
          className="h-12 w-auto"
          priority
        />
        <p className="mt-4 text-[11px] uppercase tracking-[0.18em] text-white/60">
          Gestión de reuniones
        </p>
      </div>

      <div className="relative px-4 py-2 mb-2">
        <div className="h-px bg-white/10" />
      </div>

      <nav className="relative flex-1 px-3 space-y-1">
        {items.map((it) => {
          const active = pathname === it.href;
          const Icon = it.icon;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                active
                  ? "bg-white text-[hsl(var(--smt-blue-dark))] shadow-sm"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              )}
            >
              <Icon className={cn("h-[18px] w-[18px]", active ? "" : "text-white/70 group-hover:text-white")} />
              {it.label}
            </Link>
          );
        })}
      </nav>

      <div className="relative px-6 py-5 mt-2">
        <CopiarLinkPublico
          variant="secondary"
          size="default"
          className="w-full bg-white/10 text-white hover:bg-white/20 border border-white/15"
        />
        <p className="mt-2 text-[10px] text-white/45 leading-snug">
          Compartí este link para que soliciten reuniones desde afuera.
        </p>
        <div className="mt-4 rounded-lg bg-white/5 border border-white/10 px-3 py-2.5">
          <p className="text-[10px] uppercase tracking-wider text-white/50">Despacho</p>
          <p className="text-sm text-white/90 font-medium leading-tight mt-0.5">Intendencia Municipal</p>
        </div>
        <p className="mt-4 text-[10px] text-white/40">MVP · v0.1</p>
      </div>
    </aside>
  );
}

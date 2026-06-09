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
    <aside className="hidden md:flex md:w-56 shrink-0 flex-col bg-card border-r border-border sticky top-0 h-screen">
      {/* Marca */}
      <div className="flex items-center gap-2.5 px-4 pt-5 pb-4">
        <Image
          src="/logos/logoMuni-sm.png"
          alt="Municipalidad de San Miguel de Tucumán"
          width={36}
          height={36}
          className="h-9 w-9 shrink-0"
          priority
        />
        <div className="min-w-0 leading-tight">
          <p className="text-sm font-semibold text-foreground truncate">Intendencia</p>
          <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground truncate">
            Gestión de reuniones
          </p>
        </div>
      </div>

      <div className="px-3">
        <div className="h-px bg-border" />
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {items.map((it) => {
          const active = pathname === it.href;
          const Icon = it.icon;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                "group flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors",
                active
                  ? "bg-[hsl(var(--smt-blue))]/10 text-[hsl(var(--smt-blue))] font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <Icon
                className={cn(
                  "h-[18px] w-[18px] shrink-0",
                  active ? "text-[hsl(var(--smt-blue))]" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              {it.label}
            </Link>
          );
        })}
      </nav>

      {/* Pie */}
      <div className="px-3 py-4 space-y-3 border-t border-border">
        <div>
          <CopiarLinkPublico variant="outline" size="sm" className="w-full justify-center" />
          <p className="mt-1.5 text-[10px] text-muted-foreground leading-snug">
            Compartí este link para recibir solicitudes desde afuera.
          </p>
        </div>
        <div className="rounded-lg bg-muted px-3 py-2">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Despacho</p>
          <p className="text-sm text-foreground font-medium leading-tight mt-0.5">Intendencia Municipal</p>
        </div>
        <p className="text-[10px] text-muted-foreground/70">MVP · v0.2</p>
      </div>
    </aside>
  );
}

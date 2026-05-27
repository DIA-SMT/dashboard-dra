"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarDays, ClipboardList, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Inicio", icon: LayoutDashboard },
  { href: "/calendario", label: "Calendario", icon: CalendarDays },
  { href: "/nueva-solicitud", label: "Nueva", icon: PlusCircle },
  { href: "/solicitudes", label: "Solicitudes", icon: ClipboardList },
];

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="md:hidden fixed bottom-3 inset-x-3 z-20 rounded-2xl border bg-white/95 backdrop-blur shadow-lg grid grid-cols-4">
      {items.map((it) => {
        const active = pathname === it.href;
        const Icon = it.icon;
        return (
          <Link
            key={it.href}
            href={it.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
              active ? "text-[hsl(var(--smt-blue))]" : "text-muted-foreground"
            )}
          >
            <Icon className={cn("h-5 w-5", active && "stroke-[2.2]")} />
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}

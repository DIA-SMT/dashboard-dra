"use client";
import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EstadoBadge } from "@/components/estado-badge";
import { DetalleSolicitud } from "@/components/detalle-solicitud";
import { useStore } from "@/lib/store";
import { Solicitud } from "@/lib/types";
import { cn, esReciente } from "@/lib/utils";
import { CalendarDays, Clock, AlertCircle, PlusCircle, ChevronRight, ClipboardList, ArrowRight } from "lucide-react";

function todayISO() { return new Date().toISOString().slice(0, 10); }

export default function DashboardPage() {
  const { solicitudes } = useStore();
  const [sel, setSel] = React.useState<Solicitud | null>(null);

  const hoy = todayISO();
  const reunionesHoy = solicitudes
    .filter((s) => s.estado === "agendada" && s.fecha === hoy)
    .sort((a, b) => (a.hora ?? "").localeCompare(b.hora ?? ""));
  const proximas = solicitudes
    .filter((s) => s.estado === "agendada" && s.fecha > hoy)
    .sort((a, b) => a.fecha.localeCompare(b.fecha) || (a.hora ?? "").localeCompare(b.hora ?? ""))
    .slice(0, 5);
  const pendientes = solicitudes.filter((s) => s.estado === "pendiente");
  const pendientesNuevas = pendientes.filter((s) => esReciente(s.creadaEn)).length;

  return (
    <div className="space-y-8">
      {/* Hero institucional — foto del municipio con velado cobalto */}
      <section className="relative overflow-hidden rounded-2xl text-white p-6 md:p-8 shadow-sm">
        {/* Foto del edificio municipal */}
        <div
          aria-hidden
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/logos/muni.jpg')" }}
        />
        {/* Velado degradado con los colores del logo (más oscuro a la izquierda para legibilidad) */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--smt-blue-dark))]/95 via-[hsl(var(--smt-blue))]/85 to-[hsl(var(--smt-sky))]/70"
        />
        <div className="absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-[hsl(var(--smt-yellow))]/15 blur-3xl" />
        <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-5">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-white/70">Panel de gestión</p>
            <h1 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight">
              Reuniones de la Intendencia
            </h1>
            <p className="mt-2 text-white/80 text-sm md:text-base max-w-xl">
              Visualizá y gestioná las solicitudes de audiencias y reuniones del despacho.
            </p>
          </div>
          <Button asChild size="lg" variant="secondary" className="bg-white text-[hsl(var(--smt-blue-dark))] hover:bg-white/90 shadow-sm">
            <Link href="/nueva-solicitud"><PlusCircle className="h-5 w-5" /> Nueva solicitud</Link>
          </Button>
        </div>
      </section>

      {/* Stats */}
      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={Clock}
          label="Reuniones de hoy"
          value={reunionesHoy.length}
          descripcion="Agendadas para el día de hoy"
          href="/calendario"
          theme={{
            border: "border-l-[hsl(var(--smt-blue))]",
            bg: "bg-[hsl(var(--smt-blue))]/[0.05]",
            iconBg: "bg-[hsl(var(--smt-blue))]/10",
            iconText: "text-[hsl(var(--smt-blue))]",
            value: "text-[hsl(var(--smt-blue))]",
          }}
        />
        <StatCard
          icon={CalendarDays}
          label="Próximas reuniones"
          value={proximas.length}
          descripcion="Agendadas para los próximos días"
          href="/calendario"
          theme={{
            border: "border-l-[hsl(var(--smt-sky))]",
            bg: "bg-[hsl(var(--smt-sky))]/[0.06]",
            iconBg: "bg-[hsl(var(--smt-sky))]/15",
            iconText: "text-[hsl(var(--smt-sky))]",
            value: "text-[hsl(var(--smt-sky))]",
          }}
        />
        <StatCard
          icon={AlertCircle}
          label="Solicitudes pendientes"
          value={pendientes.length}
          descripcion="Esperan respuesta del despacho"
          href="/solicitudes?estado=pendiente"
          theme={{
            border: "border-l-amber-400",
            bg: "bg-amber-50/70",
            iconBg: "bg-amber-100",
            iconText: "text-amber-700",
            value: "text-amber-700",
          }}
        />
      </section>

      {/* Listas */}
      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/70">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Agenda</p>
              <CardTitle className="mt-0.5 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[hsl(var(--smt-blue))]" />
                Hoy
              </CardTitle>
            </div>
            <Link href="/calendario" className="text-sm text-[hsl(var(--smt-blue))] hover:underline inline-flex items-center gap-1">
              Ver calendario <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            {reunionesHoy.length === 0 ? (
              <EmptyMsg texto="No hay reuniones agendadas para hoy." />
            ) : (
              <ul className="divide-y divide-border/70">
                {reunionesHoy.map((s) => (
                  <ItemFila key={s.id} solicitud={s} onClick={() => setSel(s)} mostrarHora />
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Próximos días</p>
              <CardTitle className="mt-0.5 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[hsl(var(--smt-sky))]" />
                Próximas reuniones
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {proximas.length === 0 ? (
              <EmptyMsg texto="No hay próximas reuniones agendadas." />
            ) : (
              <ul className="divide-y divide-border/70">
                {proximas.map((s) => <ItemFila key={s.id} solicitud={s} onClick={() => setSel(s)} mostrarFecha />)}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className="border-border/70">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Por responder</p>
              <CardTitle className="mt-0.5 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                Solicitudes pendientes
                {pendientesNuevas > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 text-[11px] font-semibold">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                    {pendientesNuevas} {pendientesNuevas === 1 ? "nueva" : "nuevas"}
                  </span>
                )}
              </CardTitle>
            </div>
            <Link href="/solicitudes?estado=pendiente" className="text-sm text-[hsl(var(--smt-blue))] hover:underline inline-flex items-center gap-1">
              Ver todas <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent>
            {pendientes.length === 0 ? (
              <EmptyMsg texto="No hay solicitudes pendientes de respuesta." icon={ClipboardList} />
            ) : (
              <ul className="divide-y divide-border/70">
                {pendientes.slice(0, 5).map((s) => <ItemFila key={s.id} solicitud={s} onClick={() => setSel(s)} mostrarFecha />)}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>

      <DetalleSolicitud solicitud={sel} open={!!sel} onOpenChange={(v) => !v && setSel(null)} />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, descripcion, href, theme }: {
  icon: any; label: string; value: number; descripcion: string; href: string;
  theme: { border: string; bg: string; iconBg: string; iconText: string; value: string };
}) {
  return (
    <Link href={href} className="group block">
      <Card className={`border-border/70 border-l-4 ${theme.border} ${theme.bg} transition-all hover:shadow-md hover:-translate-y-0.5`}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${theme.iconBg} ${theme.iconText}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{label}</p>
              <p className={`text-3xl font-semibold leading-none mt-1.5 tracking-tight ${theme.value}`}>{value}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
            {descripcion}
            <ArrowRight className="h-3 w-3 -translate-x-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

function ItemFila({ solicitud, onClick, mostrarHora, mostrarFecha }: {
  solicitud: Solicitud; onClick: () => void; mostrarHora?: boolean; mostrarFecha?: boolean;
}) {
  const nueva = solicitud.estado === "pendiente" && esReciente(solicitud.creadaEn);
  return (
    <li>
      <button
        onClick={onClick}
        className={cn(
          "w-full flex items-center gap-4 py-3.5 text-left -mx-2 px-2 rounded-lg transition-colors",
          nueva ? "bg-amber-50 hover:bg-amber-100/70 border-l-2 border-amber-400" : "hover:bg-accent/40"
        )}
      >
        {mostrarHora && solicitud.hora && (
          <div className="text-sm font-semibold w-14 text-[hsl(var(--smt-blue))] tabular-nums">{solicitud.hora}</div>
        )}
        {mostrarFecha && (
          <div className="text-xs text-muted-foreground w-20 tabular-nums">
            {new Date(solicitud.fecha + "T00:00:00").toLocaleDateString("es-AR", { day: "2-digit", month: "short" })}
            {solicitud.hora ? ` · ${solicitud.hora}` : ""}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate text-foreground flex items-center gap-2">
            <span className="truncate">{solicitud.solicitante}</span>
            {nueva && (
              <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                Nuevo
              </span>
            )}
          </p>
          <p className="text-sm text-muted-foreground truncate">{solicitud.motivo}</p>
        </div>
        <EstadoBadge estado={solicitud.estado} />
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </button>
    </li>
  );
}

function EmptyMsg({ texto, icon: Icon = CalendarDays }: { texto: string; icon?: any }) {
  return (
    <div className="py-10 text-center text-muted-foreground">
      <Icon className="h-8 w-8 mx-auto mb-2 opacity-40" />
      <p className="text-sm">{texto}</p>
    </div>
  );
}

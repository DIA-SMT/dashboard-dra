"use client";
import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EstadoBadge } from "@/components/estado-badge";
import { DetalleSolicitud } from "@/components/detalle-solicitud";
import { useStore } from "@/lib/store";
import { ESTADOS, EstadoSolicitud, Solicitud } from "@/lib/types";
import { cn, esReciente } from "@/lib/utils";
import { PlusCircle, Search, Pencil } from "lucide-react";

function PillNueva() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
      Nuevo
    </span>
  );
}

type FiltroEstado = EstadoSolicitud | "todos";

function Inner() {
  const params = useSearchParams();
  const inicial = (params.get("estado") as FiltroEstado | null) ?? "todos";
  const { solicitudes } = useStore();
  const [estado, setEstado] = React.useState<FiltroEstado>(inicial);
  const [q, setQ] = React.useState("");
  const [sel, setSel] = React.useState<Solicitud | null>(null);

  const filtradas = React.useMemo(() => {
    const term = q.trim().toLowerCase();
    return solicitudes
      .filter((s) => (estado === "todos" ? true : s.estado === estado))
      .filter((s) =>
        !term ? true :
        s.solicitante.toLowerCase().includes(term) ||
        s.motivo.toLowerCase().includes(term) ||
        (s.institucion ?? "").toLowerCase().includes(term)
      );
    // `solicitudes` ya viene del store ordenado por fecha de solicitud (más reciente primero).
    // No reordenamos por fecha propuesta para respetar el orden en que llegaron los pedidos.
  }, [solicitudes, estado, q]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Listado</p>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mt-1">Solicitudes</h1>
          <p className="text-muted-foreground mt-1.5 text-sm">Todos los pedidos de reuniones registrados.</p>
        </div>
        <Button asChild size="lg"><Link href="/nueva-solicitud"><PlusCircle className="h-5 w-5" /> Nueva solicitud</Link></Button>
      </header>

      <Card>
        <CardContent className="pt-6 flex flex-col md:flex-row gap-3 md:items-center">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por solicitante, motivo o institución" className="pl-9" />
          </div>
          <div className="md:w-56">
            <Select value={estado} onValueChange={(v) => setEstado(v as FiltroEstado)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                {ESTADOS.map((e) => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {filtradas.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">No hay solicitudes que coincidan con el filtro.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Solicitante</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Motivo</th>
                  <th className="text-left px-4 py-3 font-medium">Fecha</th>
                  <th className="text-left px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtradas.map((s) => {
                  const nueva = s.estado === "pendiente" && esReciente(s.creadaEn);
                  return (
                  <tr key={s.id} className={cn("hover:bg-accent/40", nueva && "bg-amber-50/60")}>
                    <td className="px-4 py-3 font-medium">
                      <div className="flex items-center gap-2">
                        <span>{s.solicitante}</span>
                        {nueva && <PillNueva />}
                      </div>
                      {s.institucion && <div className="text-xs text-muted-foreground">{s.institucion}</div>}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell max-w-xs">
                      <p className="line-clamp-2 text-muted-foreground">{s.motivo}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {new Date(s.fecha + "T00:00:00").toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "2-digit" })}
                      {s.hora && <div className="text-xs text-muted-foreground">{s.hora} hs</div>}
                    </td>
                    <td className="px-4 py-3"><EstadoBadge estado={s.estado} /></td>
                    <td className="px-4 py-3 text-right">
                      <Button size="sm" variant="outline" onClick={() => setSel(s)} aria-label="Editar">
                        <Pencil className="h-4 w-4" /> <span className="hidden sm:inline">Editar</span>
                      </Button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <DetalleSolicitud solicitud={sel} open={!!sel} onOpenChange={(v) => !v && setSel(null)} />
    </div>
  );
}

export default function SolicitudesPage() {
  return (
    <React.Suspense fallback={<div className="text-muted-foreground">Cargando...</div>}>
      <Inner />
    </React.Suspense>
  );
}

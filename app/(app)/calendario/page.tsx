"use client";
import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DetalleSolicitud } from "@/components/detalle-solicitud";
import { useStore } from "@/lib/store";
import { Solicitud } from "@/lib/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const DIAS = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];

function toISO(d: Date) {
  const y = d.getFullYear(); const m = String(d.getMonth()+1).padStart(2,"0"); const day = String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${day}`;
}

export default function CalendarioPage() {
  const { solicitudes } = useStore();
  const [cursor, setCursor] = React.useState(() => { const d = new Date(); d.setDate(1); return d; });
  const [sel, setSel] = React.useState<Solicitud | null>(null);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const primerDia = new Date(year, month, 1);
  const offset = (primerDia.getDay() + 6) % 7;
  const diasMes = new Date(year, month + 1, 0).getDate();
  const hoyISO = toISO(new Date());

  const celdas: (Date | null)[] = [];
  for (let i = 0; i < offset; i++) celdas.push(null);
  for (let d = 1; d <= diasMes; d++) celdas.push(new Date(year, month, d));
  while (celdas.length % 7 !== 0) celdas.push(null);

  const porFecha = React.useMemo(() => {
    const map = new Map<string, Solicitud[]>();
    solicitudes.filter((s) => s.estado === "agendada" || s.estado === "realizada").forEach((s) => {
      const arr = map.get(s.fecha) ?? [];
      arr.push(s);
      map.set(s.fecha, arr);
    });
    map.forEach((arr) => arr.sort((a, b) => (a.hora ?? "").localeCompare(b.hora ?? "")));
    return map;
  }, [solicitudes]);

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Vista mensual</p>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mt-1">Calendario</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setCursor(new Date(year, month - 1, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-[120px] sm:min-w-[200px] text-center font-semibold text-base sm:text-lg capitalize">
            {MESES[month]} <span className="text-muted-foreground font-normal">{year}</span>
          </div>
          <Button variant="outline" size="icon" onClick={() => setCursor(new Date(year, month + 1, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => { const d = new Date(); d.setDate(1); setCursor(d); }}>
            Hoy
          </Button>
        </div>
      </header>

      <Card className="border-border/70 overflow-hidden">
        <CardContent className="p-0">
          <div className="grid grid-cols-7 border-b bg-muted/40">
            {DIAS.map((d) => (
              <div key={d} className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground py-3 text-center">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {celdas.map((date, i) => {
              const colEnd = (i + 1) % 7 !== 0;
              const lastRow = i >= celdas.length - 7;
              if (!date) {
                return <div key={i} className={cn("min-h-[78px] sm:min-h-[110px] md:min-h-[128px] bg-muted/20", colEnd && "border-r", !lastRow && "border-b")} />;
              }
              const iso = toISO(date);
              const items = porFecha.get(iso) ?? [];
              const isHoy = iso === hoyISO;
              return (
                <div
                  key={i}
                  className={cn(
                    "min-h-[78px] sm:min-h-[110px] md:min-h-[128px] p-1.5 sm:p-2 flex flex-col gap-1 transition-colors",
                    isHoy && "bg-[hsl(var(--smt-blue))]/[0.04]",
                    colEnd && "border-r",
                    !lastRow && "border-b"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className={cn(
                      "text-xs font-semibold w-7 h-7 flex items-center justify-center rounded-full tabular-nums",
                      isHoy ? "bg-[hsl(var(--smt-blue))] text-white shadow-sm" : "text-foreground"
                    )}>{date.getDate()}</div>
                    {items.length > 0 && (
                      <span className="text-[10px] font-medium text-muted-foreground">{items.length}</span>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col gap-1 overflow-hidden">
                    {items.slice(0, 3).map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSel(s)}
                        className="text-left text-[11px] leading-tight bg-white hover:bg-[hsl(var(--smt-blue))]/5 border-l-2 border-[hsl(var(--smt-blue))] shadow-sm rounded-sm pl-1.5 pr-1 py-1 truncate transition-colors"
                        title={`${s.hora ?? ""} ${s.solicitante}`}
                      >
                        {s.hora && <span className="font-semibold mr-1 text-[hsl(var(--smt-blue))] tabular-nums">{s.hora}</span>}
                        <span className="text-foreground">{s.solicitante}</span>
                      </button>
                    ))}
                    {items.length > 3 && (
                      <span className="text-[10px] text-muted-foreground px-1">+{items.length - 3} más</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <DetalleSolicitud solicitud={sel} open={!!sel} onOpenChange={(v) => !v && setSel(null)} />
    </div>
  );
}

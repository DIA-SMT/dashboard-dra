"use client";
import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EstadoBadge } from "./estado-badge";
import { ESTADOS, EstadoSolicitud, Solicitud } from "@/lib/types";
import { useStore } from "@/lib/store";
import { Calendar, Mail, Building, FileText, Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

function fmtFecha(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-AR", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric",
  });
}

export function DetalleSolicitud({
  solicitud,
  open,
  onOpenChange,
}: {
  solicitud: Solicitud | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { actualizar, solicitudes } = useStore();
  const [flash, setFlash] = React.useState(false);
  const [motivoNR, setMotivoNR] = React.useState("");
  const flashTimer = React.useRef<NodeJS.Timeout | null>(null);

  const actual = solicitud ? solicitudes.find((s) => s.id === solicitud.id) ?? solicitud : null;

  // Sincronizar el campo de motivo cuando se abre el modal o cambia la solicitud actual
  React.useEffect(() => {
    if (actual) setMotivoNR(actual.motivoNoRealizada ?? "");
  }, [actual?.id, actual?.motivoNoRealizada]);

  React.useEffect(() => {
    if (!open) setFlash(false);
  }, [open]);

  if (!actual) return null;

  const triggerFlash = () => {
    setFlash(true);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlash(false), 1800);
  };

  const cambiarEstado = (v: EstadoSolicitud) => {
    if (v === actual.estado) return;
    // Al salir de no_realizada limpiamos el motivo previo
    const patch: Partial<Solicitud> = { estado: v };
    if (actual.estado === "no_realizada" && v !== "no_realizada") {
      patch.motivoNoRealizada = undefined;
      setMotivoNR("");
    }
    actualizar(actual.id, patch);
    triggerFlash();
  };

  const guardarMotivo = () => {
    actualizar(actual.id, { motivoNoRealizada: motivoNR.trim() || undefined });
    triggerFlash();
  };

  const motivoCambio = (motivoNR.trim() || "") !== (actual.motivoNoRealizada ?? "");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{actual.solicitante}</DialogTitle>
          <div className="pt-1"><EstadoBadge estado={actual.estado} /></div>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="flex items-start gap-3">
            <FileText className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div><p className="text-xs text-muted-foreground">Motivo</p><p>{actual.motivo}</p></div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Fecha</p>
              <p className="capitalize">{fmtFecha(actual.fecha)}{actual.hora ? ` · ${actual.hora} hs` : ""}</p>
            </div>
          </div>
          {actual.contacto && (
            <div className="flex items-start gap-3">
              <Mail className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div><p className="text-xs text-muted-foreground">Contacto</p><p>{actual.contacto}</p></div>
            </div>
          )}
          {actual.institucion && (
            <div className="flex items-start gap-3">
              <Building className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div><p className="text-xs text-muted-foreground">Institución / Área</p><p>{actual.institucion}</p></div>
            </div>
          )}
          {actual.observaciones && (
            <div className="rounded-md bg-muted p-3">
              <p className="text-xs text-muted-foreground mb-1">Observaciones</p>
              <p>{actual.observaciones}</p>
            </div>
          )}
          {actual.estado === "no_realizada" && actual.motivoNoRealizada && (
            <div className="rounded-md bg-rose-50 border border-rose-200/70 p-3">
              <p className="text-xs text-rose-700 font-medium flex items-center gap-1 mb-1">
                <AlertCircle className="h-3.5 w-3.5" /> Motivo de no realización
              </p>
              <p className="text-rose-900">{actual.motivoNoRealizada}</p>
            </div>
          )}

          <div className="pt-3 border-t space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Cambiar estado</p>
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-xs font-medium text-emerald-700 transition-opacity",
                  flash ? "opacity-100" : "opacity-0"
                )}
                aria-live="polite"
              >
                <Check className="h-3.5 w-3.5" /> Guardado
              </span>
            </div>
            <Select value={actual.estado} onValueChange={(v) => cambiarEstado(v as EstadoSolicitud)}>
              <SelectTrigger
                className={cn("transition-all", flash && "ring-2 ring-emerald-400/60 border-emerald-300")}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ESTADOS.map((e) => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}
              </SelectContent>
            </Select>

            {actual.estado === "no_realizada" && (
              <div className="space-y-2 rounded-md border border-rose-200/70 bg-rose-50/40 p-3">
                <label className="text-xs font-medium text-rose-800">
                  ¿Por qué no se realizó? <span className="text-rose-500">*</span>
                </label>
                <Textarea
                  value={motivoNR}
                  onChange={(e) => setMotivoNR(e.target.value)}
                  placeholder="Ej. El solicitante no se presentó / Se derivó a otra área / Cancelada por la intendente..."
                  className="bg-white"
                />
                <div className="flex justify-end">
                  <Button size="sm" onClick={guardarMotivo} disabled={!motivoCambio}>
                    Guardar motivo
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild><Button variant="outline">Cerrar</Button></DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

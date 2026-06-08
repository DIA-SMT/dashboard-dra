"use client";
import * as React from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AlertCircle, CalendarCheck, Send, Plus, X } from "lucide-react";

type OpcionFecha = { fecha: string; hora: string };
type DatosSolicitud = { solicitante: string; motivo: string; contacto: string; institucion: string };

function fmtFechaCorta(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-AR", {
    weekday: "long", day: "2-digit", month: "long",
  });
}

export default function SolicitarPage() {
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [enviada, setEnviada] = React.useState(false);
  const [opciones, setOpciones] = React.useState<OpcionFecha[]>([{ fecha: "", hora: "" }]);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [datos, setDatos] = React.useState<DatosSolicitud | null>(null);

  const actualizarOpcion = (i: number, campo: keyof OpcionFecha, valor: string) =>
    setOpciones((prev) => prev.map((o, idx) => (idx === i ? { ...o, [campo]: valor } : o)));
  const agregarOpcion = () => setOpciones((prev) => [...prev, { fecha: "", hora: "" }]);
  const quitarOpcion = (i: number) => setOpciones((prev) => prev.filter((_, idx) => idx !== i));

  const propuestasValidas = () =>
    opciones.filter((o) => o.fecha).map((o) => ({ fecha: o.fecha, hora: o.hora || null }));

  function reiniciar() {
    setOpciones([{ fecha: "", hora: "" }]);
    setDatos(null);
    setEnviada(false);
  }

  // Paso 1: validar y abrir el diálogo de confirmación
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (propuestasValidas().length === 0) {
      setError("Agregá al menos una fecha propuesta para la reunión.");
      return;
    }

    const fd = new FormData(e.currentTarget);
    setDatos({
      solicitante: String(fd.get("solicitante") ?? "").trim(),
      motivo: String(fd.get("motivo") ?? "").trim(),
      contacto: String(fd.get("contacto") ?? "").trim(),
      institucion: String(fd.get("institucion") ?? "").trim(),
    });
    setConfirmOpen(true);
  }

  // Paso 2: el usuario confirma → registramos la solicitud
  async function confirmarEnvio() {
    if (!datos) return;
    const propuestas = propuestasValidas();
    if (propuestas.length === 0) return;

    setSubmitting(true);
    const { error } = await supabase.from("solicitudes").insert({
      solicitante: datos.solicitante,
      motivo: datos.motivo,
      // La primera opción queda como fecha/hora principal mientras está pendiente
      fecha: propuestas[0].fecha,
      hora: propuestas[0].hora,
      fechas_propuestas: propuestas,
      contacto: datos.contacto || null,
      institucion: datos.institucion || null,
      estado: "pendiente",
    });
    setSubmitting(false);
    if (error) {
      setConfirmOpen(false);
      setError("No pudimos registrar tu solicitud. Intentá nuevamente en unos minutos.");
      return;
    }
    setConfirmOpen(false);
    setEnviada(true);
  }

  return (
    <div className="min-h-screen bg-app px-4 py-10 md:py-14">
      <div className="w-full max-w-2xl mx-auto">
        {/* Encabezado institucional */}
        <div className="flex flex-col items-center gap-3 mb-8 text-center">
          <div className="h-14 w-14 rounded-2xl bg-smt-blue-dark flex items-center justify-center shadow-sm">
            <Image src="/logos/logoMuni-sm.png" alt="SMT" width={40} height={40} className="h-10 w-10" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Municipalidad de San Miguel de Tucumán</p>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mt-1">Solicitud de reunión con la Intendenta</h1>
          </div>
        </div>

        {enviada ? (
          <Card className="border-border/70 shadow-sm">
            <CardContent className="py-12 text-center">
              <div className="h-14 w-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                <CalendarCheck className="h-7 w-7" />
              </div>
              <h2 className="text-xl font-semibold tracking-tight">¡Solicitud enviada!</h2>
              <p className="text-muted-foreground mt-2 text-sm max-w-md mx-auto">
                Recibimos tu pedido de reunión. El equipo de la intendencia lo revisará y se
                comunicará con vos por el contacto que dejaste para confirmar día y horario.
              </p>
              <Button
                variant="outline"
                size="lg"
                className="mt-6"
                onClick={reiniciar}
              >
                Cargar otra solicitud
              </Button>
            </CardContent>
          </Card>
        ) : (
          <form onSubmit={handleSubmit}>
            <Card className="border-border/70 shadow-sm">
              <CardHeader>
                <CardTitle>Datos de la solicitud</CardTitle>
                <CardDescription>
                  Completá el formulario y nos comunicaremos con vos para confirmar la reunión.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="solicitante">Nombre y apellido *</Label>
                  <Input id="solicitante" name="solicitante" required placeholder="Ej. Juan Pérez" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contacto">Teléfono de contacto *</Label>
                  <Input id="contacto" name="contacto" type="tel" required placeholder="Ej. 381 5123456" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="institucion">Institución / área (opcional)</Label>
                  <Input id="institucion" name="institucion" placeholder="Ej. Centro Cultural, vecino, etc." />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="motivo">Motivo de la reunión *</Label>
                  <Textarea id="motivo" name="motivo" required placeholder="Detallá el motivo del pedido" />
                  <p className="text-xs text-muted-foreground">
                    El motivo debe ser detallado debidamente para poder ser tratado y concedido.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Fechas propuestas *</Label>
                  <p className="text-xs text-muted-foreground">
                    Proponé una o más opciones de día y horario. El equipo confirmará una según la
                    disponibilidad de la Intendenta.
                  </p>
                  <div className="space-y-3 pt-1">
                    {opciones.map((o, i) => (
                      <div key={i} className="flex items-end gap-2">
                        <div className="flex-1 space-y-1.5">
                          <Label htmlFor={`fecha-${i}`} className="text-xs text-muted-foreground">
                            {i === 0 ? "Opción 1 (preferida)" : `Opción ${i + 1}`}
                          </Label>
                          <Input
                            id={`fecha-${i}`}
                            type="date"
                            value={o.fecha}
                            onChange={(e) => actualizarOpcion(i, "fecha", e.target.value)}
                            required={i === 0}
                          />
                        </div>
                        <div className="w-32 space-y-1.5">
                          <Label htmlFor={`hora-${i}`} className="text-xs text-muted-foreground">
                            Hora (opc.)
                          </Label>
                          <Input
                            id={`hora-${i}`}
                            type="time"
                            value={o.hora}
                            onChange={(e) => actualizarOpcion(i, "hora", e.target.value)}
                          />
                        </div>
                        {opciones.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-rose-600"
                            onClick={() => quitarOpcion(i)}
                            aria-label="Quitar esta opción"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-1"
                    onClick={agregarOpcion}
                  >
                    <Plus className="h-4 w-4" /> Agregar otra fecha
                  </Button>
                </div>

                {error && (
                  <div className="flex items-start gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end mt-6">
              <Button type="submit" size="lg" disabled={submitting}>
                {submitting ? (
                  <>Enviando…</>
                ) : (
                  <><Send className="h-5 w-5" /> Enviar solicitud</>
                )}
              </Button>
            </div>
          </form>
        )}

        <p className="mt-8 text-center text-xs text-muted-foreground">
          La fecha y hora son una propuesta. El equipo de la intendencia confirmará la disponibilidad.
        </p>
      </div>

      <Dialog open={confirmOpen} onOpenChange={(v) => !submitting && setConfirmOpen(v)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar solicitud</DialogTitle>
            <DialogDescription>
              Revisá los datos antes de enviar. Una vez confirmada, el equipo de la intendencia se
              comunicará por teléfono.
            </DialogDescription>
          </DialogHeader>

          {datos && (
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Solicitante</p>
                <p className="font-medium">{datos.solicitante}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Teléfono de contacto</p>
                <p>{datos.contacto}</p>
              </div>
              {datos.institucion && (
                <div>
                  <p className="text-xs text-muted-foreground">Institución / área</p>
                  <p>{datos.institucion}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground">Motivo</p>
                <p className="whitespace-pre-wrap">{datos.motivo}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Fechas propuestas</p>
                <ul className="mt-1 space-y-1">
                  {propuestasValidas().map((p, i) => (
                    <li key={i} className="capitalize">
                      • {fmtFechaCorta(p.fecha)}{p.hora ? ` · ${p.hora} hs` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={submitting}
            >
              Revisar
            </Button>
            <Button type="button" onClick={confirmarEnvio} disabled={submitting}>
              {submitting ? <>Enviando…</> : <><Send className="h-5 w-5" /> Confirmar y enviar</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

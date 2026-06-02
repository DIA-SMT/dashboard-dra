"use client";
import * as React from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Check, CalendarCheck, Send } from "lucide-react";

export default function SolicitarPage() {
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [enviada, setEnviada] = React.useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    const { error } = await supabase.from("solicitudes").insert({
      solicitante: String(fd.get("solicitante") ?? "").trim(),
      motivo: String(fd.get("motivo") ?? "").trim(),
      fecha: String(fd.get("fecha") ?? ""),
      hora: String(fd.get("hora") ?? "") || null,
      contacto: String(fd.get("contacto") ?? "").trim() || null,
      institucion: String(fd.get("institucion") ?? "").trim() || null,
      estado: "pendiente",
    });
    setSubmitting(false);
    if (error) {
      setError("No pudimos registrar tu solicitud. Intentá nuevamente en unos minutos.");
      return;
    }
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
                onClick={() => setEnviada(false)}
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
                  <Label htmlFor="contacto">Teléfono o email de contacto *</Label>
                  <Input id="contacto" name="contacto" required placeholder="Ej. 3815-123456 o mail@..." />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="institucion">Institución / área (opcional)</Label>
                  <Input id="institucion" name="institucion" placeholder="Ej. Centro Cultural, vecino, etc." />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="motivo">Motivo de la reunión *</Label>
                  <Textarea id="motivo" name="motivo" required placeholder="Contanos brevemente el motivo del pedido" />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fecha">Fecha propuesta *</Label>
                    <Input id="fecha" name="fecha" type="date" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hora">Hora preferida (opcional)</Label>
                    <Input id="hora" name="hora" type="time" />
                  </div>
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
    </div>
  );
}

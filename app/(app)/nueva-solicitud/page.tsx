"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore } from "@/lib/store";
import { ESTADOS, EstadoSolicitud } from "@/lib/types";
import { ArrowLeft, Check } from "lucide-react";

export default function NuevaSolicitudPage() {
  const router = useRouter();
  const { agregar } = useStore();
  const [estado, setEstado] = React.useState<EstadoSolicitud>("pendiente");
  const [submitting, setSubmitting] = React.useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    try {
      await agregar({
        solicitante: String(fd.get("solicitante") ?? ""),
        motivo: String(fd.get("motivo") ?? ""),
        fecha: String(fd.get("fecha") ?? ""),
        hora: String(fd.get("hora") ?? "") || undefined,
        estado,
        contacto: String(fd.get("contacto") ?? "") || undefined,
        institucion: String(fd.get("institucion") ?? "") || undefined,
        observaciones: String(fd.get("observaciones") ?? "") || undefined,
      });
      router.push("/solicitudes");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3">
          <ArrowLeft className="h-4 w-4" /> Volver al inicio
        </Link>
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Registro</p>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mt-1">Nueva solicitud</h1>
        <p className="text-muted-foreground mt-1.5 text-sm">Cargá los datos del pedido de reunión.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Datos obligatorios</CardTitle>
            <CardDescription>Información mínima para registrar la solicitud.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="solicitante">Nombre del solicitante *</Label>
              <Input id="solicitante" name="solicitante" required placeholder="Ej. Juan Pérez" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="motivo">Motivo de la reunión *</Label>
              <Textarea id="motivo" name="motivo" required placeholder="Breve descripción del motivo" />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fecha">Fecha propuesta *</Label>
                <Input id="fecha" name="fecha" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hora">Hora (opcional)</Label>
                <Input id="hora" name="hora" type="time" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Estado *</Label>
              <Select value={estado} onValueChange={(v) => setEstado(v as EstadoSolicitud)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ESTADOS.map((e) => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Datos opcionales</CardTitle>
            <CardDescription>Información adicional útil para el seguimiento.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contacto">Teléfono o email</Label>
                <Input id="contacto" name="contacto" placeholder="Ej. 3415-123456 o mail@..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="institucion">Institución / área</Label>
                <Input id="institucion" name="institucion" placeholder="Ej. Centro Cultural" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea id="observaciones" name="observaciones" placeholder="Notas internas, contexto, etc." />
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-6">
          <Button type="button" variant="outline" size="lg" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" size="lg" disabled={submitting}>
            <Check className="h-5 w-5" /> Guardar solicitud
          </Button>
        </div>
      </form>
    </div>
  );
}

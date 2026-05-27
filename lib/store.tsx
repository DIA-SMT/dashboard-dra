"use client";
import * as React from "react";
import { Solicitud } from "./types";
import { supabase, SolicitudRow } from "./supabase";

interface StoreCtx {
  solicitudes: Solicitud[];
  loading: boolean;
  error: string | null;
  agregar: (s: Omit<Solicitud, "id" | "creadaEn">) => Promise<void>;
  actualizar: (id: string, s: Partial<Solicitud>) => Promise<void>;
  recargar: () => Promise<void>;
}

const Ctx = React.createContext<StoreCtx | null>(null);

function fromRow(r: SolicitudRow): Solicitud {
  return {
    id: r.id,
    solicitante: r.solicitante,
    motivo: r.motivo,
    fecha: r.fecha,
    hora: r.hora ?? undefined,
    estado: r.estado,
    contacto: r.contacto ?? undefined,
    institucion: r.institucion ?? undefined,
    observaciones: r.observaciones ?? undefined,
    motivoNoRealizada: r.motivo_no_realizada ?? undefined,
    creadaEn: r.creada_en.slice(0, 10),
  };
}

// Mapeo camelCase -> snake_case para inserts/updates parciales
function toRow(s: Partial<Solicitud>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (s.solicitante !== undefined) out.solicitante = s.solicitante;
  if (s.motivo !== undefined) out.motivo = s.motivo;
  if (s.fecha !== undefined) out.fecha = s.fecha;
  if (s.hora !== undefined) out.hora = s.hora ?? null;
  if (s.estado !== undefined) out.estado = s.estado;
  if (s.contacto !== undefined) out.contacto = s.contacto ?? null;
  if (s.institucion !== undefined) out.institucion = s.institucion ?? null;
  if (s.observaciones !== undefined) out.observaciones = s.observaciones ?? null;
  if (s.motivoNoRealizada !== undefined) out.motivo_no_realizada = s.motivoNoRealizada ?? null;
  return out;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [solicitudes, setSolicitudes] = React.useState<Solicitud[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const recargar = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("solicitudes")
      .select("*")
      .order("fecha", { ascending: false })
      .order("hora", { ascending: true, nullsFirst: false });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    setSolicitudes((data as SolicitudRow[]).map(fromRow));
    setLoading(false);
  }, []);

  React.useEffect(() => {
    recargar();
  }, [recargar]);

  const agregar = React.useCallback(async (s: Omit<Solicitud, "id" | "creadaEn">) => {
    const { data, error } = await supabase
      .from("solicitudes")
      .insert(toRow(s))
      .select("*")
      .single();
    if (error) {
      setError(error.message);
      return;
    }
    setSolicitudes((prev) => [fromRow(data as SolicitudRow), ...prev]);
  }, []);

  const actualizar = React.useCallback(async (id: string, patch: Partial<Solicitud>) => {
    // Update optimista
    setSolicitudes((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    const { data, error } = await supabase
      .from("solicitudes")
      .update(toRow(patch))
      .eq("id", id)
      .select("*")
      .single();
    if (error) {
      setError(error.message);
      // recargar para recuperar el estado real
      recargar();
      return;
    }
    setSolicitudes((prev) => prev.map((s) => (s.id === id ? fromRow(data as SolicitudRow) : s)));
  }, [recargar]);

  return (
    <Ctx.Provider value={{ solicitudes, loading, error, agregar, actualizar, recargar }}>
      {children}
    </Ctx.Provider>
  );
}

export function useStore() {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useStore debe usarse dentro de StoreProvider");
  return ctx;
}

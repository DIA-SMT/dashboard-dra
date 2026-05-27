"use client";
import { createBrowserClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anon) {
  throw new Error(
    "Faltan variables de entorno NEXT_PUBLIC_SUPABASE_URL y/o NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
}

export const supabase = createBrowserClient(url, anon);

export interface SolicitudRow {
  id: string;
  solicitante: string;
  motivo: string;
  fecha: string;
  hora: string | null;
  estado: "pendiente" | "agendada" | "realizada" | "no_realizada";
  contacto: string | null;
  institucion: string | null;
  observaciones: string | null;
  motivo_no_realizada: string | null;
  creada_en: string;
  actualizada_en: string;
}

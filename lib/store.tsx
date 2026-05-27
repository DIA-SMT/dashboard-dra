"use client";
import * as React from "react";
import { Solicitud } from "./types";
import { solicitudesMock } from "./mock-data";

interface StoreCtx {
  solicitudes: Solicitud[];
  agregar: (s: Omit<Solicitud, "id" | "creadaEn">) => void;
  actualizar: (id: string, s: Partial<Solicitud>) => void;
}

const Ctx = React.createContext<StoreCtx | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [solicitudes, setSolicitudes] = React.useState<Solicitud[]>(solicitudesMock);

  const agregar = React.useCallback((s: Omit<Solicitud, "id" | "creadaEn">) => {
    setSolicitudes((prev) => [
      { ...s, id: crypto.randomUUID(), creadaEn: new Date().toISOString().slice(0, 10) },
      ...prev,
    ]);
  }, []);

  const actualizar = React.useCallback((id: string, patch: Partial<Solicitud>) => {
    setSolicitudes((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }, []);

  return <Ctx.Provider value={{ solicitudes, agregar, actualizar }}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useStore debe usarse dentro de StoreProvider");
  return ctx;
}

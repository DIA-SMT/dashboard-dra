export type EstadoSolicitud = "pendiente" | "agendada" | "realizada" | "no_realizada";

export interface FechaPropuesta {
  fecha: string; // ISO date string
  hora?: string; // HH:mm
}

export interface Solicitud {
  id: string;
  solicitante: string;
  motivo: string;
  fecha: string; // ISO date string — fecha confirmada / principal
  hora?: string; // HH:mm
  fechasPropuestas?: FechaPropuesta[]; // opciones propuestas por el solicitante
  estado: EstadoSolicitud;
  contacto?: string;
  institucion?: string;
  observaciones?: string;
  motivoNoRealizada?: string;
  creadaEn: string;
}

export const ESTADOS: { value: EstadoSolicitud; label: string }[] = [
  { value: "pendiente", label: "Pendiente" },
  { value: "agendada", label: "Agendada" },
  { value: "realizada", label: "Realizada" },
  { value: "no_realizada", label: "No realizada" },
];

export const estadoStyles: Record<EstadoSolicitud, string> = {
  pendiente: "bg-amber-50 text-amber-800 border-amber-200/70",
  agendada: "bg-sky-50 text-sky-800 border-sky-200/70",
  realizada: "bg-emerald-50 text-emerald-800 border-emerald-200/70",
  no_realizada: "bg-rose-50 text-rose-700 border-rose-200/70",
};

export const estadoDot: Record<EstadoSolicitud, string> = {
  pendiente: "bg-amber-500",
  agendada: "bg-sky-500",
  realizada: "bg-emerald-500",
  no_realizada: "bg-rose-500",
};

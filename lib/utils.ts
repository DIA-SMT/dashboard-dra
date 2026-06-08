import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Devuelve true si una fecha ISO (yyyy-mm-dd) es de hoy o de los últimos `dias` días.
// Se usa para destacar las solicitudes que recién llegaron.
export function esReciente(isoDate: string, dias = 2): boolean {
  if (!isoDate) return false;
  const [y, m, d] = isoDate.split("-").map(Number);
  if (!y || !m || !d) return false;
  const fecha = new Date(y, m - 1, d);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const diff = (hoy.getTime() - fecha.getTime()) / 86_400_000;
  return diff >= 0 && diff <= dias;
}

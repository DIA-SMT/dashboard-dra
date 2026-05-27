import { Badge } from "@/components/ui/badge";
import { EstadoSolicitud, estadoStyles, estadoDot, ESTADOS } from "@/lib/types";
import { cn } from "@/lib/utils";

export function EstadoBadge({ estado, className }: { estado: EstadoSolicitud; className?: string }) {
  const label = ESTADOS.find((e) => e.value === estado)?.label ?? estado;
  return (
    <Badge className={cn("gap-1.5 font-medium", estadoStyles[estado], className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", estadoDot[estado])} />
      {label}
    </Badge>
  );
}

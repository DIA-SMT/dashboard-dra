"use client";
import * as React from "react";
import { Check, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
}

/** Copia al portapapeles el link público del formulario de solicitud (/solicitar). */
export function CopiarLinkPublico({ className, variant = "outline", size = "lg" }: Props) {
  const [copiado, setCopiado] = React.useState(false);

  async function copiar() {
    const url = `${window.location.origin}/solicitar`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Fallback para navegadores sin Clipboard API
      window.prompt("Copiá el link de la solicitud pública:", url);
      return;
    }
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <Button type="button" variant={variant} size={size} onClick={copiar} className={cn(className)}>
      {copiado ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
      {copiado ? "¡Link copiado!" : "Copiar link público"}
    </Button>
  );
}

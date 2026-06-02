"use client";
import * as React from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { Solicitud } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Mensaje {
  role: "user" | "assistant";
  content: string;
}

const SUGERENCIAS = [
  "¿Qué reuniones tengo hoy?",
  "¿Cuáles son las próximas reuniones?",
  "¿Cuántas solicitudes pendientes hay?",
  "¿Hay reuniones esta semana?",
];

// Renderiza negritas (**texto**) como <strong>, preservando los saltos de línea.
function renderConNegritas(texto: string): React.ReactNode {
  const partes = texto.split(/(\*\*[^*]+\*\*)/g);
  return partes.map((parte, i) => {
    if (parte.startsWith("**") && parte.endsWith("**") && parte.length > 4) {
      return <strong key={i}>{parte.slice(2, -2)}</strong>;
    }
    return <React.Fragment key={i}>{parte}</React.Fragment>;
  });
}

// Enviamos solo los campos necesarios para responder sobre la agenda.
function compactarAgenda(solicitudes: Solicitud[]) {
  return solicitudes.map((s) => ({
    solicitante: s.solicitante,
    motivo: s.motivo,
    fecha: s.fecha,
    hora: s.hora,
    estado: s.estado,
    institucion: s.institucion,
    contacto: s.contacto,
    observaciones: s.observaciones,
    motivoNoRealizada: s.motivoNoRealizada,
  }));
}

export function AsistenteAgenda() {
  const { solicitudes } = useStore();
  const [abierto, setAbierto] = React.useState(false);
  const [mensajes, setMensajes] = React.useState<Mensaje[]>([]);
  const [input, setInput] = React.useState("");
  const [cargando, setCargando] = React.useState(false);
  const finRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes, cargando]);

  React.useEffect(() => {
    if (abierto) inputRef.current?.focus();
  }, [abierto]);

  async function enviar(texto: string) {
    const pregunta = texto.trim();
    if (!pregunta || cargando) return;

    const historial: Mensaje[] = [...mensajes, { role: "user", content: pregunta }];
    setMensajes([...historial, { role: "assistant", content: "" }]);
    setInput("");
    setCargando(true);

    try {
      const res = await fetch("/api/asistente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: historial,
          agenda: compactarAgenda(solicitudes),
        }),
      });

      if (!res.ok || !res.body) {
        let msg = "No pude conectarme con el asistente.";
        try {
          const j = await res.json();
          if (j?.error) msg = j.error;
        } catch {
          /* sin cuerpo JSON */
        }
        setMensajes((prev) => {
          const copia = [...prev];
          copia[copia.length - 1] = { role: "assistant", content: `⚠️ ${msg}` };
          return copia;
        });
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acumulado = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acumulado += decoder.decode(value, { stream: true });
        setMensajes((prev) => {
          const copia = [...prev];
          copia[copia.length - 1] = { role: "assistant", content: acumulado };
          return copia;
        });
      }

      if (!acumulado.trim()) {
        setMensajes((prev) => {
          const copia = [...prev];
          copia[copia.length - 1] = {
            role: "assistant",
            content: "No obtuve respuesta. Probá de nuevo en un momento.",
          };
          return copia;
        });
      }
    } catch {
      setMensajes((prev) => {
        const copia = [...prev];
        copia[copia.length - 1] = {
          role: "assistant",
          content: "⚠️ Ocurrió un error de conexión. Intentá nuevamente.",
        };
        return copia;
      });
    } finally {
      setCargando(false);
    }
  }

  return (
    <>
      {/* Lanzador flotante */}
      {!abierto && (
        <button
          onClick={() => setAbierto(true)}
          aria-label="Abrir asistente de agenda"
          className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 h-14 w-14 rounded-full bg-gradient-to-br from-[hsl(var(--smt-blue))] to-[hsl(var(--smt-sky))] text-white shadow-lg shadow-[hsl(var(--smt-blue))]/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Panel de chat */}
      {abierto && (
        <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 w-[calc(100vw-2rem)] max-w-sm h-[70vh] max-h-[560px] flex flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
          {/* Encabezado */}
          <div className="flex items-center justify-between gap-2 px-4 py-3 bg-gradient-to-r from-[hsl(var(--smt-blue-dark))] to-[hsl(var(--smt-blue))] text-white">
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-8 w-8 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                <MessageCircle className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-tight">Asistente de agenda</p>
                <p className="text-[11px] text-white/70 leading-tight">Consultá reuniones y solicitudes</p>
              </div>
            </div>
            <button
              onClick={() => setAbierto(false)}
              aria-label="Cerrar asistente"
              className="h-8 w-8 rounded-md hover:bg-white/15 flex items-center justify-center transition-colors shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {mensajes.length === 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Hola 👋 Preguntame sobre la agenda del despacho. Por ejemplo:
                </p>
                <div className="flex flex-col gap-2">
                  {SUGERENCIAS.map((s) => (
                    <button
                      key={s}
                      onClick={() => enviar(s)}
                      className="text-left text-sm rounded-lg border border-border bg-secondary/50 px-3 py-2 hover:bg-accent transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              mensajes.map((m, i) => (
                <div
                  key={i}
                  className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap break-words",
                      m.role === "user"
                        ? "bg-[hsl(var(--smt-blue))] text-white rounded-br-sm"
                        : "bg-secondary text-foreground rounded-bl-sm"
                    )}
                  >
                    {m.content ? (
                      renderConNegritas(m.content)
                    ) : (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={finRef} />
          </div>

          {/* Entrada */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              enviar(input);
            }}
            className="border-t border-border p-3 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribí tu consulta…"
              className="flex-1 h-10 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <button
              type="submit"
              disabled={cargando || !input.trim()}
              aria-label="Enviar"
              className="h-10 w-10 rounded-lg bg-[hsl(var(--smt-blue))] text-white flex items-center justify-center disabled:opacity-50 hover:bg-[hsl(var(--smt-blue))]/90 transition-colors shrink-0"
            >
              {cargando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </form>
        </div>
      )}
    </>
  );
}

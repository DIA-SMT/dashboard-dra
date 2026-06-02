import { NextRequest } from "next/server";

export const runtime = "nodejs";

// API compatible con OpenAI servida por OpenRouter
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "anthropic/claude-3.5-haiku";

type ChatMsg = { role: "user" | "assistant"; content: string };

interface AgendaItem {
  solicitante: string;
  motivo: string;
  fecha: string;
  hora?: string;
  estado: string;
  institucion?: string;
  contacto?: string;
  observaciones?: string;
  motivoNoRealizada?: string;
}

const ESTADO_LABEL: Record<string, string> = {
  pendiente: "Pendiente",
  agendada: "Agendada",
  realizada: "Realizada",
  no_realizada: "No realizada",
};

function formatearAgenda(agenda: AgendaItem[]): string {
  if (!agenda.length) return "(No hay solicitudes cargadas todavía.)";
  return agenda
    .slice()
    .sort((a, b) => a.fecha.localeCompare(b.fecha) || (a.hora ?? "").localeCompare(b.hora ?? ""))
    .map((s) => {
      const partes = [
        `- ${s.fecha}${s.hora ? ` ${s.hora}` : ""}`,
        `[${ESTADO_LABEL[s.estado] ?? s.estado}]`,
        s.solicitante,
        s.institucion ? `(${s.institucion})` : "",
        `— ${s.motivo}`,
        s.contacto ? `· contacto: ${s.contacto}` : "",
        s.observaciones ? `· obs: ${s.observaciones}` : "",
        s.motivoNoRealizada ? `· motivo no realizada: ${s.motivoNoRealizada}` : "",
      ];
      return partes.filter(Boolean).join(" ");
    })
    .join("\n");
}

function buildSystemPrompt(agenda: AgendaItem[]): string {
  const hoy = new Date();
  const hoyISO = hoy.toISOString().slice(0, 10);
  const hoyLargo = hoy.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return [
    "Sos el asistente virtual del Despacho de la Intendencia de la Municipalidad de San Miguel de Tucumán.",
    "Tu única función es ayudar al personal a consultar la agenda de reuniones y solicitudes de audiencia.",
    "",
    `Fecha de hoy: ${hoyLargo} (${hoyISO}).`,
    "",
    "Reglas:",
    "- Respondé siempre en español rioplatense, de forma breve, clara y profesional.",
    "- Basate ÚNICAMENTE en los datos de la agenda que figuran abajo. No inventes reuniones, personas ni datos.",
    "- Si la información pedida no está en la agenda, decilo con claridad.",
    "- Cuando menciones fechas, usá un formato legible (ej.: 'martes 3 de junio').",
    "- Si te piden un listado, usá viñetas con fecha, hora, solicitante y motivo.",
    "- Los estados posibles son: Pendiente, Agendada, Realizada, No realizada.",
    "- No realices acciones de escritura (crear/editar/borrar); solo consultá e informá.",
    "",
    "=== AGENDA ACTUAL ===",
    formatearAgenda(agenda),
    "=== FIN AGENDA ===",
  ].join("\n");
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Falta configurar OPENROUTER_API_KEY en el entorno." },
      { status: 500 }
    );
  }

  let body: { messages?: ChatMsg[]; agenda?: AgendaItem[] };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Cuerpo de la solicitud inválido." }, { status: 400 });
  }

  const messages = Array.isArray(body.messages) ? body.messages.slice(-12) : [];
  const agenda = Array.isArray(body.agenda) ? body.agenda : [];

  if (!messages.length) {
    return Response.json({ error: "No se recibió ningún mensaje." }, { status: 400 });
  }

  const model = process.env.OPENROUTER_MODEL || DEFAULT_MODEL;

  const upstream = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "X-Title": "Asistente Agenda - Despacho Intendencia SMT",
    },
    body: JSON.stringify({
      model,
      stream: true,
      temperature: 0.2,
      messages: [{ role: "system", content: buildSystemPrompt(agenda) }, ...messages],
    }),
  });

  if (!upstream.ok || !upstream.body) {
    const detalle = await upstream.text().catch(() => "");
    return Response.json(
      { error: `Error del proveedor de IA (${upstream.status}).`, detalle: detalle.slice(0, 500) },
      { status: 502 }
    );
  }

  // Transformamos el stream SSE de OpenRouter en texto plano (solo los deltas).
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const reader = upstream.body.getReader();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
          return;
        }
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const data = trimmed.slice(5).trim();
          if (data === "[DONE]") {
            controller.close();
            return;
          }
          try {
            const json = JSON.parse(data);
            const delta = json.choices?.[0]?.delta?.content;
            if (delta) controller.enqueue(encoder.encode(delta));
          } catch {
            // fragmento incompleto o comentario SSE; lo ignoramos
          }
        }
      }
    },
    cancel() {
      reader.cancel().catch(() => {});
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}

-- Mejora: permitir que una solicitud proponga una o más fechas de reunión
-- (sujetas a la disponibilidad de la Intendenta).
--
-- Cómo aplicar: Supabase → SQL Editor → pegar y ejecutar.
--
-- La columna `fecha` / `hora` se mantiene como la fecha confirmada / principal
-- (la que usa el calendario). `fechas_propuestas` guarda todas las opciones que
-- envió el solicitante, en formato [{ "fecha": "2026-06-10", "hora": "10:00" }, ...].

alter table public.solicitudes
  add column if not exists fechas_propuestas jsonb not null default '[]'::jsonb;

-- Backfill: para las solicitudes ya existentes, usar la fecha/hora actual como única opción.
update public.solicitudes
set fechas_propuestas = jsonb_build_array(
  jsonb_build_object('fecha', fecha::text, 'hora', hora)
)
where fechas_propuestas = '[]'::jsonb;

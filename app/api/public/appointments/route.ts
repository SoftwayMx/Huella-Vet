import { NextResponse } from "next/server";
import { addMinutes } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { createServiceClient } from "@/lib/supabase/server";
import { isRateLimited } from "@/lib/rate-limit";
import { clientIp, jsonError } from "@/lib/http";
import { availableSlotsForVet, findFreeVet, localDateFromInstant } from "@/lib/booking";
import { bookAppointmentSchema, lookupAppointmentSchema, patchAppointmentSchema } from "@/lib/validation/public";
import { SLOT_MINUTES, TIMEZONE } from "@/lib/constants";
import { canBook, canCancelOrReprogram } from "@/lib/transitions";
import { generateAppointmentCode } from "@/lib/appointment-code";
import { sendNotification } from "@/lib/notifications";

// Tipos explícitos de las filas con relaciones embebidas (evita la inferencia
// frágil de supabase-js ante selects con alias).
interface LookupRow {
  code: string;
  status: string;
  start_at: string;
  end_at: string;
  reason: string | null;
  veterinarian_id: string;
  service: { name: string; price: number } | null;
  veterinarian: { name: string } | null;
  pet: { name: string; species: string } | null;
  client: { phone: string } | null;
}

interface PatchRow {
  id: string;
  code: string;
  status: string;
  start_at: string;
  veterinarian_id: string;
  client: { phone: string } | null;
}

// POST /api/public/appointments — agendar una cita (público, sin sesión).
export async function POST(req: Request) {
  const supabase = createServiceClient();
  if (await isRateLimited(supabase, clientIp(req), "book", 60_000, 10)) {
    return jsonError("Demasiadas peticiones. Intenta más tarde.", 429);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Cuerpo inválido.", 400);
  }

  const parsed = bookAppointmentSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Datos inválidos.", 400);
  }
  const input = parsed.data;

  const startAt = new Date(input.startAt);
  if (Number.isNaN(startAt.getTime())) return jsonError("Fecha inválida.", 400);

  const now = new Date();
  if (!canBook(startAt, now)) {
    return jsonError("Debe agendarse con al menos 2 horas de anticipación.", 409);
  }

  const { data: service } = await supabase
    .from("services")
    .select("id, name, price")
    .eq("id", input.serviceId)
    .eq("is_active", true)
    .maybeSingle();
  if (!service) return jsonError("Servicio no disponible.", 404);

  const localDate = localDateFromInstant(startAt);

  // Veterinario: el elegido, o el primero libre en ese bloque.
  let veterinarianId = input.veterinarianId ?? null;
  if (veterinarianId) {
    const { data: vet } = await supabase
      .from("veterinarians")
      .select("id")
      .eq("id", veterinarianId)
      .eq("is_active", true)
      .maybeSingle();
    if (!vet) return jsonError("Veterinario no disponible.", 404);
    const slots = await availableSlotsForVet(supabase, veterinarianId, localDate, now);
    if (!slots.some((s) => s.getTime() === startAt.getTime())) {
      return jsonError("El horario ya no está disponible.", 409);
    }
  } else {
    const vetId = await findFreeVet(supabase, localDate, startAt, now);
    if (!vetId) return jsonError("El horario ya no está disponible.", 409);
    veterinarianId = vetId;
  }

  // Cliente: reutilizar por teléfono normalizado si ya existe.
  const phone = input.client.phone;
  const { data: existingClient } = await supabase
    .from("clients")
    .select("id")
    .eq("phone", phone)
    .maybeSingle();
  let clientId: string | null = existingClient?.id ?? null;
  if (!clientId) {
    const { data: newClient, error: clientErr } = await supabase
      .from("clients")
      .insert({ name: input.client.name, phone, email: input.client.email || null })
      .select("id")
      .single();
    if (clientErr || !newClient) return jsonError("No se pudo registrar el cliente.", 500);
    clientId = newClient.id;
  }

  // Mascota (se crea una por cita; el historial queda en el directorio).
  const { data: pet, error: petErr } = await supabase
    .from("pets")
    .insert({
      client_id: clientId,
      name: input.pet.name,
      species: input.pet.species,
      breed: input.pet.breed || null,
      age: input.pet.age || null,
    })
    .select("id")
    .single();
  if (petErr || !pet) return jsonError("No se pudo registrar la mascota.", 500);

  const endAt = addMinutes(startAt, SLOT_MINUTES);

  // Reintento ante colisión de código; la restricción de exclusión es el respaldo final.
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateAppointmentCode();
    const { data: appt, error: apptErr } = await supabase
      .from("appointments")
      .insert({
        code,
        client_id: clientId,
        pet_id: pet.id,
        service_id: service.id,
        veterinarian_id: veterinarianId,
        start_at: startAt.toISOString(),
        end_at: endAt.toISOString(),
        status: "pendiente",
        reason: input.reason || null,
        consent: true,
      })
      .select("id, code, start_at, end_at")
      .single();

    if (!apptErr) {
      sendNotification({
        type: "confirmacion",
        to: input.client.email || phone,
        message:
          `Cita confirmada: ${service.name} para ${input.pet.name}, ` +
          `${formatInTimeZone(startAt, TIMEZONE, "dd/MM/yyyy HH:mm")}. Código: ${code}.`,
      });
      return NextResponse.json({
        code,
        appointment: {
          startAt: appt.start_at,
          endAt: appt.end_at,
          service: service.name,
          price: service.price,
          pet: input.pet.name,
        },
      });
    }

    if (apptErr.code === "23505") continue; // código duplicado → reintentar
    if (apptErr.code === "23P01") {
      return jsonError("El horario ya no está disponible.", 409); // violación de exclusión
    }
    return jsonError("No se pudo crear la cita.", 500);
  }

  return jsonError("No se pudo generar el código de cita.", 500);
}

// GET /api/public/appointments?code=&phone= — consultar cita por código y teléfono.
export async function GET(req: Request) {
  const supabase = createServiceClient();
  if (await isRateLimited(supabase, clientIp(req), "lookup", 60_000, 30)) {
    return jsonError("Demasiadas peticiones. Intenta más tarde.", 429);
  }

  const url = new URL(req.url);
  const parsed = lookupAppointmentSchema.safeParse({
    code: url.searchParams.get("code"),
    phone: url.searchParams.get("phone"),
  });
  if (!parsed.success) return jsonError("Datos inválidos.", 400);
  const { code, phone } = parsed.data;

  const { data, error } = await supabase
    .from("appointments")
    .select(
      "code, status, start_at, end_at, reason, veterinarian_id, " +
        "service:services(name, price), veterinarian:veterinarians(name), " +
        "pet:pets(name, species), client:clients(phone)",
    )
    .eq("code", code)
    .maybeSingle();
  const row = data as unknown as LookupRow | null;

  if (error) return jsonError("No se pudo consultar la cita.", 500);
  if (!row || row.client?.phone !== phone) {
    return jsonError("No se encontró la cita con ese código y teléfono.", 404);
  }

  const now = new Date();
  const active = row.status === "pendiente" || row.status === "confirmada";
  const canModify = active && canCancelOrReprogram(new Date(row.start_at), now);

  return NextResponse.json({
    appointment: {
      code: row.code,
      status: row.status,
      startAt: row.start_at,
      endAt: row.end_at,
      reason: row.reason,
      veterinarianId: row.veterinarian_id,
      service: row.service,
      veterinarian: row.veterinarian,
      pet: row.pet,
    },
    canCancel: canModify,
    canReschedule: canModify,
  });
}

// PATCH /api/public/appointments — cancelar o reprogramar (público).
export async function PATCH(req: Request) {
  const supabase = createServiceClient();
  if (await isRateLimited(supabase, clientIp(req), "patch", 60_000, 20)) {
    return jsonError("Demasiadas peticiones. Intenta más tarde.", 429);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Cuerpo inválido.", 400);
  }

  const parsed = patchAppointmentSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Datos inválidos.", 400);
  }
  const { code, phone, action, newStartAt } = parsed.data;

  const { data, error } = await supabase
    .from("appointments")
    .select("id, code, status, start_at, veterinarian_id, client:clients(phone)")
    .eq("code", code)
    .maybeSingle();
  const appt = data as unknown as PatchRow | null;

  if (error) return jsonError("No se pudo consultar la cita.", 500);
  if (!appt || appt.client?.phone !== phone) {
    return jsonError("No se encontró la cita con ese código y teléfono.", 404);
  }

  const now = new Date();
  if (appt.status !== "pendiente" && appt.status !== "confirmada") {
    return jsonError("Esta cita ya no se puede modificar.", 409);
  }
  if (!canCancelOrReprogram(new Date(appt.start_at), now)) {
    return jsonError("Solo se puede cancelar o reprogramar hasta 4 horas antes.", 409);
  }

  if (action === "cancel") {
    const { error: updErr } = await supabase
      .from("appointments")
      .update({ status: "cancelada", canceled_at: now.toISOString(), updated_at: now.toISOString() })
      .eq("id", appt.id);
    if (updErr) return jsonError("No se pudo cancelar la cita.", 500);
    sendNotification({ type: "cancelacion", to: phone, message: `Cita ${code} cancelada.` });
    return NextResponse.json({ ok: true, status: "cancelada" });
  }

  // Reprogramar (mismo veterinario, nuevo bloque libre).
  const newStart = new Date(newStartAt!);
  if (Number.isNaN(newStart.getTime())) return jsonError("Fecha inválida.", 400);
  if (!canBook(newStart, now)) {
    return jsonError("El nuevo horario debe tener al menos 2 horas de anticipación.", 409);
  }

  const localDate = localDateFromInstant(newStart);
  const slots = await availableSlotsForVet(supabase, appt.veterinarian_id, localDate, now);
  if (!slots.some((s) => s.getTime() === newStart.getTime())) {
    return jsonError("El nuevo horario ya no está disponible.", 409);
  }

  const newEnd = addMinutes(newStart, SLOT_MINUTES);
  const { error: updErr } = await supabase
    .from("appointments")
    .update({ start_at: newStart.toISOString(), end_at: newEnd.toISOString(), updated_at: now.toISOString() })
    .eq("id", appt.id);

  if (updErr) {
    if (updErr.code === "23P01") return jsonError("El nuevo horario ya no está disponible.", 409);
    return jsonError("No se pudo reprogramar la cita.", 500);
  }

  sendNotification({
    type: "recordatorio",
    to: phone,
    message: `Cita ${code} reprogramada para ${formatInTimeZone(newStart, TIMEZONE, "dd/MM/yyyy HH:mm")}.`,
  });
  return NextResponse.json({ ok: true, startAt: newStart.toISOString(), endAt: newEnd.toISOString() });
}

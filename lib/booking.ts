import type { SupabaseClient } from "@supabase/supabase-js";
import { getDay, parse } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { computeAvailableSlots } from "./availability";
import { TIMEZONE } from "./constants";

export function localDateFromInstant(d: Date): string {
  return formatInTimeZone(d, TIMEZONE, "yyyy-MM-dd");
}

export function dayOfWeekFromLocalDate(localDate: string): number {
  return getDay(parse(localDate, "yyyy-MM-dd", new Date()));
}

// Bloques disponibles de un veterinario para una fecha local determinada.
export async function availableSlotsForVet(
  supabase: SupabaseClient,
  veterinarianId: string,
  localDate: string,
  now: Date,
): Promise<Date[]> {
  const dow = dayOfWeekFromLocalDate(localDate);

  const { data: schedRows } = await supabase
    .from("vet_schedules")
    .select("start_time, end_time")
    .eq("veterinarian_id", veterinarianId)
    .eq("day_of_week", dow);

  const first = schedRows?.[0];
  const schedule = first
    ? { start: first.start_time.slice(0, 5), end: first.end_time.slice(0, 5) }
    : null;

  const { data: offRows } = await supabase
    .from("vet_days_off")
    .select("date")
    .eq("veterinarian_id", veterinarianId)
    .eq("date", localDate);
  const daysOff = (offRows ?? []).map((r) => r.date);

  const { data: blockRows } = await supabase
    .from("blocked_dates")
    .select("date, start_time, end_time")
    .eq("date", localDate);
  const blocks = (blockRows ?? []).map((b) => ({
    date: b.date,
    startTime: b.start_time,
    endTime: b.end_time,
  }));

  const dayStartUtc = fromZonedTime(`${localDate} 00:00:00`, TIMEZONE);
  const dayEndUtc = fromZonedTime(`${localDate} 23:59:59`, TIMEZONE);
  const { data: apptRows } = await supabase
    .from("appointments")
    .select("start_at, end_at")
    .eq("veterinarian_id", veterinarianId)
    .neq("status", "cancelada")
    .gte("start_at", dayStartUtc.toISOString())
    .lt("start_at", dayEndUtc.toISOString());
  const appointments = (apptRows ?? []).map((a) => ({
    startAt: new Date(a.start_at),
    endAt: new Date(a.end_at),
  }));

  return computeAvailableSlots({
    localDate,
    schedule,
    appointments,
    blocks,
    daysOff,
    now,
  });
}

// Devuelve el primer veterinario activo libre en el bloque solicitado (o null).
export async function findFreeVet(
  supabase: SupabaseClient,
  localDate: string,
  startAt: Date,
  now: Date,
): Promise<string | null> {
  const { data: vets } = await supabase
    .from("veterinarians")
    .select("id")
    .eq("is_active", true)
    .order("name");
  for (const vet of vets ?? []) {
    const slots = await availableSlotsForVet(supabase, vet.id, localDate, now);
    if (slots.some((s) => s.getTime() === startAt.getTime())) return vet.id;
  }
  return null;
}

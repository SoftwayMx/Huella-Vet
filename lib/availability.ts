import { addMinutes } from "date-fns";
import { fromZonedTime } from "date-fns-tz";
import { MIN_ADVANCE_HOURS, SLOT_MINUTES, TIMEZONE } from "./constants";

export interface SlotSchedule {
  start: string; // "HH:mm" (hora local de la clínica)
  end: string; // "HH:mm"
}

export interface ExistingAppointment {
  startAt: Date;
  endAt: Date;
}

export interface DateBlock {
  date: string; // "YYYY-MM-DD"
  startTime: string | null; // null = todo el día
  endTime: string | null;
}

export interface AvailabilityInput {
  localDate: string; // "YYYY-MM-DD" en la zona de la clínica
  schedule: SlotSchedule | null; // horario del veterinario para ese día
  appointments: ExistingAppointment[]; // citas existentes (no canceladas)
  blocks: DateBlock[]; // bloqueos de fechas
  daysOff: string[]; // fechas de descanso del veterinario ("YYYY-MM-DD")
  now: Date;
}

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function toHhmm(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function overlaps(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date,
): boolean {
  return (
    aStart.getTime() < bEnd.getTime() && bStart.getTime() < aEnd.getTime()
  );
}

// Devuelve los bloques de 30 min realmente disponibles (instantes UTC de inicio).
export function computeAvailableSlots(input: AvailabilityInput): Date[] {
  const { localDate, schedule, appointments, blocks, daysOff, now } = input;

  if (!schedule) return [];
  if (daysOff.includes(localDate)) return [];

  // Bloqueo de día completo (startTime null) anula todo el día.
  const fullDayBlock = blocks.some(
    (b) => b.date === localDate && b.startTime == null,
  );
  if (fullDayBlock) return [];

  // Bloqueos parciales del día, en instantes UTC.
  const dayBlocks = blocks
    .filter(
      (b) => b.date === localDate && b.startTime != null && b.endTime != null,
    )
    .map((b) => ({
      start: fromZonedTime(`${b.date} ${b.startTime}:00`, TIMEZONE),
      end: fromZonedTime(`${b.date} ${b.endTime}:00`, TIMEZONE),
    }));

  const minAdvanceMs = MIN_ADVANCE_HOURS * 3_600_000;
  const slots: Date[] = [];
  const endMin = toMinutes(schedule.end);

  for (
    let m = toMinutes(schedule.start);
    m + SLOT_MINUTES <= endMin;
    m += SLOT_MINUTES
  ) {
    const start = fromZonedTime(`${localDate} ${toHhmm(m)}:00`, TIMEZONE);
    const end = addMinutes(start, SLOT_MINUTES);

    if (start.getTime() - now.getTime() < minAdvanceMs) continue;
    if (appointments.some((a) => overlaps(start, end, a.startAt, a.endAt)))
      continue;
    if (dayBlocks.some((b) => overlaps(start, end, b.start, b.end))) continue;

    slots.push(start);
  }

  return slots.sort((a, b) => a.getTime() - b.getTime());
}

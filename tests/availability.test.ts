import { describe, expect, it } from "vitest";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import {
  computeAvailableSlots,
  ExistingAppointment,
} from "../lib/availability";
import { TIMEZONE } from "../lib/constants";

const LOCAL = "2026-10-19"; // lunes
const nowAt = (hhmm: string) =>
  fromZonedTime(`${LOCAL} ${hhmm}:00`, TIMEZONE);
const slotsAt = (instants: Date[]) =>
  instants.map((d) => formatInTimeZone(d, TIMEZONE, "HH:mm"));

const appointment = (start: string, end: string): ExistingAppointment => ({
  startAt: nowAt(start),
  endAt: nowAt(end),
});

const base = {
  localDate: LOCAL,
  appointments: [] as ExistingAppointment[],
  blocks: [],
  daysOff: [] as string[],
  now: fromZonedTime("2026-10-01 00:00:00", TIMEZONE), // pasado lejano
};

describe("computeAvailableSlots", () => {
  it("sin horario no hay disponibilidad", () => {
    const slots = computeAvailableSlots({ ...base, schedule: null });
    expect(slots).toEqual([]);
  });

  it("día de descanso anula la disponibilidad", () => {
    const slots = computeAvailableSlots({
      ...base,
      schedule: { start: "09:00", end: "11:00" },
      daysOff: [LOCAL],
    });
    expect(slots).toEqual([]);
  });

  it("bloqueo de día completo anula la disponibilidad", () => {
    const slots = computeAvailableSlots({
      ...base,
      schedule: { start: "09:00", end: "11:00" },
      blocks: [{ date: LOCAL, startTime: null, endTime: null }],
    });
    expect(slots).toEqual([]);
  });

  it("genera bloques de 30 minutos dentro del horario", () => {
    const slots = computeAvailableSlots({
      ...base,
      schedule: { start: "09:00", end: "11:00" },
    });
    expect(slotsAt(slots)).toEqual(["09:00", "09:30", "10:00", "10:30"]);
  });

  it("excluye el bloque ocupado por una cita", () => {
    const slots = computeAvailableSlots({
      ...base,
      schedule: { start: "09:00", end: "11:00" },
      appointments: [appointment("09:30", "10:00")],
    });
    expect(slotsAt(slots)).toEqual(["09:00", "10:00", "10:30"]);
  });

  it("no excluye bloques adyacentes (sin traslape en bordes)", () => {
    const slots = computeAvailableSlots({
      ...base,
      schedule: { start: "09:00", end: "11:00" },
      appointments: [appointment("10:00", "10:30")],
    });
    expect(slotsAt(slots)).toEqual(["09:00", "09:30", "10:30"]);
  });

  it("aplica la anticipación mínima de 2 horas", () => {
    const slots = computeAvailableSlots({
      ...base,
      schedule: { start: "09:00", end: "13:00" },
      now: nowAt("10:00"),
    });
    expect(slotsAt(slots)).toEqual(["12:00", "12:30"]);
  });

  it("excluye bloques parciales por bloqueo de fecha", () => {
    const slots = computeAvailableSlots({
      ...base,
      schedule: { start: "09:00", end: "11:00" },
      blocks: [{ date: LOCAL, startTime: "09:00", endTime: "09:30" }],
    });
    expect(slotsAt(slots)).toEqual(["09:30", "10:00", "10:30"]);
  });

  it("ignora bloqueos de otras fechas", () => {
    const slots = computeAvailableSlots({
      ...base,
      schedule: { start: "09:00", end: "10:00" },
      blocks: [{ date: "2026-10-20", startTime: null, endTime: null }],
    });
    expect(slotsAt(slots)).toEqual(["09:00", "09:30"]);
  });
});

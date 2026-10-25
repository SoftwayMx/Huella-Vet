import {
  AppointmentStatus,
  CANCEL_CUTOFF_HOURS,
  MIN_ADVANCE_HOURS,
} from "./constants";

// Transiciones válidas entre estados. Los estados terminales no tienen salidas.
const TRANSITIONS: Record<AppointmentStatus, readonly AppointmentStatus[]> = {
  pendiente: ["confirmada", "cancelada"],
  confirmada: ["completada", "no_asistio", "cancelada"],
  completada: [],
  cancelada: [],
  no_asistio: [],
};

export function canTransition(
  from: AppointmentStatus,
  to: AppointmentStatus,
): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

// Agendar requiere al menos MIN_ADVANCE_HOURS de anticipación.
export function canBook(startAt: Date, now: Date = new Date()): boolean {
  return startAt.getTime() - now.getTime() >= MIN_ADVANCE_HOURS * 3_600_000;
}

// Cancelar o reprogramar solo hasta CANCEL_CUTOFF_HOURS antes de la cita.
export function canCancelOrReprogram(
  startAt: Date,
  now: Date = new Date(),
): boolean {
  return startAt.getTime() - now.getTime() >= CANCEL_CUTOFF_HOURS * 3_600_000;
}

// Una cita solo se puede reprogramar desde un estado activo (no terminal).
export function isReschedulable(status: AppointmentStatus): boolean {
  return status === "pendiente" || status === "confirmada";
}

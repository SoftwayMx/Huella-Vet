export const TIMEZONE = "America/Mexico_City";

// Toda cita ocupa un bloque fijo de 30 minutos.
export const SLOT_MINUTES = 30;

// Anticipación mínima para agendar (2 horas).
export const MIN_ADVANCE_HOURS = 2;

// Límite para cancelar o reprogramar (hasta 4 horas antes de la cita).
export const CANCEL_CUTOFF_HOURS = 4;

export const APPOINTMENT_STATUSES = [
  "pendiente",
  "confirmada",
  "completada",
  "cancelada",
  "no_asistio",
] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  completada: "Completada",
  cancelada: "Cancelada",
  no_asistio: "No asistió",
};

export const ROLES = ["admin", "recepcion"] as const;
export type Role = (typeof ROLES)[number];

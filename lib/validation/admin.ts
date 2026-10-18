import { z } from "zod";
import { toMinutes } from "../availability";

const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Hora inválida (HH:mm)");

const money = z
  .string()
  .trim()
  .min(1, "Precio obligatorio")
  .refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 0, "Precio inválido")
  .transform((v) => Number(v));

export const serviceSchema = z.object({
  name: z.string().trim().min(1, "Nombre obligatorio").max(120),
  price: money,
});

export const veterinarianSchema = z.object({
  name: z.string().trim().min(1, "Nombre obligatorio").max(120),
});

export const scheduleSchema = z
  .object({
    veterinarianId: z.string().uuid(),
    dayOfWeek: z.coerce.number().int().min(0).max(6),
    startTime: hhmm,
    endTime: hhmm,
  })
  .refine((s) => toMinutes(s.startTime) < toMinutes(s.endTime), {
    message: "El inicio debe ser anterior al fin",
    path: ["endTime"],
  });

export const dayOffSchema = z.object({
  veterinarianId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
});

export const blockSchema = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
    startTime: hhmm.optional().or(z.literal("")),
    endTime: hhmm.optional().or(z.literal("")),
    reason: z.string().trim().max(200).optional().or(z.literal("")),
  })
  .refine((b) => !b.startTime || !!b.endTime, {
    message: "Indica la hora de fin",
    path: ["endTime"],
  });

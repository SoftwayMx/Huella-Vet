import { z } from "zod";

// Normaliza un teléfono a solo dígitos (para comparar y deduplicar).
export function normalizePhone(raw: string): string {
  return raw.replace(/\D/g, "");
}

const phone = z
  .string()
  .trim()
  .min(1, "El teléfono es obligatorio")
  .transform(normalizePhone)
  .refine((p) => p.length >= 10, {
    message: "Ingresa un teléfono válido (al menos 10 dígitos)",
  });

const email = z.string().trim().email("Correo inválido").optional().or(z.literal(""));

export const bookAppointmentSchema = z.object({
  serviceId: z.string().uuid("Servicio inválido"),
  veterinarianId: z.string().uuid("Veterinario inválido").optional().nullable(),
  startAt: z.string().datetime({ offset: true }),
  client: z.object({
    name: z.string().trim().min(1, "El nombre es obligatorio").max(120),
    phone,
    email,
  }),
  pet: z.object({
    name: z.string().trim().min(1, "El nombre de la mascota es obligatorio").max(120),
    species: z.string().trim().min(1, "La especie es obligatoria").max(80),
    breed: z.string().trim().max(80).optional().or(z.literal("")),
    age: z.string().trim().max(40).optional().or(z.literal("")),
  }),
  reason: z.string().trim().max(500).optional().or(z.literal("")),
  consent: z.literal(true, { message: "Debes aceptar el consentimiento" }),
});

export const lookupAppointmentSchema = z.object({
  code: z.string().trim().min(4).max(16),
  phone: z.string().trim().transform(normalizePhone),
});

export const patchAppointmentSchema = z
  .object({
    code: z.string().trim().min(4).max(16),
    phone: z.string().trim().transform(normalizePhone),
    action: z.enum(["cancel", "reschedule"]),
    newStartAt: z.string().datetime({ offset: true }).optional(),
  })
  .refine(
    (v) => v.action !== "reschedule" || v.newStartAt != null,
    { message: "newStartAt es obligatorio para reprogramar", path: ["newStartAt"] },
  );

export type BookAppointmentInput = z.infer<typeof bookAppointmentSchema>;
export type PatchAppointmentInput = z.infer<typeof patchAppointmentSchema>;

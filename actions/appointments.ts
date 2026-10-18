"use server";

import { addMinutes } from "date-fns";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { getStaff } from "@/lib/auth";
import { availableSlotsForVet, localDateFromInstant } from "@/lib/booking";
import { canTransition, isReschedulable } from "@/lib/transitions";
import { AppointmentStatus, SLOT_MINUTES } from "@/lib/constants";

type Result = { ok: boolean; error?: string };

export async function transitionAppointment(
  id: string,
  to: AppointmentStatus,
): Promise<Result> {
  const staff = await getStaff();
  if (!staff) return { ok: false, error: "No autorizado." };

  const supabase = await createServerClient();
  const { data: appt } = await supabase
    .from("appointments")
    .select("status")
    .eq("id", id)
    .maybeSingle();
  if (!appt) return { ok: false, error: "Cita no encontrada." };
  if (!canTransition(appt.status as AppointmentStatus, to)) {
    return { ok: false, error: "Transición no permitida." };
  }

  const update: Record<string, string> = {
    status: to,
    updated_at: new Date().toISOString(),
  };
  if (to === "cancelada") update.canceled_at = new Date().toISOString();

  const { error } = await supabase.from("appointments").update(update).eq("id", id);
  if (error) return { ok: false, error: "No se pudo actualizar la cita." };

  revalidatePath("/panel", "layout");
  return { ok: true };
}

export async function rescheduleAppointment(
  id: string,
  newStartAt: string,
): Promise<Result> {
  const staff = await getStaff();
  if (!staff) return { ok: false, error: "No autorizado." };

  const supabase = await createServerClient();
  const { data: appt } = await supabase
    .from("appointments")
    .select("status, veterinarian_id")
    .eq("id", id)
    .maybeSingle();
  if (!appt) return { ok: false, error: "Cita no encontrada." };
  if (!isReschedulable(appt.status as AppointmentStatus)) {
    return { ok: false, error: "Esta cita no se puede reprogramar." };
  }

  const newStart = new Date(newStartAt);
  if (Number.isNaN(newStart.getTime())) return { ok: false, error: "Fecha inválida." };

  const localDate = localDateFromInstant(newStart);
  const slots = await availableSlotsForVet(
    supabase,
    appt.veterinarian_id as string,
    localDate,
    new Date(),
  );
  if (!slots.some((s) => s.getTime() === newStart.getTime())) {
    return { ok: false, error: "El horario no está disponible." };
  }

  const newEnd = addMinutes(newStart, SLOT_MINUTES);
  const { error } = await supabase
    .from("appointments")
    .update({
      start_at: newStart.toISOString(),
      end_at: newEnd.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) {
    return {
      ok: false,
      error: error.code === "23P01" ? "El horario ya no está disponible." : "No se pudo reprogramar.",
    };
  }

  revalidatePath("/panel", "layout");
  return { ok: true };
}

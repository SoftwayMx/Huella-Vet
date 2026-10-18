"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { getStaff } from "@/lib/auth";
import { dayOffSchema, scheduleSchema, veterinarianSchema } from "@/lib/validation/admin";

type Result = { ok: boolean; error?: string };

async function requireAdmin(): Promise<Result | null> {
  const staff = await getStaff();
  if (!staff || staff.role !== "admin") {
    return { ok: false, error: "Acción reservada al administrador." };
  }
  return null;
}

export async function saveVeterinarian(input: {
  id?: string;
  name: string;
}): Promise<Result> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = veterinarianSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const supabase = await createServerClient();
  const { name } = parsed.data;

  if (input.id) {
    const { error } = await supabase.from("veterinarians").update({ name }).eq("id", input.id);
    if (error) return { ok: false, error: "No se pudo actualizar el veterinario." };
  } else {
    const { error } = await supabase.from("veterinarians").insert({ name });
    if (error) return { ok: false, error: "No se pudo crear el veterinario." };
  }

  revalidatePath("/panel", "layout");
  return { ok: true };
}

export async function deleteVeterinarian(id: string): Promise<Result> {
  const denied = await requireAdmin();
  if (denied) return denied;
  const supabase = await createServerClient();
  const { error } = await supabase.from("veterinarians").update({ is_active: false }).eq("id", id);
  if (error) return { ok: false, error: "No se pudo desactivar el veterinario." };
  revalidatePath("/panel", "layout");
  return { ok: true };
}

export async function saveSchedule(input: {
  veterinarianId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}): Promise<Result> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = scheduleSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const supabase = await createServerClient();
  const { veterinarianId, dayOfWeek, startTime, endTime } = parsed.data;

  const { error } = await supabase.from("vet_schedules").upsert(
    { veterinarian_id: veterinarianId, day_of_week: dayOfWeek, start_time: startTime, end_time: endTime },
    { onConflict: "veterinarian_id,day_of_week" },
  );
  if (error) return { ok: false, error: "No se pudo guardar el horario." };

  revalidatePath("/panel", "layout");
  return { ok: true };
}

export async function removeSchedule(id: string): Promise<Result> {
  const denied = await requireAdmin();
  if (denied) return denied;
  const supabase = await createServerClient();
  const { error } = await supabase.from("vet_schedules").delete().eq("id", id);
  if (error) return { ok: false, error: "No se pudo eliminar el horario." };
  revalidatePath("/panel", "layout");
  return { ok: true };
}

export async function saveDayOff(input: {
  veterinarianId: string;
  date: string;
}): Promise<Result> {
  const denied = await requireAdmin();
  if (denied) return denied;

  const parsed = dayOffSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const supabase = await createServerClient();
  const { error } = await supabase.from("vet_days_off").upsert(
    { veterinarian_id: parsed.data.veterinarianId, date: parsed.data.date, reason: "Descanso" },
    { onConflict: "veterinarian_id,date" },
  );
  if (error) return { ok: false, error: "No se pudo guardar el descanso." };

  revalidatePath("/panel", "layout");
  return { ok: true };
}

export async function removeDayOff(id: string): Promise<Result> {
  const denied = await requireAdmin();
  if (denied) return denied;
  const supabase = await createServerClient();
  const { error } = await supabase.from("vet_days_off").delete().eq("id", id);
  if (error) return { ok: false, error: "No se pudo eliminar el descanso." };
  revalidatePath("/panel", "layout");
  return { ok: true };
}

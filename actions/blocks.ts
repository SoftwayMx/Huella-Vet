"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { getStaff } from "@/lib/auth";
import { blockSchema } from "@/lib/validation/admin";

type Result = { ok: boolean; error?: string };

export async function createBlock(input: {
  date: string;
  startTime?: string;
  endTime?: string;
  reason?: string;
}): Promise<Result> {
  const staff = await getStaff();
  if (!staff || staff.role !== "admin") {
    return { ok: false, error: "Acción reservada al administrador." };
  }
  const parsed = blockSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const supabase = await createServerClient();
  const { date, startTime, endTime, reason } = parsed.data;
  const { error } = await supabase.from("blocked_dates").insert({
    date,
    start_time: startTime || null,
    end_time: endTime || null,
    reason: reason || null,
    created_by: staff.id,
  });
  if (error) return { ok: false, error: "No se pudo crear el bloqueo." };

  revalidatePath("/panel", "layout");
  return { ok: true };
}

export async function deleteBlock(id: string): Promise<Result> {
  const staff = await getStaff();
  if (!staff || staff.role !== "admin") {
    return { ok: false, error: "Acción reservada al administrador." };
  }
  const supabase = await createServerClient();
  const { error } = await supabase.from("blocked_dates").delete().eq("id", id);
  if (error) return { ok: false, error: "No se pudo eliminar el bloqueo." };
  revalidatePath("/panel", "layout");
  return { ok: true };
}

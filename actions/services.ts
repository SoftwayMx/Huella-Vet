"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { getStaff } from "@/lib/auth";
import { serviceSchema } from "@/lib/validation/admin";

type Result = { ok: boolean; error?: string };

export async function saveService(input: {
  id?: string;
  name: string;
  price: string;
}): Promise<Result> {
  const staff = await getStaff();
  if (!staff || staff.role !== "admin") {
    return { ok: false, error: "Acción reservada al administrador." };
  }
  const parsed = serviceSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const { name, price } = parsed.data;
  const supabase = await createServerClient();

  if (input.id) {
    const { error } = await supabase.from("services").update({ name, price }).eq("id", input.id);
    if (error) return { ok: false, error: "No se pudo actualizar el servicio." };
  } else {
    const { error } = await supabase.from("services").insert({ name, price });
    if (error) return { ok: false, error: "No se pudo crear el servicio." };
  }

  revalidatePath("/panel", "layout");
  return { ok: true };
}

export async function deleteService(id: string): Promise<Result> {
  const staff = await getStaff();
  if (!staff || staff.role !== "admin") {
    return { ok: false, error: "Acción reservada al administrador." };
  }
  const supabase = await createServerClient();
  const { error } = await supabase.from("services").update({ is_active: false }).eq("id", id);
  if (error) return { ok: false, error: "No se pudo desactivar el servicio." };
  revalidatePath("/panel", "layout");
  return { ok: true };
}

import { redirect } from "next/navigation";
import { createServerClient } from "./supabase/server";

export interface Staff {
  id: string;
  name: string;
  role: string;
}

export async function getStaff(): Promise<Staff | null> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("staff")
    .select("id, name, role")
    .eq("id", user.id)
    .maybeSingle();
  return (data as Staff | null) ?? null;
}

// Para páginas/server components: redirige a /login si no hay sesión de staff.
export async function requireStaff(): Promise<Staff> {
  const staff = await getStaff();
  if (!staff) redirect("/login");
  return staff;
}

// Para páginas de administración: redirige a /panel si no es admin.
export async function requireAdmin(): Promise<Staff> {
  const staff = await requireStaff();
  if (staff.role !== "admin") redirect("/panel");
  return staff;
}

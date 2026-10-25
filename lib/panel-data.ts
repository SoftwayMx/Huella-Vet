import type { SupabaseClient } from "@supabase/supabase-js";

export interface AppointmentRow {
  id: string;
  code: string;
  status: string;
  start_at: string;
  end_at: string;
  reason: string | null;
  veterinarian_id: string;
  client: { name: string; phone: string } | null;
  pet: { name: string; species: string } | null;
  service: { name: string; price: number } | null;
  veterinarian: { name: string } | null;
}

const SELECT =
  "id, code, status, start_at, end_at, reason, veterinarian_id, " +
  "client:clients(name, phone), pet:pets(name, species), " +
  "service:services(name, price), veterinarian:veterinarians(name)";

export async function listAppointmentsByRange(
  supabase: SupabaseClient,
  startISO: string,
  endISO: string,
): Promise<AppointmentRow[]> {
  const { data, error } = await supabase
    .from("appointments")
    .select(SELECT)
    .gte("start_at", startISO)
    .lt("start_at", endISO)
    .order("start_at", { ascending: true });
  if (error) return [];
  return (data as unknown as AppointmentRow[]) ?? [];
}

export async function listAppointmentsForClient(
  supabase: SupabaseClient,
  clientId: string,
): Promise<AppointmentRow[]> {
  const { data, error } = await supabase
    .from("appointments")
    .select(SELECT)
    .eq("client_id", clientId)
    .order("start_at", { ascending: false });
  if (error) return [];
  return (data as unknown as AppointmentRow[]) ?? [];
}

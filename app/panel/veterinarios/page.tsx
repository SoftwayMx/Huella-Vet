import { requireAdmin } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase/server";
import { VeterinariansManager } from "@/components/veterinarians-manager";

export default async function VeterinariosPage() {
  await requireAdmin();
  const supabase = await createServerClient();
  const { data: vets } = await supabase
    .from("veterinarians")
    .select(
      "id, name, is_active, " +
        "schedules:vet_schedules(id, day_of_week, start_time, end_time), " +
        "days_off:vet_days_off(id, date)",
    )
    .order("name");

  const vetData = (vets ?? []) as unknown as {
    id: string;
    name: string;
    is_active: boolean;
    schedules: { id: string; day_of_week: number; start_time: string; end_time: string }[];
    days_off: { id: string; date: string }[];
  }[];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-ink">Veterinarios</h1>
      <VeterinariansManager vets={vetData} />
    </div>
  );
}

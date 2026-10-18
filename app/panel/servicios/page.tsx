import { requireAdmin } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase/server";
import { ServicesManager } from "@/components/services-manager";

export default async function ServiciosPage() {
  await requireAdmin();
  const supabase = await createServerClient();
  const { data: services } = await supabase
    .from("services")
    .select("id, name, price, is_active")
    .order("name");

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-ink">Servicios</h1>
      <ServicesManager services={services ?? []} />
    </div>
  );
}

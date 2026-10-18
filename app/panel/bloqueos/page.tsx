import { requireAdmin } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase/server";
import { BlocksManager } from "@/components/blocks-manager";

export default async function BloqueosPage() {
  await requireAdmin();
  const supabase = await createServerClient();
  const { data: blocks } = await supabase
    .from("blocked_dates")
    .select("id, date, start_time, end_time, reason")
    .order("date");

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-ink">Bloqueos de fechas</h1>
      <BlocksManager blocks={blocks ?? []} />
    </div>
  );
}

import { formatInTimeZone } from "date-fns-tz";
import { requireStaff } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase/server";
import { TIMEZONE } from "@/lib/constants";

const DAYS = 30;

export default async function MetricasPage() {
  await requireStaff();
  const supabase = await createServerClient();
  const since = new Date(new Date().getTime() - DAYS * 24 * 3600 * 1000).toISOString();

  const { data } = await supabase
    .from("appointments")
    .select("status, start_at, service:services(name)")
    .gte("start_at", since);

  const rows = (data ?? []) as unknown as {
    status: string;
    start_at: string;
    service: { name: string } | null;
  }[];
  const total = rows.length;
  const cancelled = rows.filter((r) => r.status === "cancelada").length;
  const rate = total > 0 ? Math.round((cancelled / total) * 100) : 0;

  const byService = new Map<string, number>();
  const byDay = new Map<string, number>();
  for (const r of rows) {
    const name = r.service?.name ?? "—";
    byService.set(name, (byService.get(name) ?? 0) + 1);
    const day = formatInTimeZone(r.start_at, TIMEZONE, "yyyy-MM-dd");
    byDay.set(day, (byDay.get(day) ?? 0) + 1);
  }

  const sortedByService = [...byService.entries()].sort((a, b) => b[1] - a[1]);
  const sortedByDay = [...byDay.entries()].sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-ink">Métricas</h1>
      <p className="text-sm text-slate-500">Últimos {DAYS} días.</p>

      <dl className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 p-4">
          <dt className="text-sm text-slate-500">Citas</dt>
          <dd className="text-3xl font-bold text-primary">{total}</dd>
        </div>
        <div className="rounded-lg border border-slate-200 p-4">
          <dt className="text-sm text-slate-500">Canceladas</dt>
          <dd className="text-3xl font-bold text-ink">{cancelled}</dd>
        </div>
        <div className="rounded-lg border border-slate-200 p-4">
          <dt className="text-sm text-slate-500">Tasa de cancelación</dt>
          <dd className="text-3xl font-bold text-ink">{rate}%</dd>
        </div>
      </dl>

      <div className="grid gap-6 sm:grid-cols-2">
        <section>
          <h2 className="text-sm font-semibold text-slate-700">Citas por servicio</h2>
          <ul className="mt-2 space-y-1">
            {sortedByService.map(([name, count]) => (
              <li key={name} className="flex justify-between text-sm">
                <span className="text-slate-600">{name}</span>
                <span className="font-medium">{count}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-slate-700">Citas por día</h2>
          <ul className="mt-2 space-y-1">
            {sortedByDay.map(([day, count]) => (
              <li key={day} className="flex justify-between text-sm">
                <span className="text-slate-600">{day}</span>
                <span className="font-medium">{count}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

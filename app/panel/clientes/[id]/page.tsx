import Link from "next/link";
import { notFound } from "next/navigation";
import { formatInTimeZone } from "date-fns-tz";
import { requireStaff } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase/server";
import { listAppointmentsForClient } from "@/lib/panel-data";
import { StatusBadge } from "@/components/status-badge";
import { TIMEZONE } from "@/lib/constants";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireStaff();
  const { id } = await params;
  const supabase = await createServerClient();

  const { data: client } = await supabase
    .from("clients")
    .select("id, name, phone, email, pets:pets(id, name, species, breed, age)")
    .eq("id", id)
    .maybeSingle();
  if (!client) notFound();

  const appts = await listAppointmentsForClient(supabase, id);

  return (
    <div className="space-y-6">
      <Link href="/panel/clientes" className="text-sm font-medium text-primary underline">
        ← Volver al directorio
      </Link>

      <div className="rounded-lg border border-slate-200 p-4">
        <h1 className="text-xl font-bold text-ink">{client.name}</h1>
        <p className="text-sm text-slate-600">
          {client.phone}
          {client.email ? ` · ${client.email}` : ""}
        </p>
        <div className="mt-3">
          <h2 className="text-sm font-semibold text-slate-700">Mascotas</h2>
          <ul className="mt-1 space-y-1">
            {(client.pets ?? []).map((p) => (
              <li key={p.id} className="text-sm text-slate-600">
                {p.name} — {p.species}
                {p.breed ? `, ${p.breed}` : ""}
                {p.age ? `, ${p.age}` : ""}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-ink">Historial de citas</h2>
        {appts.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">Sin citas registradas.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {appts.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 px-4 py-2">
                <span className="text-sm">
                  {formatInTimeZone(a.start_at, TIMEZONE, "dd/MM/yyyy HH:mm")} · {a.service?.name} · {a.veterinarian?.name}
                </span>
                <StatusBadge status={a.status} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

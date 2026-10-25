import Link from "next/link";
import { requireStaff } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase/server";

export default async function ClientesPage() {
  await requireStaff();
  const supabase = await createServerClient();
  const { data: clients } = await supabase
    .from("clients")
    .select("id, name, phone, email, pets:pets(id, name, species)")
    .order("name");

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-ink">Directorio de clientes</h1>
      {!clients || clients.length === 0 ? (
        <p className="text-sm text-slate-600">Aún no hay clientes registrados.</p>
      ) : (
        <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200">
          {clients.map((c) => (
            <li key={c.id}>
              <Link
                href={`/panel/clientes/${c.id}`}
                className="block px-4 py-3 transition hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-ink">{c.name}</span>
                  <span className="text-sm text-slate-500">{c.phone}</span>
                </div>
                <p className="text-xs text-slate-500">
                  Mascotas: {(c.pets ?? []).map((p) => `${p.name} (${p.species})`).join(", ") || "—"}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

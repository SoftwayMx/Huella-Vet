import Link from "next/link";
import { redirect } from "next/navigation";
import { getStaff } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";
import { PanelNav } from "@/components/panel-nav";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const staff = await getStaff();
  if (!staff) redirect("/login");

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <Link href="/panel/agenda" className="text-lg font-bold text-primary">
          Huella Vet · Panel
        </Link>
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <span>
            {staff.name} · {staff.role === "admin" ? "Administrador" : "Recepción"}
          </span>
          <LogoutButton />
        </div>
      </header>
      <div className="mt-4">
        <PanelNav role={staff.role} />
      </div>
      <div className="mt-6">{children}</div>
    </div>
  );
}

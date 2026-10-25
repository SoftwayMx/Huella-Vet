"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS: { href: string; label: string; roles: string[] }[] = [
  { href: "/panel/agenda", label: "Agenda", roles: ["admin", "recepcion"] },
  { href: "/panel/clientes", label: "Clientes", roles: ["admin", "recepcion"] },
  { href: "/panel/metricas", label: "Métricas", roles: ["admin", "recepcion"] },
  { href: "/panel/servicios", label: "Servicios", roles: ["admin"] },
  { href: "/panel/veterinarios", label: "Veterinarios", roles: ["admin"] },
  { href: "/panel/bloqueos", label: "Bloqueos", roles: ["admin"] },
];

export function PanelNav({ role }: { role: string }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Panel">
      <ul className="flex flex-wrap gap-1">
        {LINKS.filter((l) => l.roles.includes(role)).map((l) => {
          const active = pathname.startsWith(l.href);
          return (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`inline-block rounded-lg px-3 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  active ? "bg-primary text-white" : "text-primary hover:bg-surface"
                }`}
              >
                {l.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

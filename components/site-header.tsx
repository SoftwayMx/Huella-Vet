"use client";

import { useState } from "react";
import Link from "next/link";
import { PawLogo } from "./icons";

const NAV = [
  { href: "/#servicios", label: "Servicios" },
  { href: "/#veterinarios", label: "Veterinarios" },
  { href: "/contacto", label: "Contacto" },
];

const linkCls =
  "rounded text-sm font-medium text-ink transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="flex items-center gap-2 rounded text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <PawLogo className="h-8 w-8" />
          <span className="text-lg font-bold">Huella Vet</span>
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-5 md:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={linkCls}>
              {n.label}
            </Link>
          ))}
          <Link
            href="/agendar"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Agendar cita
          </Link>
        </nav>

        <button
          type="button"
          className="inline-flex min-h-[44px] items-center justify-center rounded p-2 text-primary md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-expanded={open}
          aria-controls="menu-movil"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">{open ? "Cerrar menú" : "Abrir menú"}</span>
          {open ? (
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          )}
        </button>
      </div>

      {open && (
        <nav id="menu-movil" aria-label="Móvil" className="border-t border-slate-200 px-4 py-3 md:hidden">
          <ul className="space-y-1">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} onClick={() => setOpen(false)} className="block rounded px-2 py-2 text-base font-medium text-ink hover:bg-surface">
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/agendar" onClick={() => setOpen(false)} className="block rounded bg-primary px-2 py-2 text-center text-base font-semibold text-white">
                Agendar cita
              </Link>
            </li>
            <li>
              <Link href="/consultar" onClick={() => setOpen(false)} className="block rounded px-2 py-2 text-base font-medium text-primary hover:bg-surface">
                Consultar mi cita
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}

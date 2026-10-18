import Link from "next/link";
import { PawLogo } from "./icons";
import { SITE } from "@/lib/site-info";

const linkCls = "hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 text-primary">
            <PawLogo className="h-7 w-7" />
            <span className="font-bold">Huella Vet</span>
          </div>
          <p className="mt-2 text-sm text-slate-600">{SITE.tagline}</p>
        </div>

        <nav aria-label="Enlaces del sitio">
          <h3 className="text-sm font-semibold text-ink">Explora</h3>
          <ul className="mt-2 space-y-1 text-sm text-slate-600">
            <li><Link href="/agendar" className={linkCls}>Agendar cita</Link></li>
            <li><Link href="/consultar" className={linkCls}>Consultar cita</Link></li>
            <li><Link href="/contacto" className={linkCls}>Contacto</Link></li>
          </ul>
        </nav>

        <div>
          <h3 className="text-sm font-semibold text-ink">Contacto</h3>
          <ul className="mt-2 space-y-1 text-sm text-slate-600">
            <li>{SITE.phoneDisplay}</li>
            <li>{SITE.email}</li>
            <li>{SITE.address}</li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-ink">Horarios</h3>
          <ul className="mt-2 space-y-1 text-sm text-slate-600">
            {SITE.hours.map((h) => (
              <li key={h.days}>
                <span className="font-medium text-ink">{h.days}:</span> {h.time}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-200">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 {SITE.name} — Proyecto de portafolio de Softway MX. Datos de ejemplo.</p>
          <div className="flex gap-4">
            <Link href="/aviso-de-privacidad" className={linkCls}>Aviso de privacidad</Link>
            <Link href="/terminos" className={linkCls}>Términos de uso</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

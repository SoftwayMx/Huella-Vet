import { BackLink } from "@/components/back-link";
import { SITE } from "@/lib/site-info";

export const metadata = { title: "Contacto — Huella Vet" };

export default function ContactoPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <BackLink href="/" />

      <h1 className="mt-6 text-3xl font-bold text-ink">Contacto</h1>
      <p className="mt-2 text-sm text-slate-600">
        Estamos para ayudarte a cuidar a tu mascota. ⚠️ Datos ficticios de ejemplo.
      </p>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-700">
          <div>
            <h2 className="font-semibold text-ink">Teléfono</h2>
            <a href={`tel:${SITE.phoneTel}`} className="text-primary underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
              {SITE.phoneDisplay}
            </a>
          </div>
          <div>
            <h2 className="font-semibold text-ink">WhatsApp</h2>
            <a
              href={SITE.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-primary px-4 py-2 font-semibold text-white transition hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
            >
              Escribir por WhatsApp
            </a>
          </div>
          <div>
            <h2 className="font-semibold text-ink">Correo</h2>
            <a href={`mailto:${SITE.email}`} className="text-primary underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
              {SITE.email}
            </a>
          </div>
        </div>

        <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-5 text-sm">
          <div>
            <h2 className="font-semibold text-ink">Dirección</h2>
            <p className="mt-1 text-slate-700">{SITE.address}</p>
            <div className="mt-3 flex min-h-[120px] items-center justify-center rounded-lg border border-dashed border-slate-300 bg-surface text-center text-xs text-slate-500">
              Mapa de la ubicación (pendiente de agregar)
            </div>
          </div>
          <div>
            <h2 className="font-semibold text-ink">Horarios de atención</h2>
            <ul className="mt-2 space-y-1">
              {SITE.hours.map((h) => (
                <li key={h.days} className="flex justify-between">
                  <span className="text-slate-600">{h.days}</span>
                  <span className="font-medium text-ink">{h.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

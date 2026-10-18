import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { IllustrationVariant, PawLogo, ServiceIcon } from "@/components/icons";
import { GalleryImage } from "@/components/gallery-image";
import { SITE } from "@/lib/site-info";

export const dynamic = "force-dynamic";

const mxn = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });

interface Service {
  id: string;
  name: string;
  price: number;
}
interface Vet {
  id: string;
  name: string;
}

async function getCatalog(): Promise<{ services: Service[]; veterinarians: Vet[] }> {
  try {
    const supabase = createServiceClient();
    const [s, v] = await Promise.all([
      supabase.from("services").select("id, name, price").eq("is_active", true).order("price", { ascending: true }),
      supabase.from("veterinarians").select("id, name").eq("is_active", true).order("name"),
    ]);
    return {
      services: (s.data ?? []) as Service[],
      veterinarians: (v.data ?? []) as Vet[],
    };
  } catch {
    return { services: [], veterinarians: [] };
  }
}

function initials(name: string): string {
  const clean = name.replace(/^Dr(a)?\.?\s*/i, "");
  return clean
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

const GALLERY: { src: string; alt: string; caption: string; variant: IllustrationVariant }[] = [
  { src: "/images/clinica-recepcion.jpg", alt: "Recepción de la clínica", caption: "Recepción", variant: "clinic" },
  { src: "/images/clinica-consultorio.jpg", alt: "Consultorio de atención", caption: "Consultorio", variant: "clinic" },
  { src: "/images/mascota-perro.jpg", alt: "Paciente perro", caption: "Nuestros pacientes", variant: "dog" },
  { src: "/images/mascota-gato.jpg", alt: "Paciente gato", caption: "Cuidamos a todos", variant: "cat" },
  { src: "/images/mascota-conejo.jpg", alt: "Paciente conejo", caption: "También exóticos", variant: "rabbit" },
  { src: "/images/equipo-veterinario.jpg", alt: "Equipo veterinario", caption: "Nuestro equipo", variant: "team" },
];

const STEPS = [
  { n: "1", title: "Elige servicio y veterinario", text: "Selecciona el servicio que necesita tu mascota y, si lo deseas, un veterinario." },
  { n: "2", title: "Elige un horario disponible", text: "Mira solo los horarios realmente libres y elige el que mejor te convenga." },
  { n: "3", title: "Recibe tu código", text: "Confirma tus datos y guarda el código para consultar o modificar tu cita." },
];

const ctaPrimary =
  "rounded-lg bg-primary px-6 py-3 text-base font-semibold text-white transition hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";
const ctaSecondary =
  "rounded-lg border border-primary px-6 py-3 text-base font-semibold text-primary transition hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";

export default async function Home() {
  const { services, veterinarians } = await getCatalog();

  return (
    <div className="mx-auto max-w-5xl px-4">
      {/* Principal */}
      <section className="py-14 text-center sm:py-20">
        <div className="mx-auto max-w-2xl">
          <PawLogo className="mx-auto h-14 w-14 text-primary" />
          <h1 className="mt-4 text-4xl font-bold text-ink sm:text-5xl">Cuidamos a tu mejor amigo</h1>
          <p className="mt-4 text-lg text-slate-700">
            Agenda, consulta y administra citas veterinarias en línea, sin llamar por teléfono.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/agendar" className={ctaPrimary}>Agendar cita</Link>
            <Link href="/consultar" className={ctaSecondary}>Consultar mi cita</Link>
          </div>
        </div>
      </section>

      {/* Servicios */}
      <section id="servicios" className="py-10">
        <h2 className="text-2xl font-bold text-ink">Servicios</h2>
        <p className="mt-1 text-sm text-slate-600">Precios en pesos mexicanos (MXN). Cada cita dura 30 minutos.</p>
        {services.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">Servicios disponibles próximamente.</p>
        ) : (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <li key={s.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-50 text-primary">
                  <ServiceIcon name={s.name} className="h-6 w-6" />
                </span>
                <div>
                  <p className="font-semibold text-ink">{s.name}</p>
                  <p className="text-sm text-slate-600">{mxn.format(s.price)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Veterinarios */}
      <section id="veterinarios" className="py-10">
        <h2 className="text-2xl font-bold text-ink">Nuestro equipo</h2>
        <p className="mt-1 text-sm text-slate-600">Profesionales que cuidan a tu mascota.</p>
        {veterinarians.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">Próximamente.</p>
        ) : (
          <ul className="mt-6 grid gap-4 sm:grid-cols-3">
            {veterinarians.map((v) => (
              <li key={v.id} className="rounded-xl border border-slate-200 bg-white p-5 text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
                  {initials(v.name)}
                </span>
                <p className="mt-3 font-semibold text-ink">{v.name}</p>
                <p className="text-sm text-slate-500">Médico Veterinario</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Galería */}
      <section id="galeria" className="py-10">
        <h2 className="text-2xl font-bold text-ink">Nuestro espacio</h2>
        <p className="mt-1 text-sm text-slate-600">Un lugar pensado para el bienestar de tu mascota.</p>
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {GALLERY.map((g) => (
            <li key={g.src}>
              <figure className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <GalleryImage src={g.src} alt={g.alt} variant={g.variant} />
                <figcaption className="px-3 py-2 text-xs text-slate-600">{g.caption}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </section>

      {/* Cómo funciona */}
      <section className="py-10">
        <h2 className="text-2xl font-bold text-ink">¿Cómo funciona?</h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-3">
          {STEPS.map((s) => (
            <li key={s.n} className="rounded-xl border border-slate-200 bg-white p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">
                {s.n}
              </span>
              <h3 className="mt-3 font-semibold text-ink">{s.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Contacto */}
      <section id="contacto" className="py-10">
        <h2 className="text-2xl font-bold text-ink">Contacto</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-700">
            <p><span className="font-semibold text-ink">Teléfono:</span> {SITE.phoneDisplay}</p>
            <p><span className="font-semibold text-ink">Correo:</span> {SITE.email}</p>
            <p><span className="font-semibold text-ink">Dirección:</span> {SITE.address}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm">
            <h3 className="font-semibold text-ink">Horarios</h3>
            <ul className="mt-2 space-y-1">
              {SITE.hours.map((h) => (
                <li key={h.days} className="flex justify-between">
                  <span className="text-slate-600">{h.days}</span>
                  <span className="font-medium text-ink">{h.time}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-col gap-2">
              <a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer" className={ctaPrimary + " text-center"}>
                Escribir por WhatsApp
              </a>
              <Link href="/contacto" className={ctaSecondary + " text-center"}>
                Ver contacto completo
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

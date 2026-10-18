import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="text-4xl font-bold text-primary">Huella Vet</h1>
      <p className="mx-auto mt-4 max-w-md text-lg text-slate-700">
        Agenda, consulta y administra citas veterinarias en línea, sin llamar por teléfono.
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          href="/agendar"
          className="rounded-lg bg-primary px-6 py-3 text-base font-semibold text-white transition hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          Agendar cita
        </Link>
        <Link
          href="/consultar"
          className="rounded-lg border border-primary px-6 py-3 text-base font-semibold text-primary transition hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          Consultar mi cita
        </Link>
      </div>
      <p className="mt-10 text-xs text-slate-400">
        Proyecto de portafolio de Softway MX. Datos de ejemplo.
      </p>
    </main>
  );
}

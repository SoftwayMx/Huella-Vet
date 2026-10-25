import { BackLink } from "@/components/back-link";

export const metadata = { title: "Términos de uso — Huella Vet" };

export default function TerminosPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <BackLink href="/" />

      <h1 className="mt-6 text-3xl font-bold text-ink">Términos de uso</h1>
      <p className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
        ⚠️ Documento de ejemplo para un proyecto de portafolio. No constituye asesoría legal y debe ser
        revisado por un abogado antes de usarse con un cliente real.
      </p>

      <div className="mt-6 space-y-6 text-sm leading-relaxed text-slate-700">
        <section>
          <h2 className="text-lg font-semibold text-ink">1. Aceptación</h2>
          <p className="mt-1">
            Al usar este sitio de citas de Huella Vet (nombre ficticio de ejemplo), aceptas estos términos.
            Si no estás de acuerdo, no utilices el servicio.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink">2. Uso del servicio</h2>
          <p className="mt-1">
            El sitio permite agendar, consultar, reprogramar y cancelar citas veterinarias. Te comprometes
            a proporcionar información veraz y a no usar el servicio con fines ilícitos.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink">3. Citas</h2>
          <ul className="mt-1 list-disc pl-5 space-y-1">
            <li>Cada cita ocupa un bloque de 30 minutos.</li>
            <li>Para agendar se requiere una anticipación mínima de 2 horas.</li>
            <li>Puedes cancelar o reprogramar hasta 4 horas antes de la cita.</li>
            <li>La disponibilidad mostrada es la vigente al momento de la consulta y puede cambiar.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink">4. Contenido de ejemplo</h2>
          <p className="mt-1">
            Este es un proyecto de portafolio. Los nombres, teléfonos, direcciones, precios y demás datos
            son ficticios y no corresponden a personas ni a una clínica real.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink">5. Limitación de responsabilidad</h2>
          <p className="mt-1">
            El servicio se ofrece &quot;tal cual&quot; y sin garantías. No nos hacemos responsables por
            daños derivados del uso del sitio o de la información publicada en él.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-ink">6. Última actualización</h2>
          <p className="mt-1">18 de octubre de 2026.</p>
        </section>
      </div>
    </div>
  );
}

import { ConsultForm } from "@/components/consult-form";
import { BackLink } from "@/components/back-link";

export const metadata = { title: "Consultar cita — Huella Vet" };

export default function ConsultarPage() {
  return (
    <main className="mx-auto max-w-xl px-4 py-8">
      <BackLink href="/" />
      <h1 className="mt-6 text-2xl font-bold text-ink">Consulta tu cita</h1>
      <p className="mt-1 text-sm text-slate-600">
        Ingresa tu código de cita y tu teléfono para consultar, reprogramar o cancelar.
      </p>
      <div className="mt-6">
        <ConsultForm />
      </div>
    </main>
  );
}

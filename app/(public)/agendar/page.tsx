import { BookingFlow } from "@/components/booking-flow";

export const metadata = { title: "Agendar cita — Huella Vet" };

export default function AgendarPage() {
  return (
    <main className="mx-auto max-w-xl px-4 py-8">
      <h1 className="text-2xl font-bold text-ink">Agenda una cita</h1>
      <p className="mt-1 text-sm text-slate-600">
        Sin crear cuenta. Elige servicio, veterinario y horario disponible.
      </p>
      <div className="mt-6">
        <BookingFlow />
      </div>
    </main>
  );
}

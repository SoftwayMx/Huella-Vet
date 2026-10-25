"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { transitionAppointment } from "@/actions/appointments";
import { canTransition } from "@/lib/transitions";
import { AppointmentStatus } from "@/lib/constants";

const ACTIONS: { to: AppointmentStatus; label: string }[] = [
  { to: "confirmada", label: "Confirmar" },
  { to: "completada", label: "Completar" },
  { to: "no_asistio", label: "No asistió" },
  { to: "cancelada", label: "Cancelar" },
];

export function AppointmentActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const available = ACTIONS.filter((a) =>
    canTransition(status as AppointmentStatus, a.to),
  );
  if (available.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1">
      {available.map((a) => (
        <button
          key={a.to}
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              setError(null);
              const r = await transitionAppointment(id, a.to);
              if (!r.ok) setError(r.error ?? "Error al actualizar.");
              router.refresh();
            })
          }
          className="rounded border border-primary px-2 py-1 text-xs font-medium text-primary transition hover:bg-primary hover:text-white disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {a.label}
        </button>
      ))}
      {error && (
        <p role="alert" className="w-full text-xs text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

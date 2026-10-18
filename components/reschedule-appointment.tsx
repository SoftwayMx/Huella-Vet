"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { rescheduleAppointment } from "@/actions/appointments";
import { SlotPicker } from "./slot-picker";

export function RescheduleAppointment({
  id,
  veterinarianId,
  status,
}: {
  id: string;
  veterinarianId: string;
  status: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  if (status !== "pendiente" && status !== "confirmada") return null;

  if (open) {
    return (
      <div className="space-y-2 rounded-lg border border-slate-200 p-2">
        <SlotPicker
          veterinarianId={veterinarianId}
          onSelect={(s) =>
            startTransition(async () => {
              await rescheduleAppointment(id, s.startAt);
              router.refresh();
              setOpen(false);
            })
          }
        />
        <button
          type="button"
          onClick={() => setOpen(false)}
          disabled={pending}
          className="text-xs font-medium text-primary underline"
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="rounded border border-slate-300 px-2 py-1 text-xs font-medium text-ink transition hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      Reprogramar
    </button>
  );
}

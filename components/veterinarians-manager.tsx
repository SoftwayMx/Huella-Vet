"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  deleteVeterinarian,
  removeDayOff,
  removeSchedule,
  saveDayOff,
  saveSchedule,
  saveVeterinarian,
} from "@/actions/veterinarians";
import { Alert, Button, Field, TextInput } from "./ui";

interface Schedule {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}
interface DayOff {
  id: string;
  date: string;
}
interface Vet {
  id: string;
  name: string;
  is_active: boolean;
  schedules: Schedule[];
  days_off: DayOff[];
}

const DAY_LABELS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export function VeterinariansManager({ vets }: { vets: Vet[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // formularios por veterinario: horario y descanso
  const [sched, setSched] = useState<Record<string, { day: string; start: string; end: string }>>({});
  const [offDate, setOffDate] = useState<Record<string, string>>({});

  function run(fn: () => Promise<{ ok: boolean; error?: string }>, okMsg: string) {
    startTransition(async () => {
      setError(null);
      setNotice(null);
      const r = await fn();
      if (!r.ok) setError(r.error ?? "Error.");
      else setNotice(okMsg);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(async () => saveVeterinarian({ name }), "Veterinario creado.");
          setName("");
        }}
        className="flex flex-wrap items-end gap-2 rounded-lg border border-slate-200 p-4"
      >
        <div className="flex-1">
          <Field label="Nombre del veterinario" htmlFor="vet-name" required>
            <TextInput id="vet-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </Field>
        </div>
        <Button type="submit" disabled={pending}>
          Agregar
        </Button>
      </form>

      {error && <Alert>{error}</Alert>}
      {notice && <p className="text-sm text-primary">{notice}</p>}

      <ul className="space-y-4">
        {vets.filter((v) => v.is_active).map((v) => {
          const s = sched[v.id] ?? { day: "1", start: "09:00", end: "19:00" };
          const off = offDate[v.id] ?? "";
          return (
            <li key={v.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-ink">{v.name}</h3>
                <button
                  type="button"
                  onClick={() => run(async () => deleteVeterinarian(v.id), "Veterinario desactivado.")}
                  className="text-xs font-medium text-red-700 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Desactivar
                </button>
              </div>

              <div className="mt-3">
                <p className="text-sm font-medium text-slate-700">Horarios</p>
                {v.schedules.length === 0 && <p className="text-xs text-slate-500">Sin horarios (no disponible).</p>}
                <ul className="mt-1 space-y-1">
                  {v.schedules.map((sc) => (
                    <li key={sc.id} className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">
                        {DAY_LABELS[sc.day_of_week]} {sc.start_time.slice(0, 5)}–{sc.end_time.slice(0, 5)}
                      </span>
                      <button
                        type="button"
                        onClick={() => run(async () => removeSchedule(sc.id), "Horario eliminado.")}
                        className="text-xs text-red-700 underline"
                      >
                        Quitar
                      </button>
                    </li>
                  ))}
                </ul>

                <form
                  className="mt-2 flex flex-wrap items-end gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    run(
                      async () =>
                        saveSchedule({
                          veterinarianId: v.id,
                          dayOfWeek: Number(s.day),
                          startTime: s.start,
                          endTime: s.end,
                        }),
                      "Horario guardado.",
                    );
                  }}
                >
                  <label className="text-xs text-slate-600">
                    Día
                    <select
                      value={s.day}
                      onChange={(e) => setSched({ ...sched, [v.id]: { ...s, day: e.target.value } })}
                      className="ml-1 rounded border border-slate-300 px-2 py-1 text-sm"
                    >
                      {DAY_LABELS.map((d, i) => (
                        <option key={i} value={i}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-xs text-slate-600">
                    Inicio
                    <input
                      type="time"
                      value={s.start}
                      onChange={(e) => setSched({ ...sched, [v.id]: { ...s, start: e.target.value } })}
                      className="ml-1 rounded border border-slate-300 px-2 py-1 text-sm"
                    />
                  </label>
                  <label className="text-xs text-slate-600">
                    Fin
                    <input
                      type="time"
                      value={s.end}
                      onChange={(e) => setSched({ ...sched, [v.id]: { ...s, end: e.target.value } })}
                      className="ml-1 rounded border border-slate-300 px-2 py-1 text-sm"
                    />
                  </label>
                  <button type="submit" disabled={pending} className="rounded bg-primary px-3 py-1 text-sm font-semibold text-white disabled:opacity-50">
                    Guardar
                  </button>
                </form>
              </div>

              <div className="mt-3">
                <p className="text-sm font-medium text-slate-700">Descansos puntuales</p>
                {v.days_off.length === 0 && <p className="text-xs text-slate-500">Sin descansos puntuales.</p>}
                <ul className="mt-1 space-y-1">
                  {v.days_off.map((d) => (
                    <li key={d.id} className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">{d.date}</span>
                      <button
                        type="button"
                        onClick={() => run(async () => removeDayOff(d.id), "Descanso eliminado.")}
                        className="text-xs text-red-700 underline"
                      >
                        Quitar
                      </button>
                    </li>
                  ))}
                </ul>
                <form
                  className="mt-2 flex flex-wrap items-end gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    run(async () => saveDayOff({ veterinarianId: v.id, date: off }), "Descanso guardado.");
                    setOffDate({ ...offDate, [v.id]: "" });
                  }}
                >
                  <label className="text-xs text-slate-600">
                    Fecha
                    <input
                      type="date"
                      value={off}
                      onChange={(e) => setOffDate({ ...offDate, [v.id]: e.target.value })}
                      className="ml-1 rounded border border-slate-300 px-2 py-1 text-sm"
                    />
                  </label>
                  <button type="submit" disabled={pending} className="rounded bg-primary px-3 py-1 text-sm font-semibold text-white disabled:opacity-50">
                    Agregar
                  </button>
                </form>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

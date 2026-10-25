"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createBlock, deleteBlock } from "@/actions/blocks";
import { Alert, Button, Field, TextInput } from "./ui";

interface Block {
  id: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  reason: string | null;
}

export function BlocksManager({ blocks }: { blocks: Block[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      setError(null);
      setNotice(null);
      const r = await createBlock({ date, startTime: startTime || undefined, endTime: endTime || undefined, reason: reason || undefined });
      if (!r.ok) {
        setError(r.error ?? "Error al crear el bloqueo.");
        return;
      }
      setNotice("Bloqueo creado.");
      setDate("");
      setStartTime("");
      setEndTime("");
      setReason("");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="space-y-3 rounded-lg border border-slate-200 p-4">
        <h2 className="font-semibold text-ink">Nuevo bloqueo de fecha</h2>
        <Field label="Fecha" htmlFor="blk-date" required>
          <TextInput id="blk-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </Field>
        <div className="flex gap-4">
          <div className="flex-1">
            <Field label="Inicio (opcional)" htmlFor="blk-start">
              <TextInput id="blk-start" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </Field>
          </div>
          <div className="flex-1">
            <Field label="Fin (opcional)" htmlFor="blk-end">
              <TextInput id="blk-end" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </Field>
          </div>
        </div>
        <Field label="Motivo (opcional)" htmlFor="blk-reason">
          <TextInput id="blk-reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ej. Festivo" />
        </Field>
        <p className="text-xs text-slate-500">Sin horario = bloquea todo el día.</p>
        {error && <Alert>{error}</Alert>}
        {notice && <p className="text-sm text-primary">{notice}</p>}
        <Button type="submit" disabled={pending}>
          Crear bloqueo
        </Button>
      </form>

      <div>
        <h2 className="font-semibold text-ink">Bloqueos programados</h2>
        {blocks.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">No hay bloqueos programados.</p>
        ) : (
          <ul className="mt-2 divide-y divide-slate-200 rounded-lg border border-slate-200">
            {blocks.map((b) => (
              <li key={b.id} className="flex items-center justify-between px-4 py-2">
                <span className="text-sm">
                  {b.date}
                  {b.start_time && b.end_time ? ` · ${b.start_time.slice(0, 5)}–${b.end_time.slice(0, 5)}` : " · todo el día"}
                  {b.reason ? ` · ${b.reason}` : ""}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    startTransition(async () => {
                      setError(null);
                      setNotice(null);
                      const r = await deleteBlock(b.id);
                      if (!r.ok) setError(r.error ?? "Error.");
                      router.refresh();
                    })
                  }
                  className="text-xs font-medium text-red-700 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

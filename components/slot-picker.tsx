"use client";

import { useEffect, useState } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { TIMEZONE } from "@/lib/constants";
import { Alert, Button, Spinner } from "./ui";

export interface Slot {
  startAt: string;
  endAt: string;
}

function shiftDate(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

export function SlotPicker({
  veterinarianId,
  onSelect,
}: {
  veterinarianId: string | null;
  onSelect: (slot: Slot) => void;
}) {
  const today = formatInTimeZone(new Date(), TIMEZONE, "yyyy-MM-dd");
  const [date, setDate] = useState(today);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="secondary" onClick={() => setDate(shiftDate(date, -1))} aria-label="Día anterior">
          ←
        </Button>
        <input
          type="date"
          value={date}
          min={today}
          onChange={(e) => setDate(e.target.value)}
          aria-label="Seleccionar fecha"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        />
        <Button variant="secondary" onClick={() => setDate(shiftDate(date, 1))} aria-label="Día siguiente">
          →
        </Button>
      </div>

      <SlotList
        key={`${date}:${veterinarianId ?? "any"}`}
        date={date}
        veterinarianId={veterinarianId}
        onSelect={onSelect}
      />
    </div>
  );
}

function SlotList({
  date,
  veterinarianId,
  onSelect,
}: {
  date: string;
  veterinarianId: string | null;
  onSelect: (slot: Slot) => void;
}) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const params = new URLSearchParams({ date });
    if (veterinarianId) params.set("veterinarianId", veterinarianId);

    fetch(`/api/public/availability?${params}`)
      .then((r) => r.json().then((body) => ({ ok: r.ok, body })))
      .then(({ ok, body }) => {
        if (!active) return;
        if (!ok) {
          setError(body.error ?? "No se pudo consultar la disponibilidad.");
          return;
        }
        setSlots(body.slots ?? []);
      })
      .catch(() => {
        if (active) setError("No se pudo consultar la disponibilidad.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [date, veterinarianId]);

  if (loading) return <Spinner label="Buscando horarios…" />;
  if (error) return <Alert>{error}</Alert>;
  if (slots.length === 0) {
    return <p className="text-sm text-slate-600">No hay horarios disponibles para esta fecha.</p>;
  }

  return (
    <ul aria-label="Horarios disponibles" className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {slots.map((s) => (
        <li key={s.startAt}>
          <button
            type="button"
            onClick={() => onSelect(s)}
            className="w-full rounded-lg border border-primary px-2 py-2 text-sm font-medium text-primary transition hover:bg-primary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {formatInTimeZone(s.startAt, TIMEZONE, "HH:mm")}
          </button>
        </li>
      ))}
    </ul>
  );
}

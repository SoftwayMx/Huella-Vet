"use client";

import { useState } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { STATUS_LABELS, TIMEZONE } from "@/lib/constants";
import { SlotPicker } from "./slot-picker";
import { Alert, Button, Field, Spinner, Success, TextInput } from "./ui";

interface Appointment {
  code: string;
  status: string;
  startAt: string;
  endAt: string;
  reason: string | null;
  veterinarianId: string;
  service: { name: string; price: number };
  veterinarian: { name: string };
  pet: { name: string; species: string };
}

type View = "form" | "details" | "reschedule";

export function ConsultForm() {
  const [code, setCode] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appt, setAppt] = useState<Appointment | null>(null);
  const [canCancel, setCanCancel] = useState(false);
  const [canReschedule, setCanReschedule] = useState(false);
  const [view, setView] = useState<View>("form");
  const [notice, setNotice] = useState<string | null>(null);

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      const params = new URLSearchParams({ code, phone: phone.replace(/\D/g, "") });
      const r = await fetch(`/api/public/appointments?${params}`);
      const body = await r.json();
      if (!r.ok) {
        setError(body.error ?? "No se encontró la cita.");
        return;
      }
      setAppt(body.appointment);
      setCanCancel(body.canCancel);
      setCanReschedule(body.canReschedule);
      setView("details");
    } catch {
      setError("No se pudo consultar la cita.");
    } finally {
      setLoading(false);
    }
  }

  async function patch(action: "cancel" | "reschedule", newStartAt?: string) {
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      const r = await fetch("/api/public/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, phone: phone.replace(/\D/g, ""), action, newStartAt }),
      });
      const body = await r.json();
      if (!r.ok) {
        setError(body.error ?? "No se pudo completar la operación.");
        return;
      }
      if (action === "cancel") {
        setNotice("Tu cita fue cancelada.");
        setView("form");
        setAppt(null);
      } else {
        setNotice(`Tu cita fue reprogramada para ${formatInTimeZone(body.startAt, TIMEZONE, "EEEE dd/MM/yyyy HH:mm")}.`);
        setView("form");
        setAppt(null);
      }
    } catch {
      setError("No se pudo completar la operación.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {view === "form" && (
        <form onSubmit={lookup} className="space-y-4">
          <Field label="Código de cita" htmlFor="code" required>
            <TextInput id="code" value={code} onChange={(e) => setCode(e.target.value)} autoComplete="off" placeholder="Ej. A1B2C3D4" />
          </Field>
          <Field label="Teléfono" htmlFor="phone" required>
            <TextInput id="phone" type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
          </Field>
          {error && <Alert>{error}</Alert>}
          {notice && <Success>{notice}</Success>}
          <Button type="submit" disabled={loading}>
            {loading ? "Consultando…" : "Consultar cita"}
          </Button>
        </form>
      )}

      {view === "details" && appt && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-primary">Tu cita</h2>
          <dl className="space-y-2 rounded-lg border border-slate-200 p-4 text-sm">
            <div className="flex justify-between"><dt className="text-slate-500">Estado</dt><dd className="font-semibold">{STATUS_LABELS[appt.status as keyof typeof STATUS_LABELS] ?? appt.status}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Servicio</dt><dd className="font-semibold">{appt.service.name}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Veterinario</dt><dd>{appt.veterinarian.name}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Mascota</dt><dd>{appt.pet.name} ({appt.pet.species})</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Fecha y hora</dt><dd>{formatInTimeZone(appt.startAt, TIMEZONE, "EEEE dd/MM/yyyy HH:mm")}</dd></div>
            {appt.reason && <div className="flex justify-between"><dt className="text-slate-500">Motivo</dt><dd>{appt.reason}</dd></div>}
          </dl>

          {error && <Alert>{error}</Alert>}
          {notice && <Success>{notice}</Success>}

          {(canCancel || canReschedule) ? (
            <div className="flex flex-wrap gap-2">
              {canReschedule && (
                <Button variant="secondary" onClick={() => setView("reschedule")} disabled={loading}>
                  Reprogramar
                </Button>
              )}
              {canCancel && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (window.confirm("¿Seguro que quieres cancelar esta cita?")) patch("cancel");
                  }}
                  disabled={loading}
                >
                  Cancelar cita
                </Button>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-600">
              {["cancelada", "completada", "no_asistio"].includes(appt.status)
                ? "Esta cita ya no se puede modificar."
                : "Ya no es posible cancelar o reprogramar (mínimo 4 horas antes)."}
            </p>
          )}

          <Button variant="ghost" onClick={() => setView("form")} disabled={loading}>
            ← Consultar otra cita
          </Button>
        </div>
      )}

      {view === "reschedule" && appt && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold">Elige un nuevo horario</h2>
          {error && <Alert>{error}</Alert>}
          <SlotPicker
            veterinarianId={appt.veterinarianId}
            onSelect={(s) => patch("reschedule", s.startAt)}
          />
          <Button variant="ghost" onClick={() => setView("details")} disabled={loading}>
            ← Volver
          </Button>
          {loading && <Spinner label="Reprogramando…" />}
        </div>
      )}
    </div>
  );
}

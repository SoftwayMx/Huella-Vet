"use client";

import { useEffect, useState } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { TIMEZONE } from "@/lib/constants";
import Link from "next/link";
import { Slot, SlotPicker } from "./slot-picker";
import { Alert, Button, Field, Spinner, Success, TextArea, TextInput } from "./ui";
import { BackLink } from "./back-link";

interface Service {
  id: string;
  name: string;
  price: number;
}
interface Vet {
  id: string;
  name: string;
}

const STEPS = ["Servicio", "Veterinario", "Horario", "Tus datos", "Confirmación"];

export function BookingFlow() {
  const [step, setStep] = useState(0);
  const [services, setServices] = useState<Service[]>([]);
  const [vets, setVets] = useState<Vet[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [service, setService] = useState<Service | null>(null);
  const [vet, setVet] = useState<Vet | null>(null); // null = cualquier veterinario
  const [slot, setSlot] = useState<Slot | null>(null);

  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [petName, setPetName] = useState("");
  const [species, setSpecies] = useState("");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [reason, setReason] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<{ code: string; service: string; startAt: string } | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/public/services").then((r) => r.json()),
      fetch("/api/public/veterinarians").then((r) => r.json()),
    ])
      .then(([s, v]) => {
        setServices(s.services ?? []);
        setVets(v.veterinarians ?? []);
      })
      .catch(() => setLoadError("No se pudieron cargar los servicios. Intenta de nuevo."))
      .finally(() => setLoading(false));
  }, []);

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  function validateData(): boolean {
    const e: Record<string, string> = {};
    if (!ownerName.trim()) e.ownerName = "Ingresa tu nombre";
    if (phone.replace(/\D/g, "").length < 10) e.phone = "Ingresa un teléfono válido";
    if (!petName.trim()) e.petName = "Ingresa el nombre de la mascota";
    if (!species.trim()) e.species = "Ingresa la especie";
    if (!consent) e.consent = "Debes aceptar el consentimiento y aviso de privacidad";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit() {
    if (!validateData()) return;
    setSubmitting(true);
    setSubmitError(null);

    const payload = {
      serviceId: service!.id,
      veterinarianId: vet?.id ?? null,
      startAt: slot!.startAt,
      client: { name: ownerName, phone, email: email || undefined },
      pet: { name: petName, species, breed: breed || undefined, age: age || undefined },
      reason: reason || undefined,
      consent: true,
    };

    try {
      const r = await fetch("/api/public/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await r.json();
      if (!r.ok) {
        setSubmitError(body.error ?? "No se pudo agendar la cita.");
        return;
      }
      setResult({
        code: body.code,
        service: body.appointment.service,
        startAt: body.appointment.startAt,
      });
      setStep(4);
    } catch {
      setSubmitError("No se pudo agendar la cita. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <Spinner label="Cargando servicios…" />;
  if (loadError) return <Alert>{loadError}</Alert>;
  if (result) {
    return (
      <div className="space-y-4 text-center">
        <div className="text-left">
          <BackLink href="/" label="Volver al inicio" />
        </div>
        <h2 className="text-2xl font-bold text-primary">¡Cita agendada!</h2>
        <p className="text-slate-600">
          {result.service} el {formatInTimeZone(result.startAt, TIMEZONE, "EEEE dd/MM/yyyy HH:mm")}.
        </p>
        <Success>
          <p className="text-sm">Guarda tu código de cita:</p>
          <p className="mt-1 text-3xl font-black tracking-widest text-primary">{result.code}</p>
          <p className="mt-2 text-xs">Lo necesitarás junto con tu teléfono para consultar o modificar tu cita.</p>
        </Success>
        <Link
          href="/consultar"
          className="inline-block rounded text-sm font-semibold text-primary underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          Consultar mi cita
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {step === 0 ? <BackLink href="/" /> : <BackLink onClick={back} />}

      <nav aria-label="Progreso">
        <ol className="flex flex-wrap gap-1 text-xs font-medium">
          {STEPS.map((label, i) => (
            <li
              key={label}
              className={`rounded-full px-3 py-1 ${i === step ? "bg-primary text-white" : i < step ? "bg-teal-100 text-primary-dark" : "bg-slate-100 text-slate-500"}`}
              aria-current={i === step ? "step" : undefined}
            >
              {i + 1}. {label}
            </li>
          ))}
        </ol>
      </nav>

      {step === 0 && (
        <section aria-label="Elegir servicio">
          <h2 className="text-lg font-bold">Elige un servicio</h2>
          <ul className="mt-3 grid gap-2">
            {services.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => {
                    setService(s);
                    next();
                  }}
                  className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    service?.id === s.id ? "border-primary bg-teal-50" : "border-slate-200 hover:border-primary"
                  }`}
                >
                  <span className="font-medium text-ink">{s.name}</span>
                  <span className="text-sm text-slate-600">
                    {new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(s.price)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {step === 1 && (
        <section aria-label="Elegir veterinario">
          <h2 className="text-lg font-bold">¿Prefieres algún veterinario?</h2>
          <ul className="mt-3 grid gap-2">
            <li>
              <button
                type="button"
                onClick={() => {
                  setVet(null);
                  next();
                }}
                className={`w-full rounded-lg border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  vet === null ? "border-primary bg-teal-50" : "border-slate-200 hover:border-primary"
                }`}
              >
                <span className="font-medium">Cualquiera (el primero disponible)</span>
              </button>
            </li>
            {vets.map((v) => (
              <li key={v.id}>
                <button
                  type="button"
                  onClick={() => {
                    setVet(v);
                    next();
                  }}
                  className={`w-full rounded-lg border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    vet?.id === v.id ? "border-primary bg-teal-50" : "border-slate-200 hover:border-primary"
                  }`}
                >
                  <span className="font-medium text-ink">{v.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {step === 2 && (
        <section aria-label="Elegir horario">
          <h2 className="text-lg font-bold">Elige fecha y horario</h2>
          <p className="mt-1 text-sm text-slate-600">
            Cada cita dura 30 minutos. Solo se muestran los horarios disponibles.
          </p>
          <div className="mt-3">
            <SlotPicker veterinarianId={vet?.id ?? null} onSelect={(s) => setSlot(s)} />
          </div>
        </section>
      )}

      {step === 3 && (
        <section aria-label="Tus datos" className="space-y-4">
          <h2 className="text-lg font-bold">Datos del dueño y de la mascota</h2>
          <Field label="Nombre del dueño" htmlFor="ownerName" required error={errors.ownerName}>
            <TextInput id="ownerName" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} autoComplete="name" error={errors.ownerName} />
          </Field>
          <Field label="Teléfono" htmlFor="phone" required error={errors.phone}>
            <TextInput id="phone" type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" error={errors.phone} />
          </Field>
          <Field label="Correo (opcional)" htmlFor="email" error={errors.email}>
            <TextInput id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" error={errors.email} />
          </Field>
          <Field label="Nombre de la mascota" htmlFor="petName" required error={errors.petName}>
            <TextInput id="petName" value={petName} onChange={(e) => setPetName(e.target.value)} error={errors.petName} />
          </Field>
          <Field label="Especie" htmlFor="species" required error={errors.species}>
            <TextInput id="species" value={species} onChange={(e) => setSpecies(e.target.value)} placeholder="Perro, gato…" error={errors.species} />
          </Field>
          <Field label="Raza (opcional)" htmlFor="breed">
            <TextInput id="breed" value={breed} onChange={(e) => setBreed(e.target.value)} />
          </Field>
          <Field label="Edad (opcional)" htmlFor="age">
            <TextInput id="age" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Ej. 2 años" />
          </Field>
          <Field label="Motivo de la consulta (opcional)" htmlFor="reason">
            <TextArea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} rows={3} />
          </Field>
          <div>
            <label className="flex items-start gap-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-primary"
              />
              <span>
                Acepto el{" "}
                <a
                  href="/aviso-de-privacidad"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded font-semibold text-primary underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  aviso de privacidad
                </a>{" "}
                y consiento el tratamiento de mis datos para agendar esta cita.
              </span>
            </label>
            {errors.consent && (
              <p role="alert" className="mt-1 text-sm text-red-700">
                {errors.consent}
              </p>
            )}
          </div>
        </section>
      )}

      {submitError && <Alert>{submitError}</Alert>}

      {step === 2 && (
        <div className="flex justify-end">
          <Button onClick={next} disabled={!slot}>
            Continuar
          </Button>
        </div>
      )}

      {step === 3 && (
        <div className="flex justify-end">
          <Button onClick={submit} disabled={submitting}>
            {submitting ? "Agendando…" : "Confirmar cita"}
          </Button>
        </div>
      )}
    </div>
  );
}

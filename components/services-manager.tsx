"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteService, saveService } from "@/actions/services";
import { Alert, Button, Field, TextInput } from "./ui";

interface Service {
  id: string;
  name: string;
  price: number;
  is_active: boolean;
}

const mxn = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });

export function ServicesManager({ services }: { services: Service[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState<{ id: string; name: string; price: string } | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const active = services.filter((s) => s.is_active);
  const inactive = services.filter((s) => !s.is_active);

  function reset() {
    setEditing(null);
    setName("");
    setPrice("");
    setError(null);
    setNotice(null);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      setError(null);
      setNotice(null);
      const r = await saveService({ id: editing?.id, name, price });
      if (!r.ok) {
        setError(r.error ?? "Error al guardar.");
        return;
      }
      setNotice(editing ? "Servicio actualizado." : "Servicio creado.");
      reset();
      router.refresh();
    });
  }

  function remove(id: string) {
    if (!window.confirm("¿Desactivar este servicio?")) return;
    startTransition(async () => {
      setError(null);
      setNotice(null);
      const r = await deleteService(id);
      if (!r.ok) setError(r.error ?? "Error al desactivar.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="space-y-3 rounded-lg border border-slate-200 p-4">
        <h2 className="font-semibold text-ink">{editing ? "Editar servicio" : "Nuevo servicio"}</h2>
        <Field label="Nombre" htmlFor="svc-name" required>
          <TextInput id="svc-name" value={name} onChange={(e) => setName(e.target.value)} required />
        </Field>
        <Field label="Precio (MXN)" htmlFor="svc-price" required>
          <TextInput id="svc-price" type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
        </Field>
        {error && <Alert>{error}</Alert>}
        {notice && <p className="text-sm text-primary">{notice}</p>}
        <div className="flex gap-2">
          <Button type="submit" disabled={pending}>
            {editing ? "Guardar cambios" : "Crear servicio"}
          </Button>
          {editing && (
            <Button type="button" variant="ghost" onClick={reset}>
              Cancelar
            </Button>
          )}
        </div>
      </form>

      <div>
        <h2 className="font-semibold text-ink">Servicios activos</h2>
        <ul className="mt-2 divide-y divide-slate-200 rounded-lg border border-slate-200">
          {active.map((s) => (
            <li key={s.id} className="flex items-center justify-between px-4 py-2">
              <span className="text-sm">
                {s.name} <span className="text-slate-500">— {mxn.format(s.price)}</span>
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditing({ id: s.id, name: s.name, price: String(s.price) });
                    setName(s.name);
                    setPrice(String(s.price));
                    setError(null);
                    setNotice(null);
                  }}
                  className="text-xs font-medium text-primary underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => remove(s.id)}
                  className="text-xs font-medium text-red-700 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  Desactivar
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {inactive.length > 0 && (
        <p className="text-xs text-slate-500">
          Inactivos: {inactive.map((s) => s.name).join(", ")}
        </p>
      )}
    </div>
  );
}

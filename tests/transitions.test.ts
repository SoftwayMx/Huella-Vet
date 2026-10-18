import { describe, expect, it } from "vitest";
import {
  canBook,
  canCancelOrReprogram,
  canTransition,
  isReschedulable,
} from "../lib/transitions";
import { AppointmentStatus } from "../lib/constants";

const at = (iso: string) => new Date(iso);

describe("canTransition", () => {
  it("permite las transiciones válidas", () => {
    expect(canTransition("pendiente", "confirmada")).toBe(true);
    expect(canTransition("pendiente", "cancelada")).toBe(true);
    expect(canTransition("confirmada", "completada")).toBe(true);
    expect(canTransition("confirmada", "no_asistio")).toBe(true);
    expect(canTransition("confirmada", "cancelada")).toBe(true);
  });

  it("rechaza transiciones inválidas", () => {
    expect(canTransition("pendiente", "completada")).toBe(false);
    expect(canTransition("pendiente", "no_asistio")).toBe(false);
    expect(canTransition("confirmada", "pendiente")).toBe(false);
  });

  it("los estados terminales no tienen salidas", () => {
    const terminales: AppointmentStatus[] = [
      "completada",
      "cancelada",
      "no_asistio",
    ];
    for (const t of terminales) {
      expect(canTransition(t, "pendiente")).toBe(false);
      expect(canTransition(t, "confirmada")).toBe(false);
      expect(canTransition(t, "completada")).toBe(false);
    }
  });
});

describe("reglas de tiempo", () => {
  const now = at("2026-10-17T12:00:00.000Z");

  it("canBook exige al menos 2 horas de anticipación", () => {
    expect(canBook(at("2026-10-17T14:00:00.000Z"), now)).toBe(true);
    expect(canBook(at("2026-10-17T13:59:59.000Z"), now)).toBe(false);
  });

  it("canCancelOrReprogram exige al menos 4 horas de anticipación", () => {
    expect(canCancelOrReprogram(at("2026-10-17T16:00:00.000Z"), now)).toBe(true);
    expect(canCancelOrReprogram(at("2026-10-17T15:59:59.000Z"), now)).toBe(false);
  });

  it("isReschedulable solo desde estados activos", () => {
    expect(isReschedulable("pendiente")).toBe(true);
    expect(isReschedulable("confirmada")).toBe(true);
    expect(isReschedulable("completada")).toBe(false);
    expect(isReschedulable("cancelada")).toBe(false);
    expect(isReschedulable("no_asistio")).toBe(false);
  });
});

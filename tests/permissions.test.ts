import { describe, expect, it } from "vitest";
import { can } from "../lib/permissions";

describe("permisos por rol", () => {
  it("admin puede hacer todo", () => {
    expect(can("admin", "services:write")).toBe(true);
    expect(can("admin", "veterinarians:write")).toBe(true);
    expect(can("admin", "blocks:write")).toBe(true);
    expect(can("admin", "appointments:write")).toBe(true);
    expect(can("admin", "metrics:read")).toBe(true);
  });

  it("recepción gestiona citas y consulta el directorio", () => {
    expect(can("recepcion", "appointments:read")).toBe(true);
    expect(can("recepcion", "appointments:write")).toBe(true);
    expect(can("recepcion", "clients:read")).toBe(true);
    expect(can("recepcion", "clients:write")).toBe(true);
    expect(can("recepcion", "services:read")).toBe(true);
    expect(can("recepcion", "veterinarians:read")).toBe(true);
    expect(can("recepcion", "blocks:read")).toBe(true);
    expect(can("recepcion", "metrics:read")).toBe(true);
  });

  it("recepción NO administra servicios, veterinarios ni bloqueos", () => {
    expect(can("recepcion", "services:write")).toBe(false);
    expect(can("recepcion", "veterinarians:write")).toBe(false);
    expect(can("recepcion", "blocks:write")).toBe(false);
  });
});

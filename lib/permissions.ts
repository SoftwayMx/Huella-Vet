import { Role } from "./constants";

export type Permission =
  | "appointments:read"
  | "appointments:write"
  | "clients:read"
  | "clients:write"
  | "services:read"
  | "services:write"
  | "veterinarians:read"
  | "veterinarians:write"
  | "blocks:read"
  | "blocks:write"
  | "metrics:read";

// Recepción: gestiona citas y consulta el directorio; no administra catálogos.
const RECEPTION: readonly Permission[] = [
  "appointments:read",
  "appointments:write",
  "clients:read",
  "clients:write",
  "services:read",
  "veterinarians:read",
  "blocks:read",
  "metrics:read",
];

export function can(role: Role, permission: Permission): boolean {
  if (role === "admin") return true;
  return RECEPTION.includes(permission);
}

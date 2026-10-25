import type { SupabaseClient } from "@supabase/supabase-js";

// Límite de peticiones por ventana deslizante fija, con contador atómico en Postgres
// (función rate_limit_hit). Devuelve true si se excedió el límite (debe rechazarse).
export async function isRateLimited(
  supabase: SupabaseClient,
  key: string,
  endpoint: string,
  windowMs: number,
  max: number,
): Promise<boolean> {
  const windowStart = Math.floor(Date.now() / windowMs) * windowMs;
  const { data, error } = await supabase.rpc("rate_limit_hit", {
    p_key: key,
    p_endpoint: endpoint,
    p_window_start: new Date(windowStart).toISOString(),
    p_max: max,
  });

  if (error) return true; // ante fallo del mecanismo, fallar cerrado
  return data === false;
}

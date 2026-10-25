import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}`);
  }
  return value;
}

// Cliente de servidor ligado a las cookies del usuario autenticado (panel).
// El JWT del usuario fluye hacia Supabase, por lo que la RLS se aplica de verdad.
export async function createServerClient() {
  const cookieStore = await cookies();
  return createSupabaseServerClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Se ignora al no poder modificar cookies desde un Server Component.
          }
        },
      },
    },
  );
}

// Cliente con clave de servicio: SOLO en el servidor (endpoints públicos).
// By-pasa la RLS a propósito; cada operación se valida explícitamente.
export function createServiceClient() {
  return createSupabaseClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

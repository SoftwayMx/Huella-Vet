import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { isRateLimited } from "@/lib/rate-limit";
import { clientIp, jsonError } from "@/lib/http";

export async function GET(req: Request) {
  const supabase = createServiceClient();
  if (await isRateLimited(supabase, clientIp(req), "veterinarians", 60_000, 60)) {
    return jsonError("Demasiadas peticiones. Intenta más tarde.", 429);
  }

  const { data, error } = await supabase
    .from("veterinarians")
    .select("id, name")
    .eq("is_active", true)
    .order("name");

  if (error) return jsonError("No se pudieron cargar los veterinarios.", 500);
  return NextResponse.json({ veterinarians: data });
}

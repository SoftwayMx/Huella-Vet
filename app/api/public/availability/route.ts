import { NextResponse } from "next/server";
import { z } from "zod";
import { addMinutes } from "date-fns";
import { createServiceClient } from "@/lib/supabase/server";
import { isRateLimited } from "@/lib/rate-limit";
import { clientIp, jsonError } from "@/lib/http";
import { availableSlotsForVet } from "@/lib/booking";
import { SLOT_MINUTES, TIMEZONE } from "@/lib/constants";

const querySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
  veterinarianId: z.string().uuid().optional(),
});

export async function GET(req: Request) {
  const supabase = createServiceClient();
  if (await isRateLimited(supabase, clientIp(req), "availability", 60_000, 60)) {
    return jsonError("Demasiadas peticiones. Intenta más tarde.", 429);
  }

  const url = new URL(req.url);
  const parsed = querySchema.safeParse({
    date: url.searchParams.get("date"),
    veterinarianId: url.searchParams.get("veterinarianId"),
  });
  if (!parsed.success) return jsonError("Parámetros inválidos.", 400);

  const { date, veterinarianId } = parsed.data;
  const now = new Date();

  const { data: vets, error } = await supabase
    .from("veterinarians")
    .select("id")
    .eq("is_active", true);
  if (error) return jsonError("No se pudo consultar la disponibilidad.", 500);

  const targets = veterinarianId
    ? (vets ?? []).filter((v) => v.id === veterinarianId)
    : (vets ?? []);

  const slotSet = new Map<string, Date>(); // dedupe para la unión entre veterinarios
  for (const vet of targets) {
    const slots = await availableSlotsForVet(supabase, vet.id, date, now);
    for (const s of slots) slotSet.set(s.toISOString(), s);
  }

  const slots = [...slotSet.values()]
    .sort((a, b) => a.getTime() - b.getTime())
    .map((s) => ({
      startAt: s.toISOString(),
      endAt: addMinutes(s, SLOT_MINUTES).toISOString(),
    }));

  return NextResponse.json({ date, timezone: TIMEZONE, slots });
}

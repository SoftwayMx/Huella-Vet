import Link from "next/link";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { requireStaff } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase/server";
import { listAppointmentsByRange } from "@/lib/panel-data";
import { dayOfWeekFromLocalDate } from "@/lib/booking";
import { TIMEZONE } from "@/lib/constants";
import { AppointmentActions } from "@/components/appointment-actions";
import { RescheduleAppointment } from "@/components/reschedule-appointment";
import { StatusBadge } from "@/components/status-badge";

function addDaysStr(dateStr: string, n: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

const DOW_LABEL = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  await requireStaff();
  const supabase = await createServerClient();

  const { date: paramDate } = await searchParams;
  const today = formatInTimeZone(new Date(), TIMEZONE, "yyyy-MM-dd");
  const date = paramDate ?? today;

  const start = fromZonedTime(`${date} 00:00:00`, TIMEZONE);
  const end = fromZonedTime(`${date} 23:59:59`, TIMEZONE);
  const appts = await listAppointmentsByRange(supabase, start.toISOString(), end.toISOString());

  // Semana (lunes a domingo) que contiene la fecha seleccionada.
  const dow = dayOfWeekFromLocalDate(date);
  const monday = addDaysStr(date, -((dow + 6) % 7));
  const week = Array.from({ length: 7 }, (_, i) => addDaysStr(monday, i));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-ink">
          Agenda — {formatInTimeZone(start, TIMEZONE, "EEEE dd/MM/yyyy")}
        </h1>
        <div className="flex gap-2">
          <Link href={`/panel/agenda?date=${addDaysStr(date, -1)}`} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            ←
          </Link>
          <Link href={`/panel/agenda?date=${addDaysStr(date, 1)}`} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            →
          </Link>
        </div>
      </div>

      <nav aria-label="Días de la semana">
        <ul className="grid grid-cols-7 gap-1">
          {week.map((d) => {
            const active = d === date;
            return (
              <li key={d}>
                <Link
                  href={`/panel/agenda?date=${d}`}
                  aria-current={active ? "page" : undefined}
                  className={`flex flex-col items-center rounded-lg border px-1 py-2 text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    active ? "border-primary bg-primary text-white" : "border-slate-200 hover:bg-surface"
                  }`}
                >
                  <span>{DOW_LABEL[dayOfWeekFromLocalDate(d)]}</span>
                  <span className="font-semibold">{d.slice(8)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {appts.length === 0 ? (
        <p className="text-sm text-slate-600">No hay citas para este día.</p>
      ) : (
        <ul className="space-y-3">
          {appts.map((a) => (
            <li key={a.id} className="rounded-lg border border-slate-200 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-primary">
                  {formatInTimeZone(a.start_at, TIMEZONE, "HH:mm")}
                </span>
                <StatusBadge status={a.status} />
              </div>
              <p className="mt-1 text-sm text-ink">
                <span className="font-medium">{a.pet?.name}</span> ({a.pet?.species}) · {a.client?.name}
              </p>
              <p className="text-sm text-slate-600">
                {a.service?.name} · {a.veterinarian?.name}
              </p>
              {a.reason && <p className="mt-1 text-xs text-slate-500">Motivo: {a.reason}</p>}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <AppointmentActions id={a.id} status={a.status} />
                <RescheduleAppointment id={a.id} veterinarianId={a.veterinarian_id} status={a.status} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

import { STATUS_LABELS } from "@/lib/constants";

const COLORS: Record<string, string> = {
  pendiente: "bg-amber-100 text-amber-900",
  confirmada: "bg-teal-100 text-teal-900",
  completada: "bg-green-100 text-green-900",
  cancelada: "bg-red-100 text-red-800",
  no_asistio: "bg-slate-200 text-slate-700",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
        COLORS[status] ?? "bg-slate-100 text-slate-700"
      }`}
    >
      {STATUS_LABELS[status as keyof typeof STATUS_LABELS] ?? status}
    </span>
  );
}

import { StatusPill } from "@/components/status-pill";

const toneLabels = {
  neutral: "Structured",
  accent: "Live",
  success: "Connected",
  warning: "Attention",
  danger: "Critical",
} as const;

export function MetricCard({
  label,
  value,
  description,
  tone = "neutral",
  detail,
}: {
  label: string;
  value: string;
  description: string;
  tone?: "neutral" | "accent" | "success" | "warning" | "danger";
  detail?: string;
}) {
  return (
    <div className="surface-muted grid-highlight relative overflow-hidden p-5">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/35 to-transparent" />
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          {label}
        </p>
        <StatusPill label={toneLabels[tone]} tone={tone} />
      </div>
      <div className="mt-5 space-y-3">
        <p className={value === "—" ? "metric-empty" : "metric-value"}>{value}</p>
        <p className="max-w-sm text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {detail ? (
        <p className="mt-5 border-t border-white/7 pt-4 text-xs leading-5 tracking-[0.06em] text-muted-foreground/85">
          {detail}
        </p>
      ) : null}
    </div>
  );
}

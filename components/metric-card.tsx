import { StatusPill } from "@/components/status-pill";

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
    <div className="surface-muted grid-highlight space-y-4 p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          {label}
        </p>
        <StatusPill label={tone === "neutral" ? "Structured" : "Attention"} tone={tone} />
      </div>
      <div className="space-y-2">
        <p className={value === "—" ? "metric-empty" : "metric-value"}>{value}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {detail ? <p className="text-xs leading-5 text-muted-foreground/85">{detail}</p> : null}
    </div>
  );
}

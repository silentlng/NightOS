import { Badge } from "@/components/ui/badge";

export function StatusPill({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "accent" | "success" | "warning" | "danger";
}) {
  return <Badge variant={tone}>{label}</Badge>;
}

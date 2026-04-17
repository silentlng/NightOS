import Link from "next/link";
import { Button } from "@/components/ui/button";
import { clampWeekOffset } from "@/lib/workspace-navigation";

function buildHref(
  pathname: string,
  weekOffset: number,
  params: Record<string, string | undefined> = {},
) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (typeof value === "string" && value.trim()) {
      searchParams.set(key, value);
    }
  });

  if (weekOffset !== 0) {
    searchParams.set("week", String(weekOffset));
  }

  const query = searchParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function WeekNavigator({
  pathname,
  weekOffset,
  weekLabel,
  params,
}: {
  pathname: string;
  weekOffset: number;
  weekLabel: string;
  params?: Record<string, string | undefined>;
}) {
  const previousWeekOffset = clampWeekOffset(weekOffset - 1);
  const nextWeekOffset = clampWeekOffset(weekOffset + 1);

  return (
    <div className="surface-muted flex flex-wrap items-center justify-between gap-3 p-4">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Live week window
        </p>
        <p className="text-sm text-foreground">{weekLabel}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button asChild size="sm" variant="outline">
          <Link href={buildHref(pathname, previousWeekOffset, params)}>Previous week</Link>
        </Button>
        <Button asChild size="sm" variant="ghost">
          <Link href={buildHref(pathname, 0, params)}>Current week</Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href={buildHref(pathname, nextWeekOffset, params)}>Next week</Link>
        </Button>
      </div>
    </div>
  );
}

import { EmptyState } from "@/components/empty-state";
import { MetricCard } from "@/components/metric-card";
import { PageIntro } from "@/components/page-intro";
import { SectionCard } from "@/components/section-card";
import { WeekNavigator } from "@/components/week-navigator";
import { formatCurrency } from "@/lib/utils";
import { getWorkspaceInsightsForWeek } from "@/lib/workspace-data";
import type { AppAccess } from "@/types/app";

export async function AnalyticsPage({
  access,
  basePath,
  weekOffset,
}: {
  access: AppAccess;
  basePath: string;
  weekOffset: number;
}) {
  const data = await getWorkspaceInsightsForWeek(access, weekOffset);

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Analytics"
        title="Decision-oriented analytics that use real synced numbers when available and stay empty when they do not."
        description="NightOS keeps analytics lighter and operational: estimated revenue, booking volume, active source labels, and upcoming fill structure."
      />

      <WeekNavigator
        pathname={`${basePath}/analytics`}
        weekLabel={data.snapshot.weekLabel}
        weekOffset={data.weekOffset}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Weekend Revenue"
          value={formatCurrency(data.metrics.weekendRevenue)}
          description="Sum of live spend values exposed by the reservation source in the selected Thursday-to-Saturday window."
        />
        <MetricCard
          label="Weekend Bookings"
          value={String(data.metrics.weekendReservations || "—")}
          description="Count of live occupied slots returned by the reservation source."
        />
        <MetricCard
          label="Active Source Labels"
          value={String(data.metrics.activePromoters || "—")}
          description="Grouped as the operational source itself groups activity."
        />
        <MetricCard
          label="Client Analytics"
          value="—"
          description="Client cohorts, loyalty, and relaunch metrics activate only once client identities are truly synchronized."
        />
      </div>

      <SectionCard
        eyebrow="Decision Support"
        title="What NightOS can already measure"
        description="These structures are ready now, even if richer historical charts are intentionally absent."
      >
        {data.metrics.weekendReservations > 0 ? (
          <div className="grid gap-4 md:grid-cols-3">
            {data.snapshot.nights.map((night) => (
              <div className="surface-muted space-y-3 p-4" key={night.dateId}>
                <p className="text-sm font-medium">
                  {night.weekdayLabel} {night.dateLabel}
                </p>
                <p className="text-sm text-muted-foreground">
                  {night.slots.length} live occupied slots
                </p>
                <p className="font-display text-3xl">
                  {formatCurrency(night.estimatedRevenue)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No live analytics yet for the selected week"
            description="The source responded without any occupied slots for the selected Thursday-to-Saturday window, so NightOS keeps the analytics board intentionally sparse. Use the week controls above to inspect another source window."
          />
        )}
      </SectionCard>

      <SectionCard
        eyebrow="Table Utilization"
        title="Inventory pressure by table"
        description="Shows which tables are used most often across the current source week window."
      >
        {data.tableOccupancy.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {data.tableOccupancy
              .slice()
              .sort(
                (a, b) =>
                  b.occupiedNightCount - a.occupiedNightCount ||
                  a.tableId.localeCompare(b.tableId, undefined, {
                    numeric: true,
                  }),
              )
              .slice(0, 6)
              .map((table) => (
                <div className="surface-muted p-4" key={table.tableId}>
                  <p className="text-sm font-medium text-foreground">Table {table.tableId}</p>
                  <p className="mt-2 font-display text-3xl">{table.occupiedNightCount}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {table.occupiedNightLabels.length > 0
                      ? table.occupiedNightLabels.join(" • ")
                      : "Open across the current source window"}
                  </p>
                </div>
              ))}
          </div>
        ) : (
          <EmptyState
            title="No table analytics yet"
            description="Table-level analytics appear after the reservation source layout is detected."
          />
        )}
      </SectionCard>
    </div>
  );
}

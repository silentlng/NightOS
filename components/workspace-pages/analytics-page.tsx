import { EmptyState } from "@/components/empty-state";
import { MetricCard } from "@/components/metric-card";
import { PageIntro } from "@/components/page-intro";
import { SectionCard } from "@/components/section-card";
import { formatCurrency } from "@/lib/utils";
import { getWorkspaceInsights } from "@/lib/workspace-data";
import type { AppAccess } from "@/types/app";

export async function AnalyticsPage({ access }: { access: AppAccess }) {
  const data = await getWorkspaceInsights(access);

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Analytics"
        title="Decision-oriented analytics that use real synced numbers when available and stay empty when they do not."
        description="NightOS keeps analytics lighter and operational: estimated revenue, booking volume, active source labels, and upcoming fill structure."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Weekend Revenue"
          value={formatCurrency(data.metrics.weekendRevenue)}
          description="Sum of live spend values exposed by the reservation source in the current Thursday-to-Saturday window."
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
            title="No live analytics yet for the current week"
            description="The source responded without any occupied slots for the current Thursday-to-Saturday window, so NightOS keeps the analytics board intentionally sparse."
          />
        )}
      </SectionCard>
    </div>
  );
}

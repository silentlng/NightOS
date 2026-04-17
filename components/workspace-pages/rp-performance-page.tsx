import { EmptyState } from "@/components/empty-state";
import { PageIntro } from "@/components/page-intro";
import { SectionCard } from "@/components/section-card";
import { StatusPill } from "@/components/status-pill";
import { WeekNavigator } from "@/components/week-navigator";
import { formatCurrency } from "@/lib/utils";
import { getWorkspaceInsightsForWeek } from "@/lib/workspace-data";
import type { AppAccess } from "@/types/app";

export async function RpPerformancePage({
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
        eyebrow="RP Performance"
        title="Promoter value, inactivity, and follow-up structure built only from real reservation-source activity."
        description="This module intentionally refuses to fake rankings. If the source returns no activity, NightOS keeps the board empty and shows exactly what will populate once live data appears."
      />

      <WeekNavigator
        pathname={`${basePath}/rp-performance`}
        weekLabel={data.snapshot.weekLabel}
        weekOffset={data.weekOffset}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="surface p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Revenue creators
          </p>
          <p className="mt-3 font-display text-4xl">
            {data.promoterStatsInScope.length || "—"}
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Distinct source labels with reservation activity in the current live window.
          </p>
        </div>
        <div className="surface p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Inactive RPs
          </p>
          <p className="mt-3 font-display text-4xl">—</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            NightOS will identify inactivity once historical synced periods exist in Supabase.
          </p>
        </div>
        <div className="surface p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Follow-up needed
          </p>
          <p className="mt-3 font-display text-4xl">
            {data.labelEnrichmentQueue.length || "—"}
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Live labels already exist, but identity enrichment is still needed before real CRM follow-up can start.
          </p>
        </div>
      </div>

      <SectionCard
        eyebrow="Performance Board"
        title="Current live board"
        description="Ranked from reservation-source labels and spend fields only."
      >
        {data.promoterStatsInScope.length > 0 ? (
          <div className="space-y-3">
            {data.promoterStatsInScope.map((stat, index) => (
              <div
                className="surface-muted flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between"
                key={stat.sourceLabel}
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">
                      {index + 1}. {stat.sourceLabel}
                    </p>
                    <StatusPill label="Live source" tone="success" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {stat.reservations} reservation labels in the current window
                  </p>
                </div>
                <div className="space-y-2 text-sm md:text-right">
                  <p className="font-medium">{formatCurrency(stat.estimatedRevenue)}</p>
                  <p className="text-muted-foreground">
                    Last active {stat.lastSeenDateId}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No RP performance data yet"
            description={
              access.role === "rp"
                ? "This RP account does not currently map to any live reservation-source label, so NightOS keeps the RP performance view empty."
                : "The source is connected, but it returned no reservation labels for the selected Thursday-to-Saturday window. Use the week controls above to inspect another live window."
            }
          />
        )}
      </SectionCard>

      <SectionCard
        eyebrow="Follow-up Structure"
        title="What NightOS can already highlight"
        description="These are operationally useful even before full CRM identity sync exists."
      >
        {data.promoterStatsInScope.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            <div className="surface-muted p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Labels to enrich
              </p>
              <p className="mt-3 font-display text-4xl">
                {data.labelEnrichmentQueue.length}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Active labels exist, but they still need verified client identity to become proper CRM records.
              </p>
            </div>
            <div className="surface-muted p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Unlabeled bookings
              </p>
              <p className="mt-3 font-display text-4xl">
                {data.unlabeledReservations || "—"}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Bookings without a label are impossible to attribute, so they should be fixed at source or during sync enrichment.
              </p>
            </div>
          </div>
        ) : (
          <EmptyState
            title="No follow-up signals yet"
            description="NightOS keeps this honest until the selected week exposes live RP activity from the source. Use the week controls above to inspect another live window."
          />
        )}
      </SectionCard>
    </div>
  );
}

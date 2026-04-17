import { EmptyState } from "@/components/empty-state";
import { PageIntro } from "@/components/page-intro";
import { SectionCard } from "@/components/section-card";
import { StatusPill } from "@/components/status-pill";
import { formatCurrency } from "@/lib/utils";
import { getWorkspaceInsights } from "@/lib/workspace-data";
import type { AppAccess } from "@/types/app";

export async function RpPerformancePage({ access }: { access: AppAccess }) {
  const data = await getWorkspaceInsights(access);

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="RP Performance"
        title="Promoter value, inactivity, and follow-up structure built only from real reservation-source activity."
        description="This module intentionally refuses to fake rankings. If the source returns no activity, NightOS keeps the board empty and shows exactly what will populate once live data appears."
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
          <p className="mt-3 font-display text-4xl">—</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Follow-up recommendations stay disabled until promoter identity and visit history are truly synchronized.
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
                : "The source is connected, but it returned no reservation labels for the current Thursday-to-Saturday window."
            }
          />
        )}
      </SectionCard>
    </div>
  );
}

import { EmptyState } from "@/components/empty-state";
import { MetricCard } from "@/components/metric-card";
import { PageIntro } from "@/components/page-intro";
import { SectionCard } from "@/components/section-card";
import { StatusPill } from "@/components/status-pill";
import { TableOccupancyBoard } from "@/components/table-occupancy-board";
import { WeekNavigator } from "@/components/week-navigator";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { getWorkspaceInsightsForWeek } from "@/lib/workspace-data";
import type { AppAccess } from "@/types/app";

function readinessTone(readiness: "ready" | "needs_attention" | "critical") {
  if (readiness === "ready") return "success";
  if (readiness === "critical") return "danger";
  return "warning";
}

function readinessLabel(readiness: "ready" | "needs_attention" | "critical") {
  if (readiness === "ready") return "Ready";
  if (readiness === "critical") return "Critical";
  return "Needs attention";
}

export async function DashboardPage({
  access,
  basePath,
  weekOffset,
}: {
  access: AppAccess;
  basePath: string;
  weekOffset: number;
}) {
  const data = await getWorkspaceInsightsForWeek(access, weekOffset);
  const tonightFillRate =
    typeof data.metrics.fillRate === "number"
      ? `${Math.round(data.metrics.fillRate * 100)}%`
      : "—";
  const topPromoter = data.promoterStatsInScope[0];
  const directionBrief = [
    !data.snapshot.configured
      ? {
          title: "Connect the reservation writer",
          description:
            "NightOS is structurally ready, but the source URL and access PIN still need to be configured before the operating picture can populate.",
        }
      : null,
    data.snapshot.connected && data.syncOverview.state === "attention"
      ? {
          title: "Keep production posture in staging",
          description:
            "The source is technically reachable, but production sync should stay blocked until the writer contract and approval are explicitly validated.",
        }
      : null,
    data.tonight && data.tonight.slots.length > 0
      ? {
          title: "Protect tonight's capacity",
          description: `${data.tonight.standardReservations} standard tables and ${data.tonight.supplementalReservations} supplemental slots are currently visible for ${data.tonight.weekdayLabel.toLowerCase()}.`,
        }
      : {
          title: "Review another operating window",
          description:
            "The selected week does not currently expose occupied tables. Use the week navigator to inspect another source window instead of accepting an empty view as business truth.",
        },
    topPromoter
      ? {
          title: `Top source driver: ${topPromoter.sourceLabel}`,
          description: `${topPromoter.reservations} reservations and ${formatCurrency(topPromoter.estimatedRevenue)} currently come from this visible label in the selected week.`,
        }
      : {
          title: "Promoter attribution still fragile",
          description:
            "No source-label activity is currently visible in this window. RP performance remains dependent on writer-side naming quality.",
        },
    {
      title: "Keep CRM intentionally strict",
      description:
        "NightOS will not create fake VIP records. Relationship history should open only after the writer sends real identity fields.",
    },
  ].filter(Boolean) as Array<{ title: string; description: string }>;

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Dashboard"
        title="Business status for tonight, sync health, and the reservation operating picture."
        description="This dashboard stays honest: it reads reservation occupancy from the operational source when available, and keeps premium empty states where richer CRM or warehouse data does not exist yet."
        aside={
          <div className="surface-muted space-y-4 p-5">
            <StatusPill
              label={readinessLabel(data.businessReadiness)}
              tone={readinessTone(data.businessReadiness)}
            />
            <div className="space-y-2">
              <p className="text-sm font-medium">{data.syncOverview.label}</p>
              <p className="text-sm leading-6 text-muted-foreground">
                {data.syncOverview.summary}
              </p>
            </div>
          </div>
        }
      />

      <WeekNavigator
        pathname={`${basePath}/dashboard`}
        weekLabel={data.snapshot.weekLabel}
        weekOffset={data.weekOffset}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Tonight Bookings"
          value={String(data.metrics.tonightTableBookings || "—")}
          description="Booked standard tables from the reservation source for the selected upcoming night."
          detail={
            data.tonight
              ? `${data.tonight.weekdayLabel} ${data.tonight.dateLabel}`
              : "Waiting for a live night selection."
          }
          tone={data.syncOverview.state === "error" ? "danger" : "accent"}
        />
        <MetricCard
          label="Estimated Revenue"
          value={formatCurrency(data.metrics.tonightRevenue)}
          description="Derived only from spend values exposed by the reservation source."
          detail="No invented totals. Missing spend stays blank."
        />
        <MetricCard
          label="Fill Rate"
          value={tonightFillRate}
          description="Computed from occupied standard tables versus the detected plan inventory."
          detail={
            data.metrics.totalTables
              ? `${data.metrics.tonightTableBookings}/${data.metrics.totalTables} tables occupied`
              : "Table inventory appears after the source layout is read."
          }
        />
        <MetricCard
          label="Active Promoters"
          value={String(data.metrics.activePromoters || "—")}
          description="Source-label activity grouped exactly as the operational site exposes it."
          detail="NightOS keeps CRM separate until client identities are truly available."
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard
          eyebrow="Direction Brief"
          title="What leadership should focus on now"
          description="A premium operating system should translate structure into action, even before the warehouse is fully live."
        >
          <div className="space-y-3">
            {directionBrief.map((item) => (
              <div className="surface-muted space-y-2 p-4" key={item.title}>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-sm leading-6 text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Data Boundaries"
          title="What NightOS refuses to invent"
          description="These limits protect the product from looking impressive for the wrong reasons."
        >
          <div className="space-y-3">
            {data.snapshot.limitations.map((item) => (
              <div className="surface-muted p-4 text-sm leading-6 text-muted-foreground" key={item}>
                {item}
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <SectionCard
          eyebrow="Tonight Status"
          title={
            data.tonight
              ? `${data.tonight.weekdayLabel} ${data.tonight.dateLabel}`
              : "Tonight structure pending"
          }
          description="Operational context for the next relevant club night."
        >
          {data.tonight && data.tonight.slots.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="surface-muted p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Standard tables
                </p>
                <p className="mt-3 font-display text-4xl">
                  {data.tonight.standardReservations}
                </p>
              </div>
              <div className="surface-muted p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Supplemental slots
                </p>
                <p className="mt-3 font-display text-4xl">
                  {data.tonight.supplementalReservations}
                </p>
              </div>
              <div className="surface-muted p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Revenue structure
                </p>
                <p className="mt-3 font-display text-4xl">
                  {formatCurrency(data.tonight.estimatedRevenue)}
                </p>
              </div>
            </div>
          ) : (
            <EmptyState
              title="No occupied tables returned for the upcoming night"
              description="The reservation source is available, but it did not return any occupied standard or supplemental slots for the selected Thursday-to-Saturday window. Use the week controls above to inspect another source window."
            />
          )}
        </SectionCard>

        <SectionCard
          eyebrow="Promoter Signals"
          title="Who is currently driving the week"
          description="This board stays tied to the exact labels exposed by the reservation source."
        >
          {data.promoterStatsInScope.length > 0 ? (
            <div className="space-y-3">
              {data.promoterStatsInScope.slice(0, 5).map((stat) => (
                <div
                  className="surface-muted flex items-center justify-between gap-4 p-4"
                  key={stat.sourceLabel}
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      {stat.sourceLabel}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {stat.reservations} source bookings
                    </p>
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    {formatCurrency(stat.estimatedRevenue)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No live promoter signals yet"
              description="The current week is structurally loaded, but no source labels were returned for the active window. Use the week controls above to inspect another source window."
            />
          )}
        </SectionCard>
      </div>

      <SectionCard
        eyebrow="Table Plan"
        title="Reservation occupancy board"
        description="A table-by-table view of the selected upcoming night, using the reservation source as the operational writer."
      >
        {data.tonight ? (
          <TableOccupancyBoard
            inventory={data.snapshot.tableInventory}
            selectedNight={data.tonight}
          />
        ) : (
          <EmptyState
            title="No selected live night yet"
            description="NightOS will show a table plan board as soon as a live Thursday-to-Saturday window is available."
          />
        )}
      </SectionCard>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <SectionCard
          eyebrow="Operational Alerts"
          title="What needs attention"
          description="Warnings stay grounded in real source connectivity and structural readiness."
        >
          <div className="space-y-3">
            {data.operationalAlerts.map((alert) => (
              <div className="surface-muted space-y-2 p-4" key={alert.title}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">{alert.title}</p>
                  <StatusPill
                    label={
                      alert.tone === "danger"
                        ? "Critical"
                        : alert.tone === "warning"
                          ? "Attention"
                          : alert.tone === "success"
                            ? "Connected"
                            : "Structured"
                    }
                    tone={
                      alert.tone === "danger"
                        ? "danger"
                        : alert.tone === "warning"
                          ? "warning"
                          : alert.tone === "success"
                            ? "success"
                            : "neutral"
                    }
                  />
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  {alert.description}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Source Visibility"
          title="Reservation source"
          description="The operational reservation site remains the writer and source of truth."
          footer={
            <p className="text-xs text-muted-foreground">
              Last technical read: {formatDateTime(data.syncOverview.lastSyncedAt)}
            </p>
          }
        >
          <div className="space-y-4">
            <div className="surface-muted p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Current state
              </p>
              <p className="mt-2 text-sm leading-6 text-foreground">
                {data.syncOverview.detail}
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="surface-muted p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Source name
                </p>
                <p className="mt-2 text-sm">{data.snapshot.sourceName}</p>
              </div>
              <div className="surface-muted p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Plan inventory
                </p>
                <p className="mt-2 text-sm">
                  {data.snapshot.totalTables > 0
                    ? `${data.snapshot.totalTables} detected tables`
                    : "Waiting for source layout read"}
                </p>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

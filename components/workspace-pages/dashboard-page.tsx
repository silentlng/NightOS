import { PageIntro } from "@/components/page-intro";
import { EmptyState } from "@/components/empty-state";
import { MetricCard } from "@/components/metric-card";
import { SectionCard } from "@/components/section-card";
import { StatusPill } from "@/components/status-pill";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { getWorkspaceInsights } from "@/lib/workspace-data";
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

export async function DashboardPage({ access }: { access: AppAccess }) {
  const data = await getWorkspaceInsights(access);
  const tonightFillRate =
    typeof data.metrics.fillRate === "number"
      ? `${Math.round(data.metrics.fillRate * 100)}%`
      : "—";

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Dashboard"
        title="Business status for tonight, sync health, and what NightOS can already read from the reservation source."
        description="This dashboard stays honest: it reads live reservation occupancy from the operational source when available, and keeps premium empty states where richer CRM or warehouse data does not exist yet."
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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Tonight Bookings"
          value={String(data.metrics.tonightTableBookings || "—")}
          description="Booked standard tables from the live reservation source for the selected upcoming night."
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

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
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
              description="The reservation source is connected, but it did not return any occupied standard or supplemental slots for the current Thursday-to-Saturday window."
            />
          )}
        </SectionCard>

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
                    label={alert.tone === "danger" ? "Critical" : alert.tone === "warning" ? "Attention" : alert.tone === "success" ? "Connected" : "Structured"}
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
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <SectionCard
          eyebrow="Source Visibility"
          title="Reservation source"
          description="The operational reservation site remains the writer and source of truth."
          footer={
            <p className="text-xs text-muted-foreground">
              Last live read: {formatDateTime(data.syncOverview.lastSyncedAt)}
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

        <SectionCard
          eyebrow="VIP Follow-up"
          title="CRM readiness"
          description="VIP follow-up becomes useful only after NightOS has true client-level identity data."
        >
          <EmptyState
            title="No synchronized client identities yet"
            description="The current reservation source gives NightOS occupancy labels and spend values, but not reliable client profiles. VIP CRM will auto-populate once a richer reservation payload or Supabase sync layer is active."
          />
        </SectionCard>
      </div>
    </div>
  );
}

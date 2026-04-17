import { EmptyState } from "@/components/empty-state";
import { PageIntro } from "@/components/page-intro";
import { SectionCard } from "@/components/section-card";
import { WeekNavigator } from "@/components/week-navigator";
import { formatCurrency } from "@/lib/utils";
import { getWorkspaceInsightsForWeek } from "@/lib/workspace-data";
import type { AppAccess } from "@/types/app";

export async function CrmPage({
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
        eyebrow="VIP CRM"
        title="Client history, preferences, and relaunch opportunities stay empty until NightOS receives true client identity data."
        description="The current source site exposes occupancy labels and spend fields, not a real CRM-grade client record. NightOS keeps CRM honest instead of inventing VIP profiles."
      />

      <WeekNavigator
        pathname={`${basePath}/crm`}
        weekLabel={data.snapshot.weekLabel}
        weekOffset={data.weekOffset}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="surface p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Synced clients
          </p>
          <p className="mt-3 font-display text-4xl">—</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Client records appear only after a richer reservation sync or manual CRM ingestion.
          </p>
        </div>
        <div className="surface p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Labels to enrich
          </p>
          <p className="mt-3 font-display text-4xl">
            {data.labelEnrichmentQueue.length || "—"}
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Real source labels that need identity enrichment before they can become CRM profiles.
          </p>
        </div>
        <div className="surface p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Unlabeled bookings
          </p>
          <p className="mt-3 font-display text-4xl">{data.unlabeledReservations || "—"}</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            These need better source hygiene before NightOS can associate them with an RP or future client record.
          </p>
        </div>
      </div>

      <SectionCard
        eyebrow="Identity Enrichment Queue"
        title="What the team can work from now"
        description="These are source labels with real booking activity. They are not treated as CRM clients yet."
      >
        {data.labelEnrichmentQueue.length > 0 ? (
          <div className="space-y-3">
            {data.labelEnrichmentQueue.map((item) => (
              <div
                className="surface-muted flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between"
                key={item.sourceLabel}
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">{item.sourceLabel}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.reservations} live bookings • first seen {item.firstSeenDateId} • last seen {item.lastSeenDateId}
                  </p>
                </div>
                <div className="space-y-1 text-sm md:text-right">
                  <p className="font-medium text-foreground">
                    {formatCurrency(item.estimatedRevenue)}
                  </p>
                  <p className="text-muted-foreground">Needs identity enrichment</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No enrichment queue for this week"
            description="When the source exposes live booking labels, NightOS will list them here as a real enrichment queue instead of fabricating client profiles. Use the week controls above to inspect another live window."
          />
        )}
      </SectionCard>

      <SectionCard
        eyebrow="Current State"
        title="Why CRM is intentionally incomplete"
        description="NightOS already knows how to structure CRM, but it will not fabricate clients from source labels."
      >
        <EmptyState
          title="No synchronized clients yet"
          description={`The live reservation source is currently ${data.snapshot.connected ? "connected" : "not connected"}, but it does not expose verified client records. Once Supabase sync receives client identities, this page will populate client status, preferences, RP relationship, relaunch opportunities, and VIP tier logic.`}
        />
      </SectionCard>
    </div>
  );
}

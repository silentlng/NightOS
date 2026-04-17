import { EmptyState } from "@/components/empty-state";
import { PageIntro } from "@/components/page-intro";
import { SectionCard } from "@/components/section-card";
import { getWorkspaceInsights } from "@/lib/workspace-data";
import type { AppAccess } from "@/types/app";

export async function CrmPage({ access }: { access: AppAccess }) {
  const data = await getWorkspaceInsights(access);

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="VIP CRM"
        title="Client history, preferences, and relaunch opportunities stay empty until NightOS receives true client identity data."
        description="The current source site exposes occupancy labels and spend fields, not a real CRM-grade client record. NightOS keeps CRM honest instead of inventing VIP profiles."
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
            VIP follow-up
          </p>
          <p className="mt-3 font-display text-4xl">—</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Follow-up logic will be driven by visits, spend, and preference history once available.
          </p>
        </div>
        <div className="surface p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Assigned RP links
          </p>
          <p className="mt-3 font-display text-4xl">—</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            RP-to-client relationship tracking remains pending until client identity sync is real.
          </p>
        </div>
      </div>

      <SectionCard
        eyebrow="Current State"
        title="Why CRM is intentionally empty"
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

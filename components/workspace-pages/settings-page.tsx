import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { SectionCard } from "@/components/section-card";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";
import { getWorkspaceInsights } from "@/lib/workspace-data";
import type { AppAccess } from "@/types/app";

export async function SettingsPage({ access }: { access: AppAccess }) {
  const data = await getWorkspaceInsights(access);
  const readiness = data.environmentReadiness;

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Settings"
        title="Roles, sync, integrations, deployment readiness, and future architecture."
        description="This page separates what is already implemented from what is connected later, while keeping the future creative bridge explicitly out of scope for now."
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard
          eyebrow="Roles & Access"
          title="Current access model"
          description="Protected routes are server-validated. Preview routes exist only for demo-safe walkthroughs."
        >
          <div className="grid gap-3">
            <div className="surface-muted grid gap-2 p-4 md:grid-cols-[140px_1fr]">
              <p className="text-sm font-medium">Admin</p>
              <p className="text-sm text-muted-foreground">
                Full access to operations, CRM, analytics, sync settings, and future bridge administration.
              </p>
            </div>
            <div className="surface-muted grid gap-2 p-4 md:grid-cols-[140px_1fr]">
              <p className="text-sm font-medium">Manager</p>
              <p className="text-sm text-muted-foreground">
                Business visibility, operational visibility, and sync-health oversight without unrestricted administration.
              </p>
            </div>
            <div className="surface-muted grid gap-2 p-4 md:grid-cols-[140px_1fr]">
              <p className="text-sm font-medium">RP</p>
              <p className="text-sm text-muted-foreground">
                Own reservations, own clients, and own performance only when an RP-to-source mapping exists.
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Reservation Sync"
          title="Operational source status"
          description="The reservation site remains the writer. NightOS reads it in live mode and is ready for warehouse persistence."
          footer={
            <p className="text-xs text-muted-foreground">
              Last live read: {formatDateTime(data.snapshot.fetchedAt)}
            </p>
          }
        >
          <div className="space-y-3">
            <div className="surface-muted flex items-center justify-between gap-3 p-4">
              <p className="text-sm font-medium">Current state</p>
              <StatusPill
                label={data.syncOverview.label}
                tone={
                  data.syncOverview.state === "active"
                    ? "success"
                    : data.syncOverview.state === "error"
                      ? "danger"
                      : data.syncOverview.state === "attention"
                        ? "warning"
                        : "neutral"
                }
              />
            </div>
            <div className="surface-muted p-4">
              <p className="text-sm leading-6 text-muted-foreground">
                {data.syncOverview.detail}
              </p>
            </div>
            <div className="surface-muted p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Production sync route
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                `POST /api/sync/reservation-source/pull` with `x-sync-secret`
              </p>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard
          eyebrow="Environment Setup"
          title="Current environment readiness"
          description="Secrets stay out of git and the service role key never reaches the client."
        >
          <div className="grid gap-3 md:grid-cols-2">
            {[
              { label: "Supabase URL", ready: readiness.supabaseUrl },
              { label: "Supabase anon key", ready: readiness.supabaseAnonKey },
              {
                label: "Supabase service role",
                ready: readiness.supabaseServiceRole,
              },
              { label: "Site URL", ready: readiness.siteUrl },
              {
                label: "Sync shared secret",
                ready: readiness.syncSharedSecret,
              },
            ].map(({ label, ready }) => (
              <div
                className="surface-muted flex items-center justify-between gap-3 p-4"
                key={label}
              >
                <p className="text-sm">{label}</p>
                <StatusPill
                  label={ready ? "Ready" : "Pending"}
                  tone={ready ? "success" : "warning"}
                />
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Security Architecture"
          title="Implemented guardrails"
          description="NightOS is designed for server-side correctness first."
        >
          <div className="grid gap-3">
            {[
              "Server-side auth validation for protected routes",
              "Zod validation on auth and sync entry points",
              "Service role key isolated to server-only helpers",
              "Supabase schema prepared with RLS + auth.uid() policies",
              "No fake backend security claims where implementation is pending",
            ].map((item) => (
              <div className="surface-muted p-4 text-sm text-muted-foreground" key={item}>
                {item}
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard
          eyebrow="Deployment Readiness"
          title="GitHub + Vercel"
          description="The repository is structured for Vercel deployment once environment variables are set."
        >
          <div className="space-y-3">
            <div className="surface-muted p-4 text-sm leading-6 text-muted-foreground">
              README, `.env.example`, Next.js configuration, Supabase migration SQL, and the sync route are all prepared for a production-oriented deploy flow.
            </div>
            <Button asChild variant="outline">
              <Link href="https://github.com/silentlng/NightOS" target="_blank">
                Open GitHub repository
              </Link>
            </Button>
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Future Creative Bridge"
          title="Prepared, not built"
          description="NightOS reserves a bridge for a future private creative SaaS without implementing that product now."
        >
          <div className="space-y-3">
            <div className="surface-muted p-4 text-sm leading-6 text-muted-foreground">
              The architecture and docs reserve space for future creative briefs, flyer/video requests, and campaign handoff metadata, but no creative generation surface is shipped in this version.
            </div>
            <div className="surface-muted p-4 text-sm leading-6 text-muted-foreground">
              That future bridge should consume curated operating signals from NightOS only after reservation sync, CRM, and audit trails are stable.
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

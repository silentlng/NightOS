import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { PageIntro } from "@/components/page-intro";
import { SectionCard } from "@/components/section-card";
import { SourceControlPanel } from "@/components/source-control-panel";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { WeekNavigator } from "@/components/week-navigator";
import { canAccessSection } from "@/lib/auth/permissions";
import { formatDateTime } from "@/lib/utils";
import { getWorkspaceInsightsForWeek } from "@/lib/workspace-data";
import type { AppAccess } from "@/types/app";

export async function SettingsPage({
  access,
  basePath,
  weekOffset,
}: {
  access: AppAccess;
  basePath: string;
  weekOffset: number;
}) {
  if (!canAccessSection(access.role, "settings")) {
    return (
      <div className="space-y-6">
        <PageIntro
          eyebrow="Settings"
          title="Management-only control surface"
          description="NightOS keeps operational settings, sync secrets, and deployment readiness scoped to management roles."
        />

        <EmptyState
          title="This area is restricted for RP accounts"
          description="RP users keep access to their own reservations, CRM scope, analytics, and performance data, but settings and sync controls remain limited to manager and admin roles."
        />
      </div>
    );
  }

  const data = await getWorkspaceInsightsForWeek(access, weekOffset);
  const readiness = data.environmentReadiness;

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Settings"
        title="Roles, sync, security, sessions, audit, and technical readiness."
        description="This control center separates what is implemented, what is staged, and what still needs a real production connection without exposing speculative product layers."
      />

      <WeekNavigator
        pathname={`${basePath}/settings`}
        weekLabel={data.snapshot.weekLabel}
        weekOffset={data.weekOffset}
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
                Full access to operations, CRM, analytics, security posture, and sync administration.
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
          description="The reservation site remains the writer. NightOS is structured to read it safely and to persist it once the production contract is fully approved."
          footer={
            <p className="text-xs text-muted-foreground">
              Last source read: {formatDateTime(data.snapshot.fetchedAt)}
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
                POST /api/sync/reservation-source/pull with x-sync-secret
              </p>
            </div>
            <SourceControlPanel weekOffset={data.weekOffset} />
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
              "Supabase middleware session refresh for protected app routes",
              "Zod validation on auth and sync entry points",
              "Service role key isolated to server-only helpers",
              "Supabase schema prepared with RLS + auth.uid() policies",
              "RP visibility can be matched from dedicated source-label aliases",
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
          eyebrow="Technical Readiness"
          title="Deployment, repository, and production handoff"
          description="The repository is structured for a production-oriented deploy flow once environment variables and the reservation contract are fully approved."
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
          eyebrow="Sessions & Audit"
          title="Internal control posture"
          description="A private platform also needs disciplined session handling, permission scoping, and traceability."
        >
          <div className="space-y-3">
            <div className="surface-muted p-4 text-sm leading-6 text-muted-foreground">
              Session timeout rules, device trust policy, sign-in audit logs, permission changes, and sync-run logs should all be treated as first-class operating controls.
            </div>
            <div className="surface-muted p-4 text-sm leading-6 text-muted-foreground">
              In this version, the access model and protected routes are already shaped like a private tool. The remaining work is to complete provider-level enforcement and deepen audit visibility.
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

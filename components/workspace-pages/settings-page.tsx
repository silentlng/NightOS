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

const roleCards = [
  {
    label: "Admin",
    description:
      "Full access to operations, CRM, analytics, security posture, and sync administration.",
  },
  {
    label: "Manager",
    description:
      "Business visibility, operational visibility, and sync-health oversight without unrestricted administration.",
  },
  {
    label: "RP",
    description:
      "Own reservations, own clients, and own performance only when an RP-to-source mapping exists.",
  },
];

const securityControls = [
  {
    title: "Server-side auth validation",
    status: "Implemented",
    tone: "success" as const,
    description:
      "Protected routes are checked on the server instead of relying on a client-only gate.",
  },
  {
    title: "Proxy session refresh",
    status: "Implemented",
    tone: "success" as const,
    description:
      "Supabase proxy refreshes trusted sessions before protected app requests resolve.",
  },
  {
    title: "Service-role isolation",
    status: "Implemented",
    tone: "success" as const,
    description:
      "The service role key stays in server-only helpers and never reaches the client bundle.",
  },
  {
    title: "Input validation",
    status: "Implemented",
    tone: "success" as const,
    description:
      "Auth and sync entry points are validated with Zod before business logic runs.",
  },
  {
    title: "RLS policy base",
    status: "Prepared",
    tone: "neutral" as const,
    description:
      "The Supabase schema includes auth.uid() and WITH CHECK protections, ready to be enforced in production.",
  },
  {
    title: "Production auth provider",
    status: "Pending",
    tone: "warning" as const,
    description:
      "Provider-level rollout, invitation flow, and full user provisioning still need to be connected.",
  },
];

const sessionPolicies = [
  {
    title: "Access posture",
    description:
      "NightOS behaves like a private internal platform. Preview routes are demo-safe only and never replace authenticated access.",
    tone: "success" as const,
  },
  {
    title: "Device trust policy",
    description:
      "Trusted-device and unusual-device checks are not yet enforced. The policy should be finalized before wider internal rollout.",
    tone: "warning" as const,
  },
  {
    title: "Session expiry",
    description:
      "Session timeout and re-auth rules are structurally expected, but still need explicit production policy and provider wiring.",
    tone: "warning" as const,
  },
  {
    title: "Permission boundaries",
    description:
      "RP access stays constrained to mapped labels and role-aware sections. Managers and admins keep control-center visibility.",
    tone: "success" as const,
  },
];

const auditControls = [
  {
    title: "Sign-in and role events",
    description:
      "Schema support exists for access events and permission changes, but provider-fed records still need to be persisted.",
    tone: "neutral" as const,
  },
  {
    title: "Source inspections and pull runs",
    description:
      "Manual checks and persistence actions already exist in the product. Their durable audit trail should be stored in audit_logs next.",
    tone: "warning" as const,
  },
  {
    title: "Reservation lineage",
    description:
      "NightOS is prepared for source_event_id, external_booking_id, and updated_from_source tracking as soon as the writer contract is approved.",
    tone: "neutral" as const,
  },
  {
    title: "Direction activity journal",
    description:
      "A durable journal for sign-ins, permission changes, sync failures, and critical alerts is the next step toward an exceptional operating layer.",
    tone: "warning" as const,
  },
];

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
  const hasSourceLabels = data.snapshot.reservations.some((reservation) =>
    Boolean(reservation.sourceLabel),
  );
  const hasSpendValues = data.snapshot.reservations.some(
    (reservation) => reservation.spendEstimate !== null,
  );
  const contractRows: Array<{
    field: string;
    status: string;
    tone: "neutral" | "success" | "warning";
    description: string;
  }> = [
    {
      field: "reservation_date + event window",
      status: data.snapshot.connected ? "Seen in source window" : "Waiting for source read",
      tone: data.snapshot.connected ? "success" : "warning",
      description:
        "NightOS already scopes the Thursday-to-Saturday operating window and can anchor bookings to that date structure.",
    },
    {
      field: "table_id / slot label",
      status:
        data.snapshot.totalTables > 0 ? "Seen in source layout" : "Layout still pending",
      tone: data.snapshot.totalTables > 0 ? "success" : "warning",
      description:
        "Table occupancy becomes credible only when the writer exposes a stable plan inventory or slot identity.",
    },
    {
      field: "source_label / RP attribution",
      status: hasSourceLabels ? "Seen as free-text label" : "Mapping still missing",
      tone: hasSourceLabels ? "neutral" : "warning",
      description:
        "NightOS can scope RP visibility from aliases, but a clean writer-side promoter field is still the best long-term contract.",
    },
    {
      field: "spend_estimate / price",
      status: hasSpendValues ? "Seen as price value" : "Optional but absent",
      tone: hasSpendValues ? "neutral" : "warning",
      description:
        "Revenue structure should come directly from the writer or a validated pricing model. Missing spend never gets fabricated.",
    },
    {
      field: "booking_status + updated_at",
      status: "Required before approval",
      tone: "warning",
      description:
        "Production sync should not be approved until created, updated, cancelled, and seated states are reliably exposed.",
    },
    {
      field: "client_full_name / phone / email",
      status: "Missing today",
      tone: "warning",
      description:
        "VIP CRM, relaunches, and relationship history depend on real client identity fields coming from the reservation writer.",
    },
    {
      field: "external_booking_id / source_event_id",
      status: "NightOS fields prepared",
      tone: "neutral",
      description:
        "The reader layer is already structured for deduplication, lineage, and sync-aware auditability.",
    },
  ];
  const environmentChecks = [
    { label: "Supabase URL", ready: readiness.supabaseUrl },
    { label: "Supabase anon key", ready: readiness.supabaseAnonKey },
    { label: "Supabase service role", ready: readiness.supabaseServiceRole },
    { label: "Site URL", ready: readiness.siteUrl },
    { label: "Sync shared secret", ready: readiness.syncSharedSecret },
    {
      label: "Reservation source approval",
      ready: readiness.reservationSourceApproved,
    },
  ];
  const technicalReadiness: Array<{
    title: string;
    status: string;
    tone: "neutral" | "success" | "warning";
    description: string;
  }> = [
    {
      title: "Private product shell",
      status: "Strong",
      tone: "success" as const,
      description:
        "The product now reads like an internal operating system, not a public-facing showcase.",
    },
    {
      title: "Reservation contract",
      status: readiness.reservationSourceApproved ? "Approved" : "Awaiting approval",
      tone: readiness.reservationSourceApproved ? "success" : "warning",
      description:
        "Technical inspection can happen now, but the production sync posture stays staged until the writer contract is explicitly approved.",
    },
    {
      title: "Auth rollout",
      status: "Pending",
      tone: "warning" as const,
      description:
        "The secure route structure is ready. Full production rollout still needs a Supabase project, invited users, and role rows.",
    },
    {
      title: "Exceptional operating layer",
      status: "Next phase",
      tone: "neutral" as const,
      description:
        "Direction-grade alerts, durable audit trails, and CRM identity capture are the moves that turn a very good product into a club benchmark.",
    },
  ];

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
            {roleCards.map((role) => (
              <div className="surface-muted grid gap-2 p-4 md:grid-cols-[140px_1fr]" key={role.label}>
                <p className="text-sm font-medium">{role.label}</p>
                <p className="text-sm text-muted-foreground">{role.description}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Reservation Sync"
          title="Operational source status"
          description="The reservation site remains the writer. NightOS is structured to read it safely and to persist it once the production contract is fully approved."
          footer={
            <p className="text-xs text-muted-foreground">
              Last technical read: {formatDateTime(data.snapshot.fetchedAt)}
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
            {!readiness.reservationSourceApproved ? (
              <div className="surface-muted border border-warning/25 bg-warning/10 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-warning">
                  Approval gate active
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Source inspection is allowed, but production persistence remains blocked until
                  the writer contract, ownership, and approval are explicit.
                </p>
              </div>
            ) : null}
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
          eyebrow="Data Contract"
          title="What the reservation writer must provide"
          description="NightOS is already structured for sync-aware reading, but the writer contract still decides whether the operating layer becomes trustworthy."
        >
          <div className="grid gap-3">
            {contractRows.map((row) => (
              <div className="surface-muted grid gap-3 p-4 md:grid-cols-[1.2fr_auto]" key={row.field}>
                <div className="space-y-2">
                  <p className="text-sm font-medium">{row.field}</p>
                  <p className="text-sm leading-6 text-muted-foreground">{row.description}</p>
                </div>
                <div className="md:justify-self-end">
                  <StatusPill label={row.status} tone={row.tone} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Environment Setup"
          title="Current environment readiness"
          description="Secrets stay out of git and the service role key never reaches the client."
        >
          <div className="grid gap-3 md:grid-cols-2">
            {environmentChecks.map(({ label, ready }) => (
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
            {securityControls.map((item) => (
              <div className="surface-muted grid gap-3 p-4 md:grid-cols-[1fr_auto]" key={item.title}>
                <div className="space-y-2">
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-sm leading-6 text-muted-foreground">{item.description}</p>
                </div>
                <div className="md:justify-self-end">
                  <StatusPill label={item.status} tone={item.tone} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard
          eyebrow="Sessions & Permissions"
          title="Private-platform operating rules"
          description="A premium internal tool needs disciplined access behavior, not just a dark interface."
        >
          <div className="grid gap-3">
            {sessionPolicies.map((item) => (
              <div className="surface-muted grid gap-3 p-4 md:grid-cols-[1fr_auto]" key={item.title}>
                <div className="space-y-2">
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-sm leading-6 text-muted-foreground">{item.description}</p>
                </div>
                <div className="md:justify-self-end">
                  <StatusPill
                    label={
                      item.tone === "success"
                        ? "Protected"
                        : item.tone === "warning"
                          ? "Policy pending"
                          : "Structured"
                    }
                    tone={item.tone}
                  />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Audit & Journal"
          title="Traceability still to finish"
          description="What turns a very good internal tool into an exceptional operating system is durable visibility into who changed what, when, and why."
        >
          <div className="grid gap-3">
            {auditControls.map((item) => (
              <div className="surface-muted grid gap-3 p-4 md:grid-cols-[1fr_auto]" key={item.title}>
                <div className="space-y-2">
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-sm leading-6 text-muted-foreground">{item.description}</p>
                </div>
                <div className="md:justify-self-end">
                  <StatusPill
                    label={
                      item.tone === "warning"
                        ? "Next phase"
                        : item.tone === "neutral"
                          ? "Prepared"
                          : "Active"
                    }
                    tone={item.tone}
                  />
                </div>
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
          <div className="grid gap-3">
            {technicalReadiness.map((item) => (
              <div className="surface-muted grid gap-3 p-4 md:grid-cols-[1fr_auto]" key={item.title}>
                <div className="space-y-2">
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-sm leading-6 text-muted-foreground">{item.description}</p>
                </div>
                <div className="md:justify-self-end">
                  <StatusPill label={item.status} tone={item.tone} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Repository & Docs"
          title="What to open next"
          description="These references explain the production posture, the writer contract, and the path from strong to exceptional."
        >
          <div className="space-y-3">
            <Button asChild variant="outline">
              <Link href="https://github.com/silentlng/NightOS" target="_blank">
                Open GitHub repository
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link
                href="https://github.com/silentlng/NightOS/blob/main/docs/nightos-reservation-contract.md"
                target="_blank"
              >
                Open reservation contract
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link
                href="https://github.com/silentlng/NightOS/blob/main/docs/nightos-exceptional-roadmap.md"
                target="_blank"
              >
                Open exceptional roadmap
              </Link>
            </Button>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

import type { ReactNode } from "react";
import Link from "next/link";
import { signOutAction } from "@/app/actions/auth";
import { SidebarNav } from "@/components/sidebar-nav";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { roleLabels, siteConfig } from "@/lib/site";
import type { AppAccess } from "@/types/app";

export function WorkspaceShell({
  access,
  basePath,
  children,
}: {
  access: AppAccess;
  basePath: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen px-4 py-4 md:px-6 md:py-6">
      <div className="mx-auto grid max-w-[1700px] gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="surface-strong relative flex h-full flex-col gap-8 overflow-hidden p-6 md:sticky md:top-6 md:h-fit md:p-7">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="eyebrow">{siteConfig.codename} Layer</p>
              <div className="space-y-3">
                <p className="text-[0.72rem] uppercase tracking-[0.3em] text-muted-foreground">
                  {siteConfig.name}
                </p>
                <h1 className="font-display text-5xl leading-[0.88] tracking-[0.04em]">
                  Internal club command.
                </h1>
                <p className="text-sm leading-6 text-muted-foreground">
                  {siteConfig.sourceOfTruth} {siteConfig.analyticsLayer}
                </p>
              </div>
            </div>

            <div className="surface-muted space-y-4 p-5">
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill
                  label={
                    access.mode === "preview"
                      ? "Read-only preview"
                      : "Protected workspace"
                  }
                  tone={access.mode === "preview" ? "warning" : "success"}
                />
                <StatusPill label={roleLabels[access.role]} tone="accent" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-medium text-foreground">{access.viewerName}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {siteConfig.securityPosture}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.26em] text-muted-foreground">
              Workspace
            </p>
            <SidebarNav access={access} basePath={basePath} />
          </div>

          <div className="mt-auto space-y-4">
            <div className="surface-muted p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
                Data posture
              </p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                No fake reservations, clients, RP rankings, or revenue. Empty states remain visible until the reservation source is connected and persisted.
              </p>
            </div>
            {access.mode === "authenticated" ? (
              <form action={signOutAction}>
                <Button className="w-full" type="submit" variant="outline">
                  Sign out
                </Button>
              </form>
            ) : (
              <Button asChild className="w-full" variant="outline">
                <Link href="/auth/login">Open secure workspace</Link>
              </Button>
            )}
          </div>
        </aside>

        <div className="flex min-h-[calc(100vh-2rem)] flex-col gap-5">
          <header className="surface relative overflow-hidden p-5 md:p-6">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div className="space-y-3">
                <p className="eyebrow">Operational command layer</p>
                <div className="space-y-2">
                  <p className="font-display text-3xl leading-none tracking-[0.04em] md:text-4xl">
                    A premium internal OS built around the reservation source.
                  </p>
                  <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                    Reservation site writes. Cova OS reads, synchronizes, analyzes, and supports decisions without inventing business activity.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <StatusPill label={roleLabels[access.role]} tone="accent" />
                <StatusPill
                  label={access.mode === "preview" ? "Preview access" : "Authenticated"}
                  tone={access.mode === "preview" ? "warning" : "success"}
                />
                {access.mode === "preview" ? (
                  <Button asChild size="sm">
                    <Link href="/preview/manager/dashboard">Reset preview</Link>
                  </Button>
                ) : null}
              </div>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <div className="surface-muted p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Writer
                </p>
                <p className="mt-3 text-sm leading-6 text-foreground">
                  Reservation site
                </p>
              </div>
              <div className="surface-muted p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Reader
                </p>
                <p className="mt-3 text-sm leading-6 text-foreground">
                  NightOS analytics and operations layer
                </p>
              </div>
              <div className="surface-muted p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Rule
                </p>
                <p className="mt-3 text-sm leading-6 text-foreground">
                  Honest empty states until data is real
                </p>
              </div>
            </div>
          </header>

          <main className="flex-1 space-y-6">{children}</main>
        </div>
      </div>
    </div>
  );
}

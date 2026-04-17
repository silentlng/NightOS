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
      <div className="mx-auto grid max-w-[1600px] gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="surface-strong flex h-full flex-col gap-8 p-6 md:p-7">
          <div className="space-y-5">
            <div className="space-y-3">
              <p className="eyebrow">Internal Operating System</p>
              <div className="space-y-2">
                <h1 className="font-display text-4xl tracking-[0.04em]">
                  {siteConfig.name}
                </h1>
                <p className="text-sm leading-6 text-muted-foreground">
                  {siteConfig.sourceOfTruth}
                </p>
              </div>
            </div>

            <div className="surface-muted space-y-4 p-4">
              <StatusPill
                label={
                  access.mode === "preview"
                    ? "Read-only preview"
                    : "Protected workspace"
                }
                tone={access.mode === "preview" ? "warning" : "success"}
              />
              <div className="space-y-1">
                <p className="text-sm font-medium">{access.viewerName}</p>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {roleLabels[access.role]}
                </p>
              </div>
              <p className="text-xs leading-5 text-muted-foreground">
                {siteConfig.analyticsLayer}
              </p>
            </div>
          </div>

          <SidebarNav access={access} basePath={basePath} />

          <div className="mt-auto space-y-3">
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
            <p className="text-xs leading-5 text-muted-foreground">
              No fake reservations, clients, RP rankings, or revenue. Empty states
              remain visible until the reservation source is connected.
            </p>
          </div>
        </aside>

        <div className="flex min-h-[calc(100vh-2rem)] flex-col gap-4">
          <header className="surface flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between md:p-6">
            <div className="space-y-2">
              <p className="eyebrow">Source Of Truth</p>
              <p className="text-sm leading-6 text-muted-foreground">
                Reservation site writes. Cova OS reads, synchronizes, analyzes,
                and supports decisions.
              </p>
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
          </header>

          <main className="flex-1 space-y-6">{children}</main>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";

export default function Home() {
  return (
    <main className="min-h-screen px-4 py-6 md:px-6 md:py-8">
      <div className="mx-auto flex max-w-[1520px] flex-col gap-5">
        <section className="surface-strong relative overflow-hidden px-8 py-8 md:px-10 md:py-10">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/45 to-transparent" />
          <div className="flex flex-col gap-10 xl:flex-row xl:justify-between">
            <div className="max-w-5xl space-y-8">
              <div className="space-y-4">
                <p className="eyebrow">{siteConfig.codename}</p>
                <div className="space-y-5">
                  <p className="text-[0.72rem] uppercase tracking-[0.34em] text-muted-foreground">
                    {siteConfig.name}
                  </p>
                  <h1 className="display-heading max-w-5xl">
                    Luxury club operations, expressed as a real internal product.
                  </h1>
                  <p className="section-copy max-w-3xl">
                    {siteConfig.sourceOfTruth} {siteConfig.analyticsLayer} This
                    experience is designed to feel premium, controlled, and calm,
                    while staying honest when real CRM or historical data is not yet
                    connected.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/auth/login">Open secure workspace</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/preview/manager/dashboard">Open manager preview</Link>
                </Button>
              </div>
            </div>

            <div className="w-full max-w-[420px] space-y-3">
              {[
                {
                  label: "Source of truth",
                  copy: "The operational reservation site keeps write ownership. NightOS reads and structures it.",
                },
                {
                  label: "Truthfulness",
                  copy: "No fake reservations, no fake revenue, and no invented RP rankings when the source is empty.",
                },
                {
                  label: "Security",
                  copy: "Protected routes, server-side session checks, scoped access, and Supabase-ready persistence.",
                },
              ].map((item) => (
                <div className="surface-muted p-5" key={item.label}>
                  <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-foreground">{item.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="surface relative overflow-hidden p-8 md:p-10">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="eyebrow">Operating modules</p>
                <h2 className="display-subheading">
                  Built as an internal SaaS, not a public booking site.
                </h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  NightOS turns the existing reservation surface into an analytics,
                  CRM, and decision-support system for managers, staff, promoters,
                  and direction.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {[
                  "Dashboard with tonight status, sync health, and alerts.",
                  "Reservations with source visibility, external IDs, and sync metadata.",
                  "RP performance that stays empty when no source activity exists.",
                  "VIP CRM prepared for client-level sync, not fabricated placeholders.",
                  "Analytics reduced to business decisions, not decorative charts.",
                  "Settings split between implemented, pending connection, and future bridge.",
                ].map((item) => (
                  <div className="surface-muted p-4 text-sm leading-6 text-muted-foreground" key={item}>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="surface relative overflow-hidden p-8 md:p-10">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="eyebrow">Access modes</p>
                <h2 className="display-subheading">Production when ready, preview when needed.</h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  Production routes stay protected. Preview routes remain useful for
                  demos while Supabase and sync persistence are still being finalized.
                </p>
              </div>

              <div className="grid gap-3">
                <Button asChild className="w-full">
                  <Link href="/auth/login">Secure sign-in</Link>
                </Button>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/preview/manager/dashboard">Preview as manager</Link>
                </Button>
                <Button asChild className="w-full" variant="ghost">
                  <Link href="/preview/admin/dashboard">Preview as admin</Link>
                </Button>
              </div>

              <div className="surface-muted space-y-3 p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  Product rules
                </p>
                <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
                  <li>No fake reservations or revenue are generated.</li>
                  <li>Live source data appears only when the reservation source responds.</li>
                  <li>VIP CRM stays empty until client identities are truly synchronized.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

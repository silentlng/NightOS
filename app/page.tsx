import Link from "next/link";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";

export default function Home() {
  return (
    <main className="min-h-screen px-4 py-6 md:px-6 md:py-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-[1440px] gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="surface-strong flex flex-col justify-between p-8 md:p-10">
          <div className="space-y-6">
            <p className="eyebrow">Cova Club OS</p>
            <div className="space-y-4">
              <h1 className="display-heading max-w-4xl">
                Premium internal dashboard for club operations, reservation sync, RP visibility, and CRM readiness.
              </h1>
              <p className="section-copy">
                {siteConfig.sourceOfTruth} {siteConfig.analyticsLayer}
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {[
              "Dashboard and operations",
              "Reservations and RP visibility",
              "CRM, analytics, and sync settings",
            ].map((item) => (
              <div className="surface-muted p-4 text-sm text-muted-foreground" key={item}>
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="surface flex items-center p-8 md:p-10">
          <div className="w-full space-y-6">
            <div className="space-y-3">
              <p className="eyebrow">Access</p>
              <h2 className="display-subheading">Open the workspace</h2>
              <p className="text-sm leading-6 text-muted-foreground">
                Production routes are protected. Preview routes are available to demonstrate the product honestly while infrastructure is still being connected.
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
              <p className="text-sm font-medium">Current truthfulness rules</p>
              <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
                <li>No fake reservations or revenue are generated.</li>
                <li>Live source data appears only when the reservation source responds.</li>
                <li>VIP CRM stays empty until client identities are truly synchronized.</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

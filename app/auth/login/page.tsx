import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";
import { isSupabaseConfigured } from "@/lib/env";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const nextPath = params.next?.startsWith("/app")
    ? params.next
    : "/app/dashboard";

  return (
    <main className="min-h-screen px-4 py-6 md:px-6 md:py-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-[1420px] gap-5 xl:grid-cols-[1.12fr_0.88fr]">
        <section className="surface-strong relative overflow-hidden p-8 md:p-10">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/45 to-transparent" />
          <div className="flex h-full flex-col justify-between gap-10">
            <div className="space-y-8">
              <div className="space-y-4">
                <p className="eyebrow">{siteConfig.codename}</p>
                <div className="space-y-5">
                  <p className="text-[0.72rem] uppercase tracking-[0.34em] text-muted-foreground">
                    {siteConfig.name}
                  </p>
                  <h1 className="display-heading max-w-4xl">
                    Secure internal access for club operations, CRM, and live reservation intelligence.
                  </h1>
                  <p className="section-copy max-w-3xl">
                    The reservation site remains the operational source of truth.
                    NightOS reads, synchronizes, and structures the data for
                    managers, staff, promoters, and direction.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {[
                  "Server-side protected routes",
                  "Scoped visibility by role",
                  "No fake business data",
                ].map((item) => (
                  <div className="surface-muted p-4 text-sm leading-6 text-muted-foreground" key={item}>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="surface-muted max-w-xl p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                Access policy
              </p>
              <p className="mt-3 text-sm leading-6 text-foreground">
                Admins and managers keep business-wide visibility. RP accounts stay
                scoped to their own reservations, performance, and client context.
              </p>
            </div>
          </div>
        </section>

        <section className="surface relative flex items-center justify-center overflow-hidden p-8 md:p-10">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
          <div className="w-full max-w-md space-y-6">
            <div className="space-y-3">
              <p className="eyebrow">Secure Access</p>
              <h2 className="display-subheading">Sign in</h2>
              <p className="text-sm leading-6 text-muted-foreground">
                Use Supabase Auth for production access. Preview mode stays available
                for demo walkthroughs while infrastructure is still being finalized.
              </p>
            </div>

            {isSupabaseConfigured() ? (
              <LoginForm nextPath={nextPath} />
            ) : (
              <div className="rounded-[1.75rem] border border-warning/25 bg-warning/10 p-5 text-sm leading-6 text-warning">
                Supabase public credentials are not configured in this environment yet.
                You can still open the live preview workspace while infrastructure
                setup is being finalized.
              </div>
            )}

            <div className="grid gap-3 md:grid-cols-2">
              <Button asChild variant="outline">
                <Link href="/preview/manager/dashboard">Open preview</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/auth/setup-required">Setup guide</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

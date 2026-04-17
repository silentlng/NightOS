import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/env";

export default function LoginPage() {
  return (
    <main className="min-h-screen px-4 py-6 md:px-6 md:py-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-[1280px] gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="surface-strong flex flex-col justify-between p-8 md:p-10">
          <div className="space-y-6">
            <p className="eyebrow">NightOS</p>
            <div className="space-y-4">
              <h1 className="display-heading max-w-3xl">
                Internal operating system for reservations, RP visibility, CRM, and decision support.
              </h1>
              <p className="section-copy">
                The reservation site remains the operational source of truth. NightOS reads, synchronizes, and structures the data for managers, staff, promoters, and direction.
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {[
              "No fake business data",
              "Server-side protected routes",
              "Sync-aware architecture",
            ].map((item) => (
              <div className="surface-muted p-4 text-sm text-muted-foreground" key={item}>
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="surface flex items-center justify-center p-8 md:p-10">
          <div className="w-full max-w-md space-y-6">
            <div className="space-y-2">
              <p className="eyebrow">Secure Access</p>
              <h2 className="display-subheading">Sign in</h2>
              <p className="text-sm leading-6 text-muted-foreground">
                Use Supabase Auth for production access. Preview mode stays available for demo walkthroughs.
              </p>
            </div>

            {isSupabaseConfigured() ? (
              <LoginForm nextPath="/app/dashboard" />
            ) : (
              <div className="rounded-3xl border border-warning/25 bg-warning/10 p-5 text-sm leading-6 text-warning">
                Supabase public credentials are not configured in this environment yet. You can still open the live preview workspace while infrastructure setup is being finalized.
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

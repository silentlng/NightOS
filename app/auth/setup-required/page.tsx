import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function SetupRequiredPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const reason = typeof params.reason === "string" ? params.reason : undefined;

  return (
    <main className="min-h-screen px-4 py-6 md:px-6 md:py-8">
      <div className="mx-auto max-w-4xl space-y-4">
        <section className="surface-strong space-y-6 p-8 md:p-10">
          <div className="space-y-3">
            <p className="eyebrow">Setup Required</p>
            <h1 className="display-heading">Protected workspace is not fully configured yet.</h1>
            <p className="section-copy">
              NightOS can already run in preview mode, but production access requires Supabase Auth, profiles, and role assignments. Nothing is faked here: if infrastructure is missing, the app says so directly.
            </p>
          </div>

          {reason ? (
            <div className="rounded-2xl border border-warning/25 bg-warning/10 px-4 py-3 text-sm text-warning">
              Current blocker: {reason === "profile" ? "profile or role assignment missing" : reason}
            </div>
          ) : null}

          <div className="grid gap-3 md:grid-cols-2">
            {[
              "Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY",
              "Configure SUPABASE_SERVICE_ROLE_KEY and RESERVATION_SYNC_SHARED_SECRET",
              "Run the Supabase migration SQL in this repository",
              "Create authenticated users and matching profiles with admin, manager, or rp roles",
            ].map((item) => (
              <div className="surface-muted p-4 text-sm text-muted-foreground" key={item}>
                {item}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/preview/manager/dashboard">Open preview workspace</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/auth/login">Back to login</Link>
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}

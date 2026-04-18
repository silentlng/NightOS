import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { InternalAccessForm } from "@/components/auth/internal-access-form";
import { Button } from "@/components/ui/button";
import { hasValidInternalAccessCookieValue } from "@/lib/auth/internal-access";
import { isInternalAccessConfigured } from "@/lib/env";
import { siteConfig } from "@/lib/site";

export default async function InternalAccessPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  if (!isInternalAccessConfigured()) {
    redirect("/auth/login");
  }

  const params = await searchParams;
  const nextPath = params.next?.startsWith("/") ? params.next : "/auth/login";
  const cookieStore = await cookies();
  const accessCookie = cookieStore.get("nightos_internal_access")?.value;

  if (await hasValidInternalAccessCookieValue(accessCookie)) {
    redirect(nextPath);
  }

  return (
    <main className="min-h-screen px-4 py-6 md:px-6 md:py-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-[1360px] gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="surface-strong relative overflow-hidden p-8 md:p-10">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/45 to-transparent" />
          <div className="flex h-full flex-col justify-between gap-10">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Image
                    alt="COVA"
                    className="h-auto w-[112px]"
                    height={64}
                    priority
                    src="/cova-logo-white.png"
                    width={210}
                  />
                  <div className="space-y-1">
                    <p className="eyebrow">{siteConfig.codename}</p>
                    <p className="text-[0.72rem] uppercase tracking-[0.34em] text-muted-foreground">
                      Private internal platform
                    </p>
                  </div>
                </div>
                <div className="space-y-5">
                  <p className="text-[0.72rem] uppercase tracking-[0.34em] text-muted-foreground">
                    {siteConfig.name}
                  </p>
                  <h1 className="display-heading max-w-4xl">
                    Internal access gate before workspace, preview, and operational data.
                  </h1>
                  <p className="section-copy max-w-3xl">
                    NightOS is deployed as a private operating platform. Enter the
                    internal access code to unlock the workspace entry, then continue
                    to secure sign-in or the controlled preview experience.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {[
                  "Private internal navigation",
                  "Source-aware reservation inspection",
                  "No fake business activity or CRM data",
                ].map((item) => (
                  <div className="surface-muted p-4 text-sm leading-6 text-muted-foreground" key={item}>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="surface-muted max-w-xl p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                Entry policy
              </p>
              <p className="mt-3 text-sm leading-6 text-foreground">
                This gate protects NightOS while Supabase production auth and role
                provisioning are still being finalized. It keeps the platform private
                without pretending that permanent identity infrastructure is already complete.
              </p>
            </div>
          </div>
        </section>

        <section className="surface relative flex items-center justify-center overflow-hidden p-8 md:p-10">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
          <div className="w-full max-w-md space-y-6">
            <div className="space-y-3">
              <p className="eyebrow">Internal Access</p>
              <h2 className="display-subheading">Unlock NightOS</h2>
              <p className="text-sm leading-6 text-muted-foreground">
                This code gate protects deployed preview routes, login entry, and the
                internal landing surface before full production auth is switched on.
              </p>
            </div>

            <InternalAccessForm nextPath={nextPath} />

            <div className="grid gap-3 md:grid-cols-2">
              <Button asChild variant="outline">
                <Link href="/auth/login">Go to sign-in</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/">Back to platform entry</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

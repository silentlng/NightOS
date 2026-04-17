"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { workspaceNavigation } from "@/lib/site";
import { cn } from "@/lib/utils";
import type { AppAccess } from "@/types/app";

export function SidebarNav({
  access,
  basePath,
}: {
  access: AppAccess;
  basePath: string;
}) {
  const pathname = usePathname();

  const previewSection =
    access.mode === "preview"
      ? pathname.replace(/^\/preview\/[^/]+/, "") || "/dashboard"
      : null;

  return (
    <div className="space-y-8">
      <nav className="space-y-3">
        {workspaceNavigation.map((item) => {
          const href = `${basePath}${item.href}`;
          const isActive =
            pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              className={cn(
                "block rounded-2xl border px-4 py-3 transition",
                isActive
                  ? "border-accent/30 bg-accent/10 text-foreground"
                  : "border-transparent bg-white/[0.02] text-muted-foreground hover:border-white/8 hover:bg-white/[0.05] hover:text-foreground",
              )}
              href={href}
              key={item.href}
            >
              <div className="space-y-1">
                <div className="text-sm font-medium">{item.label}</div>
                <div className="text-xs leading-5 text-muted-foreground">
                  {item.description}
                </div>
              </div>
            </Link>
          );
        })}
      </nav>

      {access.mode === "preview" && previewSection ? (
        <div className="surface-muted space-y-3 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
            Preview Role
          </p>
          <div className="grid grid-cols-3 gap-2">
            {(["admin", "manager", "rp"] as const).map((role) => (
              <Link
                className={cn(
                  "rounded-full border px-3 py-2 text-center text-[0.7rem] font-semibold uppercase tracking-[0.18em] transition",
                  access.role === role
                    ? "border-accent/30 bg-accent/10 text-accent-strong"
                    : "border-white/8 bg-white/[0.02] text-muted-foreground hover:text-foreground",
                )}
                href={`/preview/${role}${previewSection}`}
                key={role}
              >
                {role}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

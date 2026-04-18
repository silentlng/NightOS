import type { AppRole, WorkspaceSection } from "@/types/app";

export const siteConfig = {
  name: "Cova Club OS",
  description:
    "Private premium operations platform for club managers, staff, promoters, and direction.",
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000",
  sourceOfTruth: "The reservation site remains the operational writer and source of truth.",
  analyticsLayer: "Cova OS reads, synchronizes, and exploits reservation data for operations.",
  codename: "NightOS",
  securityPosture: "Server-validated access, scoped visibility, and sync-aware ingestion.",
} as const;

export const workspaceNavigation = [
  {
    section: "dashboard",
    href: "/dashboard",
    label: "Dashboard",
    description: "Tonight status, sync health, and operational signals.",
    roles: ["admin", "manager", "rp"],
  },
  {
    section: "reservations",
    href: "/reservations",
    label: "Reservations",
    description: "Operational reservation view with sync visibility.",
    roles: ["admin", "manager", "rp"],
  },
  {
    section: "rpPerformance",
    href: "/rp-performance",
    label: "RP Performance",
    description: "Promoter value, inactivity, and follow-up structure.",
    roles: ["admin", "manager", "rp"],
  },
  {
    section: "crm",
    href: "/crm",
    label: "VIP CRM",
    description: "Client relationship history tied to imported visits.",
    roles: ["admin", "manager", "rp"],
  },
  {
    section: "analytics",
    href: "/analytics",
    label: "Analytics",
    description: "Decision-oriented measurement without invented charts.",
    roles: ["admin", "manager", "rp"],
  },
  {
    section: "settings",
    href: "/settings",
    label: "Settings",
    description: "Access, sync, security, audit, sessions, and technical readiness.",
    roles: ["admin", "manager"],
  },
] as const satisfies readonly {
  section: WorkspaceSection;
  href: string;
  label: string;
  description: string;
  roles: readonly AppRole[];
}[];

export const roleLabels: Record<AppRole, string> = {
  admin: "Admin",
  manager: "Manager",
  rp: "RP",
};

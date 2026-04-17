import type { AppRole } from "@/types/app";

export const siteConfig = {
  name: "Cova Club OS",
  description:
    "Premium internal operations dashboard for club managers, staff, promoters, and direction.",
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000",
  sourceOfTruth: "The reservation site remains the operational writer and source of truth.",
  analyticsLayer: "Cova OS reads, synchronizes, and exploits reservation data for operations.",
} as const;

export const workspaceNavigation = [
  {
    href: "/dashboard",
    label: "Dashboard",
    description: "Tonight status, sync health, and operational signals.",
  },
  {
    href: "/reservations",
    label: "Reservations",
    description: "Operational reservation view with sync visibility.",
  },
  {
    href: "/rp-performance",
    label: "RP Performance",
    description: "Promoter value, inactivity, and follow-up structure.",
  },
  {
    href: "/crm",
    label: "VIP CRM",
    description: "Client relationship history tied to imported visits.",
  },
  {
    href: "/analytics",
    label: "Analytics",
    description: "Decision-oriented measurement without invented charts.",
  },
  {
    href: "/settings",
    label: "Settings",
    description: "Access, sync, security, deployment, and future architecture.",
  },
] as const;

export const roleLabels: Record<AppRole, string> = {
  admin: "Admin",
  manager: "Manager",
  rp: "RP",
};

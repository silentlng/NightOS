import type { AppRole, WorkspaceSection } from "@/types/app";

const sectionAccess: Record<WorkspaceSection, AppRole[]> = {
  dashboard: ["admin", "manager", "rp"],
  reservations: ["admin", "manager", "rp"],
  rpPerformance: ["admin", "manager", "rp"],
  crm: ["admin", "manager", "rp"],
  analytics: ["admin", "manager", "rp"],
  settings: ["admin", "manager"],
};

export function canAccessSection(role: AppRole, section: WorkspaceSection) {
  return sectionAccess[section].includes(role);
}

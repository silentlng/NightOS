export type AppRole = "admin" | "manager" | "rp";
export type WorkspaceMode = "authenticated" | "preview";
export type WorkspaceSection =
  | "dashboard"
  | "reservations"
  | "rpPerformance"
  | "crm"
  | "analytics"
  | "settings";
export type SyncState =
  | "not_configured"
  | "pending_data"
  | "active"
  | "attention"
  | "error";
export type BusinessReadiness = "ready" | "needs_attention" | "critical";

export interface AppAccess {
  mode: WorkspaceMode;
  role: AppRole;
  viewerName: string;
  email?: string | null;
  userId?: string;
  rpProfileId?: string | null;
  rpDisplayName?: string | null;
  rpSourceLabels?: string[];
  previewRole?: AppRole;
}

export interface SyncOverview {
  state: SyncState;
  label: string;
  summary: string;
  detail: string;
  lastSyncedAt?: string | null;
  sourceLabel: string;
}

export interface OperationalAlert {
  title: string;
  description: string;
  tone: "neutral" | "success" | "warning" | "danger";
}

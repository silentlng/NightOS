import type { AppRole } from "@/types/app";

export type ReservationStatus =
  | "draft"
  | "confirmed"
  | "arrived"
  | "completed"
  | "cancelled"
  | "no_show";

export type SyncStatus =
  | "manual_only"
  | "pending"
  | "in_sync"
  | "stale"
  | "error";

export interface ProfileRow {
  user_id: string;
  email: string | null;
  full_name: string | null;
  role: AppRole;
  is_active: boolean;
}

export interface RpProfileRow {
  id: string;
  profile_id: string;
  display_name: string | null;
  status: "active" | "inactive";
  source_labels: string[];
}

export interface EventRow {
  id: string;
  name: string;
  event_date: string;
  external_source: string | null;
  external_event_id: string | null;
  sync_status: SyncStatus;
  last_synced_at: string | null;
}

export interface ClientRow {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  vip_tier: "standard" | "vip" | "vvip" | "house_priority";
  assigned_rp_profile_id: string | null;
  source_client_id: string | null;
  external_source: string | null;
  sync_status: SyncStatus;
  last_synced_at: string | null;
}

export interface ReservationRow {
  id: string;
  event_id: string | null;
  client_id: string | null;
  table_id: string | null;
  rp_profile_id: string | null;
  status: ReservationStatus;
  sync_status: SyncStatus;
  external_source: string | null;
  external_booking_id: string | null;
  reservation_datetime: string | null;
  guest_count: number | null;
  spend_estimate: number | null;
  spend_actual: number | null;
  last_synced_at: string | null;
  imported_at: string | null;
  source_event_id: string | null;
  source_client_id: string | null;
  created_from: string | null;
  updated_from_source: string | null;
  notes: string | null;
}

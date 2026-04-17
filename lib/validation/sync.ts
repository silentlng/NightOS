import { z } from "zod";

export const syncStatusSchema = z.enum([
  "manual_only",
  "pending",
  "in_sync",
  "stale",
  "error",
]);

export const reservationStatusSchema = z.enum([
  "draft",
  "confirmed",
  "arrived",
  "completed",
  "cancelled",
  "no_show",
]);

export const eventSyncRecordSchema = z.object({
  external_event_id: z.string().trim().min(1),
  name: z.string().trim().min(1),
  event_date: z.string().trim().min(1),
  sync_status: syncStatusSchema.default("in_sync"),
  notes: z.string().trim().optional(),
});

export const clientSyncRecordSchema = z.object({
  source_client_id: z.string().trim().min(1),
  full_name: z.string().trim().min(1),
  email: z.string().trim().email().optional(),
  phone: z.string().trim().optional(),
  sync_status: syncStatusSchema.default("in_sync"),
  preferences: z.record(z.string(), z.unknown()).optional(),
});

export const reservationSyncRecordSchema = z.object({
  external_booking_id: z.string().trim().min(1),
  external_source: z.string().trim().min(1).default("reservation_site"),
  source_event_id: z.string().trim().optional(),
  source_client_id: z.string().trim().optional(),
  status: reservationStatusSchema.default("confirmed"),
  sync_status: syncStatusSchema.default("in_sync"),
  reservation_datetime: z.string().trim().optional(),
  guest_count: z.number().int().positive().optional(),
  spend_estimate: z.number().nonnegative().optional(),
  spend_actual: z.number().nonnegative().optional(),
  notes: z.string().trim().optional(),
  source_payload: z.unknown().optional(),
});

export const reservationSyncPayloadSchema = z.object({
  source: z.string().trim().min(1),
  source_event_id: z.string().trim().optional(),
  imported_at: z.string().trim().optional(),
  last_synced_at: z.string().trim().optional(),
  events: z.array(eventSyncRecordSchema).default([]),
  clients: z.array(clientSyncRecordSchema).default([]),
  reservations: z.array(reservationSyncRecordSchema).min(1),
});

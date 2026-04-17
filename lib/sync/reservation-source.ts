import "server-only";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { getReservationSourceSnapshot } from "@/lib/integrations/reservation-source";

export async function syncReservationSourceIntoSupabase(weekOffset = 0) {
  const snapshot = await getReservationSourceSnapshot(weekOffset);

  if (!snapshot.connected) {
    throw new Error(
      snapshot.error || "Reservation source is not connected, so sync cannot continue.",
    );
  }

  const admin = createAdminSupabaseClient();
  const syncedAt = new Date().toISOString();

  if (snapshot.tableInventory.length > 0) {
    await admin.from("tables_club").upsert(
      snapshot.tableInventory.map((tableId, index) => ({
        external_source: "cova_club_reservation_site",
        external_table_id: tableId,
        name: `Table ${tableId}`,
        room: "Main room",
        sort_order: index + 1,
        is_active: true,
        sync_status: "in_sync",
        last_synced_at: syncedAt,
      })),
      {
        onConflict: "external_source,external_table_id",
      },
    );
  }

  await admin.from("events").upsert(
    snapshot.nights.map((night) => ({
      external_source: "cova_club_reservation_site",
      external_event_id: night.dateId,
      name: `Cova Club ${night.weekdayLabel}`,
      event_date: `${night.dateId}T00:00:00.000Z`,
      sync_status: "in_sync",
      last_synced_at: syncedAt,
      imported_at: syncedAt,
    })),
    {
      onConflict: "external_source,external_event_id",
    },
  );

  if (snapshot.reservations.length > 0) {
    await admin.from("reservations").upsert(
      snapshot.reservations.map((reservation) => ({
        external_source: reservation.externalSource,
        external_booking_id: reservation.externalBookingId,
        source_event_id: reservation.sourceEventId,
        source_booking_label: reservation.sourceLabel,
        status: "confirmed",
        sync_status: "in_sync",
        reservation_datetime: `${reservation.dateId}T00:00:00.000Z`,
        spend_estimate: reservation.spendEstimate,
        last_synced_at: syncedAt,
        imported_at: syncedAt,
        created_from: "reservation_source_sync",
        updated_from_source: syncedAt,
        raw_source_payload: {
          slot_id: reservation.slotId,
          slot_label: reservation.slotLabel,
          slot_type: reservation.slotType,
          price_raw: reservation.priceRaw,
        },
      })),
      {
        onConflict: "external_source,external_booking_id",
      },
    );
  }

  await admin.from("audit_logs").insert({
    action: "reservation_source_sync_pull",
    entity_type: "reservation_sync",
    entity_id: snapshot.weekLabel,
    metadata: {
      source: snapshot.sourceName,
      reservations: snapshot.reservations.length,
      tables: snapshot.tableInventory.length,
      synced_at: syncedAt,
    },
  });

  return {
    syncedAt,
    totalTables: snapshot.tableInventory.length,
    totalReservations: snapshot.reservations.length,
    source: snapshot.sourceName,
  };
}

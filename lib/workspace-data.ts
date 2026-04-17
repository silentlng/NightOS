import "server-only";

import { getEnvironmentReadiness, isSupabaseConfigured } from "@/lib/env";
import { getReservationSourceSnapshot } from "@/lib/integrations/reservation-source";
import type { AppAccess, BusinessReadiness, OperationalAlert, SyncOverview } from "@/types/app";

function getTodayDateId() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildSyncOverview(snapshot: Awaited<ReturnType<typeof getReservationSourceSnapshot>>): SyncOverview {
  if (!snapshot.configured) {
    return {
      state: "not_configured",
      label: "Reservation sync not configured",
      summary:
        "Add the source URL and access PIN in local or deployed environment variables to activate live read-only sync.",
      detail:
        "NightOS is structurally ready, but the live reservation source credentials are still missing.",
      sourceLabel: snapshot.sourceName,
    };
  }

  if (!snapshot.connected) {
    return {
      state: "error",
      label: "Reservation sync needs attention",
      summary:
        "NightOS could not reach the operational reservation site during this request.",
      detail:
        snapshot.error ||
        "Check the source URL, the access PIN, and whether the Railway app is online.",
      sourceLabel: snapshot.sourceName,
    };
  }

  return {
    state: isSupabaseConfigured() ? "active" : "attention",
    label: isSupabaseConfigured()
      ? "Live source connected"
      : "Live source connected, warehouse pending",
    summary:
      "NightOS can read the reservation source now and is ready for the dedicated Supabase sync pipeline.",
    detail: isSupabaseConfigured()
      ? "Once the pull route is deployed with service-role credentials, live source records can be persisted in Supabase for CRM and analytics."
      : "The live source is reachable, but Supabase credentials still need to be configured before records can be persisted for CRM and historical analytics.",
    lastSyncedAt: snapshot.fetchedAt,
    sourceLabel: snapshot.sourceName,
  };
}

function buildOperationalAlerts(
  access: AppAccess,
  snapshot: Awaited<ReturnType<typeof getReservationSourceSnapshot>>,
  reservationsInScope: typeof snapshot.reservations,
): OperationalAlert[] {
  const alerts: OperationalAlert[] = [];

  if (!snapshot.configured) {
    alerts.push({
      title: "Source connection missing",
      description:
        "NightOS is ready for live reservation reading, but the reservation source environment variables are not configured yet.",
      tone: "warning",
    });
  } else if (!snapshot.connected) {
    alerts.push({
      title: "Source unreachable",
      description:
        snapshot.error ||
        "The reservation source could not be reached during this request. Sync health should be checked before relying on tonight's status.",
      tone: "danger",
    });
  } else {
    alerts.push({
      title: "Reservation source live",
      description:
        "NightOS is reading the operational reservation site in real time and can derive live table occupancy structure without fabricating data.",
      tone: "success",
    });
  }

  if (snapshot.connected && snapshot.reservations.length === 0) {
    alerts.push({
      title: "No reservations returned this week",
      description:
        "The source responded successfully, but no occupied tables or supplemental bookings were returned for the current Thursday-to-Saturday window.",
      tone: "neutral",
    });
  }

  if (!isSupabaseConfigured()) {
    alerts.push({
      title: "Historical warehouse pending",
      description:
        "CRM history, long-range analytics, and persistent role-aware reporting remain pending until Supabase is configured.",
      tone: "warning",
    });
  }

  if (access.role === "rp") {
    alerts.push({
      title: "RP visibility stays account-scoped",
      description:
        reservationsInScope.length > 0
          ? "This RP view is filtered to labels that match the authenticated RP profile mapping."
          : "No reservation-source labels currently map to this RP account, so NightOS keeps the RP view empty instead of showing other operators' activity.",
      tone: reservationsInScope.length > 0 ? "neutral" : "warning",
    });
  }

  alerts.push({
    title: "CRM enrichment still pending",
    description:
      "The current reservation source exposes booking labels and spend values, but not reliable client identity fields, so VIP CRM stays intentionally empty for now.",
    tone: "warning",
  });

  return alerts;
}

function buildBusinessReadiness(
  snapshot: Awaited<ReturnType<typeof getReservationSourceSnapshot>>,
): BusinessReadiness {
  if (snapshot.configured && !snapshot.connected) {
    return "critical";
  }

  if (snapshot.connected && isSupabaseConfigured()) {
    return "ready";
  }

  return "needs_attention";
}

function pickTonight(snapshot: Awaited<ReturnType<typeof getReservationSourceSnapshot>>) {
  const todayDateId = getTodayDateId();
  const futureNight =
    snapshot.nights.find((night) => night.dateId >= todayDateId) || snapshot.nights[0];

  return futureNight;
}

export async function getWorkspaceInsights(access: AppAccess) {
  const snapshot = await getReservationSourceSnapshot();
  const mappedName = access.viewerName.trim().toLowerCase();
  const reservationsInScope =
    access.role === "rp"
      ? snapshot.reservations.filter(
          (reservation) => reservation.sourceLabel?.trim().toLowerCase() === mappedName,
        )
      : snapshot.reservations;
  const promoterStatsInScope =
    access.role === "rp"
      ? snapshot.promoterStats.filter(
          (stat) => stat.sourceLabel.trim().toLowerCase() === mappedName,
        )
      : snapshot.promoterStats;
  const tonight = pickTonight(snapshot);
  const tonightReservations =
    access.role === "rp"
      ? reservationsInScope.filter((reservation) => reservation.dateId === tonight?.dateId)
      : tonight?.slots || [];
  const environmentReadiness = getEnvironmentReadiness();
  const syncOverview = buildSyncOverview(snapshot);
  const businessReadiness = buildBusinessReadiness(snapshot);
  const operationalAlerts = buildOperationalAlerts(
    access,
    snapshot,
    reservationsInScope,
  );

  const weekendRevenue = reservationsInScope.reduce(
    (sum, reservation) => sum + (reservation.spendEstimate ?? 0),
    0,
  );
  const tonightRevenue = tonightReservations.reduce(
    (sum, reservation) => sum + (reservation.spendEstimate ?? 0),
    0,
  );
  const tonightTableBookings = tonightReservations.filter(
    (reservation) => reservation.slotType === "table",
  ).length;
  const tonightSupplementals = tonightReservations.filter(
    (reservation) => reservation.slotType === "supplemental",
  ).length;
  const fillRate =
    snapshot.totalTables > 0 ? tonightTableBookings / snapshot.totalTables : null;

  return {
    snapshot,
    reservationsInScope,
    promoterStatsInScope,
    tonight,
    tonightReservations,
    syncOverview,
    businessReadiness,
    operationalAlerts,
    environmentReadiness,
    metrics: {
      weekendRevenue,
      weekendReservations: reservationsInScope.length,
      activePromoters: promoterStatsInScope.length,
      tonightRevenue,
      tonightTableBookings,
      tonightSupplementals,
      fillRate,
      totalTables: snapshot.totalTables,
    },
  };
}

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
        "NightOS is structurally ready, but the reservation source credentials are still missing.",
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
      ? "Reservation source reachable"
      : "Reservation source reachable, warehouse pending",
    summary:
      "NightOS can inspect the reservation source and is ready for the dedicated Supabase sync pipeline once the production contract is approved.",
    detail: isSupabaseConfigured()
      ? "Once the pull route is deployed with service-role credentials, reservation-source records can be persisted in Supabase for CRM and analytics."
      : "The reservation source is reachable, but Supabase credentials still need to be configured before records can be persisted for CRM and historical analytics.",
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
        "NightOS is ready for reservation-source reading, but the source environment variables are not configured yet.",
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
      title: "Reservation source reachable",
      description:
        "NightOS can inspect the operational reservation site and derive table occupancy structure without fabricating data.",
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

function normalizeSourceLabel(value: string) {
  return value.trim().toLowerCase();
}

function getRpSourceLabels(access: AppAccess) {
  const labels = new Set<string>();

  access.rpSourceLabels?.forEach((label) => {
    if (label.trim()) {
      labels.add(normalizeSourceLabel(label));
    }
  });

  if (access.rpDisplayName?.trim()) {
    labels.add(normalizeSourceLabel(access.rpDisplayName));
  }

  if (access.viewerName.trim()) {
    labels.add(normalizeSourceLabel(access.viewerName));
  }

  return labels;
}

export async function getWorkspaceInsights(access: AppAccess) {
  return getWorkspaceInsightsForWeek(access, 0);
}

export async function getWorkspaceInsightsForWeek(
  access: AppAccess,
  weekOffset = 0,
) {
  const snapshot = await getReservationSourceSnapshot(weekOffset);
  const rpSourceLabels = getRpSourceLabels(access);
  const reservationsInScope =
    access.role === "rp"
      ? snapshot.reservations.filter(
          (reservation) =>
            reservation.sourceLabel
              ? rpSourceLabels.has(normalizeSourceLabel(reservation.sourceLabel))
              : false,
        )
      : snapshot.reservations;
  const promoterStatsInScope =
    access.role === "rp"
      ? snapshot.promoterStats.filter(
          (stat) => rpSourceLabels.has(normalizeSourceLabel(stat.sourceLabel)),
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
  const tableOccupancy = snapshot.tableInventory.map((tableId) => {
    const occupiedNights = snapshot.nights.filter((night) =>
      night.slots.some(
        (reservation) => reservation.slotType === "table" && reservation.slotId === tableId,
      ),
    );

    return {
      tableId,
      occupiedNightCount: occupiedNights.length,
      occupiedNightLabels: occupiedNights.map(
        (night) => `${night.weekdayLabel} ${night.dateLabel}`,
      ),
    };
  });
  const labelEnrichmentQueue = [...promoterStatsInScope].map((item) => ({
    ...item,
    crmStatus: "needs_identity_enrichment" as const,
  }));
  const unlabeledReservations = reservationsInScope.filter(
    (reservation) => !reservation.sourceLabel,
  ).length;

  return {
    snapshot,
    weekOffset,
    reservationsInScope,
    promoterStatsInScope,
    tonight,
    tonightReservations,
    syncOverview,
    businessReadiness,
    operationalAlerts,
    environmentReadiness,
    tableOccupancy,
    labelEnrichmentQueue,
    unlabeledReservations,
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

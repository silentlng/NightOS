import "server-only";

import { cache } from "react";
import { io } from "socket.io-client";
import { z } from "zod";

const sourceDayPayloadSchema = z.object({
  dateId: z.string(),
  tables: z
    .record(
      z.string(),
      z.object({
        name: z.string().optional().default(""),
        price: z.string().optional().default(""),
      }),
    )
    .default({}),
});

export interface ReservationSourceSlot {
  dateId: string;
  dateLabel: string;
  weekdayLabel: string;
  slotId: string;
  slotLabel: string;
  slotType: "table" | "supplemental";
  sourceLabel: string | null;
  priceRaw: string | null;
  spendEstimate: number | null;
  externalBookingId: string;
  externalSource: string;
  sourceEventId: string;
}

export interface ReservationSourceNight {
  dateId: string;
  dateLabel: string;
  weekdayLabel: string;
  slots: ReservationSourceSlot[];
  standardReservations: number;
  supplementalReservations: number;
  estimatedRevenue: number;
}

export interface ReservationSourcePromoterStat {
  sourceLabel: string;
  reservations: number;
  estimatedRevenue: number;
  firstSeenDateId: string;
  lastSeenDateId: string;
}

export interface ReservationSourceSnapshot {
  configured: boolean;
  connected: boolean;
  sourceName: string;
  sourceUrl: string | null;
  fetchedAt: string | null;
  totalTables: number;
  tableInventory: string[];
  weekLabel: string;
  nights: ReservationSourceNight[];
  reservations: ReservationSourceSlot[];
  promoterStats: ReservationSourcePromoterStat[];
  error: string | null;
  limitations: string[];
}

function getReservationSourceConfig() {
  return {
    sourceName:
      process.env.COVA_RESERVATION_SOURCE_NAME?.trim() || "Cova Club Reservation Site",
    sourceUrl: process.env.COVA_RESERVATION_SOURCE_URL?.trim() || null,
    pin: process.env.COVA_RESERVATION_SOURCE_PIN?.trim() || null,
  };
}

function getThursday(weekOffset = 0) {
  const date = new Date();
  const dayOfWeek = date.getDay();
  const toThursday = dayOfWeek >= 4 ? 4 - dayOfWeek : 4 - dayOfWeek + 7;

  date.setDate(date.getDate() + toThursday + weekOffset * 7);
  date.setHours(0, 0, 0, 0);

  return date;
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function toDateId(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatShortDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

function formatWeekday(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
  }).format(date);
}

export function getReservationSourceWeek(weekOffset = 0) {
  const thursday = getThursday(weekOffset);
  const friday = addDays(thursday, 1);
  const saturday = addDays(thursday, 2);
  const nights = [thursday, friday, saturday].map((date) => ({
    date,
    dateId: toDateId(date),
    dateLabel: formatShortDate(date),
    weekdayLabel: formatWeekday(date),
  }));

  return {
    nights,
    weekLabel: `${formatShortDate(thursday)} to ${formatShortDate(saturday)}`,
  };
}

function parseSpend(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const normalized = Number.parseFloat(
    String(value).replace(/\s/g, "").replace(",", ".").replace(/[^\d.]/g, ""),
  );

  return Number.isFinite(normalized) ? normalized : null;
}

async function fetchReservationLayout(sourceUrl: string) {
  const response = await fetch(sourceUrl, {
    cache: "no-store",
    headers: {
      "user-agent": "NightOS/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`Reservation source returned ${response.status}.`);
  }

  const html = await response.text();
  const tableIds = Array.from(
    new Set(
      [...html.matchAll(/data-table="([^"]+)"/g)]
        .map((match) => match[1])
        .filter((value) => /^[0-9]+s?$/.test(value)),
    ),
  ).sort((a, b) =>
    a.localeCompare(b, undefined, {
      numeric: true,
      sensitivity: "base",
    }),
  );

  return {
    tableIds,
  };
}

async function fetchReservationDays(
  sourceUrl: string,
  pin: string,
  dateIds: string[],
): Promise<Record<string, Record<string, { name?: string; price?: string }>>> {
  return new Promise((resolve, reject) => {
    const pending = new Set(dateIds);
    const results: Record<
      string,
      Record<string, { name?: string; price?: string }>
    > = {};
    let settled = false;

    const socket = io(sourceUrl, {
      transports: ["websocket", "polling"],
      timeout: 10_000,
      auth: { pin },
    });

    const finish = (error?: Error) => {
      if (settled) {
        return;
      }

      settled = true;
      clearTimeout(timer);
      socket.removeAllListeners();
      socket.close();

      if (error) {
        reject(error);
        return;
      }

      resolve(results);
    };

    const timer = setTimeout(() => {
      finish(new Error("Timed out while requesting reservation source data."));
    }, 15_000);

    socket.on("connect", () => {
      dateIds.forEach((dateId) => {
        socket.emit("get-day", dateId);
      });
    });

    socket.on("connect_error", (error) => {
      finish(new Error(error.message || "Unable to connect to reservation source."));
    });

    socket.on("day-data", (rawPayload) => {
      const parsed = sourceDayPayloadSchema.safeParse(rawPayload);

      if (!parsed.success) {
        finish(new Error("Reservation source returned an unexpected payload."));
        return;
      }

      results[parsed.data.dateId] = parsed.data.tables;
      pending.delete(parsed.data.dateId);

      if (pending.size === 0) {
        finish();
      }
    });
  });
}

export const getReservationSourceSnapshot = cache(
  async (weekOffset = 0): Promise<ReservationSourceSnapshot> => {
    const { sourceName, sourceUrl, pin } = getReservationSourceConfig();
    const week = getReservationSourceWeek(weekOffset);
    const limitations = [
      "The current reservation source exposes table occupancy labels and spend values, not full client identities.",
      "VIP CRM stays intentionally empty until richer reservation or client data is synchronized.",
      "The sync path can ingest live day snapshots now; cancellation reconciliation and client enrichment remain a later step.",
    ];

    if (!sourceUrl || !pin) {
      return {
        configured: false,
        connected: false,
        sourceName,
        sourceUrl,
        fetchedAt: null,
        totalTables: 0,
        tableInventory: [],
        weekLabel: week.weekLabel,
        nights: week.nights.map((night) => ({
          dateId: night.dateId,
          dateLabel: night.dateLabel,
          weekdayLabel: night.weekdayLabel,
          slots: [],
          standardReservations: 0,
          supplementalReservations: 0,
          estimatedRevenue: 0,
        })),
        reservations: [],
        promoterStats: [],
        error: null,
        limitations,
      };
    }

    try {
      const [layout, dayTables] = await Promise.all([
        fetchReservationLayout(sourceUrl),
        fetchReservationDays(
          sourceUrl,
          pin,
          week.nights.map((night) => night.dateId),
        ),
      ]);

      const reservations: ReservationSourceSlot[] = [];
      const promoterMap = new Map<string, ReservationSourcePromoterStat>();

      const nights = week.nights.map((night) => {
        const slots = Object.entries(dayTables[night.dateId] || {})
          .map(([slotId, row]) => {
            const slotType = slotId.startsWith("S") ? "supplemental" : "table";
            const sourceLabel = row.name?.trim() || null;
            const spendEstimate = parseSpend(row.price);
            const reservation: ReservationSourceSlot = {
              dateId: night.dateId,
              dateLabel: night.dateLabel,
              weekdayLabel: night.weekdayLabel,
              slotId,
              slotLabel:
                slotType === "table" ? `Table ${slotId}` : `Supplemental ${slotId}`,
              slotType,
              sourceLabel,
              priceRaw: row.price?.trim() || null,
              spendEstimate,
              externalBookingId: `${night.dateId}:${slotId}`,
              externalSource: "cova_club_reservation_site",
              sourceEventId: night.dateId,
            };

            if (sourceLabel) {
              const key = sourceLabel.toLowerCase();
              const existing = promoterMap.get(key);

              if (existing) {
                existing.reservations += 1;
                existing.estimatedRevenue += spendEstimate ?? 0;
                existing.lastSeenDateId = night.dateId;
              } else {
                promoterMap.set(key, {
                  sourceLabel,
                  reservations: 1,
                  estimatedRevenue: spendEstimate ?? 0,
                  firstSeenDateId: night.dateId,
                  lastSeenDateId: night.dateId,
                });
              }
            }

            reservations.push(reservation);
            return reservation;
          })
          .sort((a, b) =>
            a.slotId.localeCompare(b.slotId, undefined, {
              numeric: true,
              sensitivity: "base",
            }),
          );

        return {
          dateId: night.dateId,
          dateLabel: night.dateLabel,
          weekdayLabel: night.weekdayLabel,
          slots,
          standardReservations: slots.filter((slot) => slot.slotType === "table").length,
          supplementalReservations: slots.filter(
            (slot) => slot.slotType === "supplemental",
          ).length,
          estimatedRevenue: slots.reduce(
            (sum, slot) => sum + (slot.spendEstimate ?? 0),
            0,
          ),
        };
      });

      return {
        configured: true,
        connected: true,
        sourceName,
        sourceUrl,
        fetchedAt: new Date().toISOString(),
        totalTables: layout.tableIds.length,
        tableInventory: layout.tableIds,
        weekLabel: week.weekLabel,
        nights,
        reservations,
        promoterStats: [...promoterMap.values()].sort(
          (a, b) =>
            b.estimatedRevenue - a.estimatedRevenue ||
            b.reservations - a.reservations,
        ),
        error: null,
        limitations,
      };
    } catch (error) {
      return {
        configured: true,
        connected: false,
        sourceName,
        sourceUrl,
        fetchedAt: null,
        totalTables: 0,
        tableInventory: [],
        weekLabel: week.weekLabel,
        nights: week.nights.map((night) => ({
          dateId: night.dateId,
          dateLabel: night.dateLabel,
          weekdayLabel: night.weekdayLabel,
          slots: [],
          standardReservations: 0,
          supplementalReservations: 0,
          estimatedRevenue: 0,
        })),
        reservations: [],
        promoterStats: [],
        error:
          error instanceof Error
            ? error.message
            : "NightOS could not reach the reservation source.",
        limitations,
      };
    }
  },
);

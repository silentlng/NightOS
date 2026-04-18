"use server";

import { getReservationSourceSnapshot } from "@/lib/integrations/reservation-source";
import { hasServiceRoleKey, isSupabaseConfigured } from "@/lib/env";
import { syncReservationSourceIntoSupabase } from "@/lib/sync/reservation-source";
import { clampWeekOffset } from "@/lib/workspace-navigation";

export interface SourceControlActionState {
  status: "idle" | "success" | "error";
  mode?: "inspect" | "persist";
  message?: string;
  weekLabel?: string;
  reservations?: number;
  tables?: number;
  connected?: boolean;
  syncedAt?: string;
}

export async function runSourceControlAction(
  _previousState: SourceControlActionState,
  formData: FormData,
): Promise<SourceControlActionState> {
  const actionMode = formData.get("actionMode");
  const weekOffset = clampWeekOffset(
    Number.parseInt(String(formData.get("weekOffset") ?? "0"), 10) || 0,
  );

  if (actionMode !== "inspect" && actionMode !== "persist") {
    return {
      status: "error",
      message: "Unknown source control action.",
    };
  }

  if (actionMode === "inspect") {
    const snapshot = await getReservationSourceSnapshot(weekOffset);

    if (!snapshot.connected) {
      return {
        status: "error",
        mode: "inspect",
        message:
          snapshot.error ||
          "NightOS could not reach the reservation source during inspection.",
        connected: false,
        weekLabel: snapshot.weekLabel,
        reservations: snapshot.reservations.length,
        tables: snapshot.totalTables,
      };
    }

    return {
      status: "success",
      mode: "inspect",
      message:
        "Live inspection succeeded. NightOS reached the operational source and refreshed the current snapshot.",
      connected: true,
      weekLabel: snapshot.weekLabel,
      reservations: snapshot.reservations.length,
      tables: snapshot.totalTables,
      syncedAt: snapshot.fetchedAt ?? undefined,
    };
  }

  if (!isSupabaseConfigured() || !hasServiceRoleKey()) {
    return {
      status: "error",
      mode: "persist",
      message:
        "Supabase persistence is not ready in this environment yet. Add the public URL, anon key, and service role key first.",
    };
  }

  try {
    const result = await syncReservationSourceIntoSupabase(weekOffset);

    return {
      status: "success",
      mode: "persist",
      message:
        "Reservation source sync completed and records were pushed into Supabase.",
      connected: true,
      weekLabel: undefined,
      reservations: result.totalReservations,
      tables: result.totalTables,
      syncedAt: result.syncedAt,
    };
  } catch (error) {
    return {
      status: "error",
      mode: "persist",
      message:
        error instanceof Error
          ? error.message
          : "NightOS could not persist the reservation source snapshot into Supabase.",
    };
  }
}

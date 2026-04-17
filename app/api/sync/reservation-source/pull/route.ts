import { z } from "zod";
import { getSyncSecret, hasServiceRoleKey, isSupabaseConfigured } from "@/lib/env";
import { getReservationSourceSnapshot } from "@/lib/integrations/reservation-source";
import { syncReservationSourceIntoSupabase } from "@/lib/sync/reservation-source";

const requestSchema = z.object({
  weekOffset: z.number().int().min(-8).max(8).optional().default(0),
  dryRun: z.boolean().optional().default(false),
});

export async function POST(request: Request) {
  const providedSecret = request.headers.get("x-sync-secret");

  try {
    const expectedSecret = getSyncSecret();

    if (providedSecret !== expectedSecret) {
      return Response.json(
        {
          ok: false,
          error: "Invalid sync secret.",
        },
        { status: 401 },
      );
    }
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Reservation sync secret is not configured.",
      },
      { status: 503 },
    );
  }

  const json = await request.json().catch(() => ({}));
  const parsed = requestSchema.safeParse(json);

  if (!parsed.success) {
    return Response.json(
      {
        ok: false,
        error: parsed.error.issues[0]?.message || "Invalid request body.",
      },
      { status: 400 },
    );
  }

  const snapshot = await getReservationSourceSnapshot(parsed.data.weekOffset);

  if (!snapshot.connected) {
    return Response.json(
      {
        ok: false,
        error:
          snapshot.error ||
          "NightOS could not reach the operational reservation source.",
      },
      { status: 503 },
    );
  }

  if (parsed.data.dryRun || !isSupabaseConfigured() || !hasServiceRoleKey()) {
    return Response.json({
      ok: true,
      mode: "dry_run",
      message:
        "Live reservation source read succeeded. Supabase persistence is skipped in dry-run mode or while credentials are incomplete.",
      summary: {
        source: snapshot.sourceName,
        fetched_at: snapshot.fetchedAt,
        reservations: snapshot.reservations.length,
        tables: snapshot.tableInventory.length,
        nights: snapshot.nights.map((night) => ({
          date_id: night.dateId,
          reservations: night.slots.length,
          estimated_revenue: night.estimatedRevenue,
        })),
      },
    });
  }

  const result = await syncReservationSourceIntoSupabase(parsed.data.weekOffset);

  return Response.json({
    ok: true,
    mode: "persisted",
    summary: result,
  });
}

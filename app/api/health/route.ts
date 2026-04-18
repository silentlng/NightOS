import { NextResponse } from "next/server";
import {
  getEnvironmentReadiness,
  getReservationSourceName,
  isReservationSourceConfigured,
  isSupabaseConfigured,
} from "@/lib/env";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function GET() {
  const readiness = getEnvironmentReadiness();
  const publicAuthReady = isSupabaseConfigured();
  const warehouseReady = publicAuthReady && readiness.supabaseServiceRole;
  const syncEndpointReady =
    warehouseReady &&
    readiness.syncSharedSecret &&
    readiness.reservationSourceConfigured &&
    readiness.reservationSourceApproved;

  return NextResponse.json(
    {
      ok: true,
      timestamp: new Date().toISOString(),
      product: {
        name: siteConfig.name,
        codename: siteConfig.codename,
      },
      status: syncEndpointReady
        ? "production_ready"
        : publicAuthReady
          ? "staged"
          : "preview_only",
      environment: {
        accessMode: publicAuthReady ? "auth_ready" : "preview_only",
        sourceName: getReservationSourceName(),
        sourceConfigured: isReservationSourceConfigured(),
        sourceApproved: readiness.reservationSourceApproved,
        publicAuthReady,
        warehouseReady,
        syncEndpointReady,
      },
      readiness,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

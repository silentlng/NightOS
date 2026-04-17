import { ReservationsPage } from "@/components/workspace-pages/reservations-page";
import { getAuthenticatedAccess } from "@/lib/auth/access";

export default async function AppReservationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const access = await getAuthenticatedAccess();

  return (
    <ReservationsPage
      access={access}
      basePath="/app"
      filters={{
        day: typeof params.day === "string" ? params.day : undefined,
        syncState:
          typeof params.syncState === "string" ? params.syncState : undefined,
        source: typeof params.source === "string" ? params.source : undefined,
        selected:
          typeof params.selected === "string" ? params.selected : undefined,
      }}
    />
  );
}

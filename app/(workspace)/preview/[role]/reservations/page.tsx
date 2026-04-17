import { ReservationsPage } from "@/components/workspace-pages/reservations-page";
import { getPreviewAccess } from "@/lib/auth/access";

export default async function PreviewReservationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ role: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { role } = await params;
  const parsedSearchParams = await searchParams;

  return (
    <ReservationsPage
      access={getPreviewAccess(role)}
      basePath={`/preview/${role}`}
      filters={{
        day:
          typeof parsedSearchParams.day === "string"
            ? parsedSearchParams.day
            : undefined,
        syncState:
          typeof parsedSearchParams.syncState === "string"
            ? parsedSearchParams.syncState
            : undefined,
        source:
          typeof parsedSearchParams.source === "string"
            ? parsedSearchParams.source
            : undefined,
        selected:
          typeof parsedSearchParams.selected === "string"
            ? parsedSearchParams.selected
            : undefined,
      }}
    />
  );
}

import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { EmptyState } from "@/components/empty-state";
import { SectionCard } from "@/components/section-card";
import { StatusPill } from "@/components/status-pill";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { getWorkspaceInsights } from "@/lib/workspace-data";
import type { AppAccess } from "@/types/app";

export async function ReservationsPage({
  access,
  filters,
  basePath,
}: {
  access: AppAccess;
  filters: {
    day?: string;
    syncState?: string;
    source?: string;
    selected?: string;
  };
  basePath: string;
}) {
  const data = await getWorkspaceInsights(access);
  const filteredReservations = data.reservationsInScope.filter((reservation) => {
    if (filters.day && reservation.dateId !== filters.day) {
      return false;
    }

    if (filters.syncState && filters.syncState !== "in_sync") {
      return false;
    }

    if (filters.source && reservation.externalSource !== filters.source) {
      return false;
    }

    return true;
  });

  const selectedReservation =
    filteredReservations.find(
      (reservation) => reservation.externalBookingId === filters.selected,
    ) || filteredReservations[0];

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Reservations"
        title="Operational reservation view with source visibility, sync state, and import-ready booking identifiers."
        description="NightOS keeps reservations tied to the operational writer. Each record shows where it came from, whether sync is live, and how it will map into the warehouse."
      />

      <SectionCard
        eyebrow="Filters"
        title="Refine the operational list"
        description="Filters stay honest: source and sync state reflect what NightOS truly knows."
      >
        <form className="grid gap-3 md:grid-cols-4" method="get">
          <Select defaultValue={filters.day || ""} name="day">
            <option value="">All nights</option>
            {data.snapshot.nights.map((night) => (
              <option key={night.dateId} value={night.dateId}>
                {night.weekdayLabel} {night.dateLabel}
              </option>
            ))}
          </Select>
          <Select defaultValue={filters.syncState || ""} name="syncState">
            <option value="">All sync states</option>
            <option value="in_sync">In sync</option>
          </Select>
          <Select defaultValue={filters.source || ""} name="source">
            <option value="">All sources</option>
            <option value="cova_club_reservation_site">
              Cova Club reservation site
            </option>
          </Select>
          <Button type="submit">Apply filters</Button>
        </form>
      </SectionCard>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <SectionCard
          eyebrow="Reservation Feed"
          title="Live source records"
          description="These rows are derived from the current source snapshot. They are not invented placeholders."
        >
          {filteredReservations.length > 0 ? (
            <div className="space-y-3">
              {filteredReservations.map((reservation) => (
                <Link
                  className={`surface-muted block p-4 transition ${
                    selectedReservation?.externalBookingId ===
                    reservation.externalBookingId
                      ? "border-accent/30 bg-accent/8"
                      : ""
                  }`}
                  href={`${basePath}/reservations?day=${filters.day || ""}&syncState=${
                    filters.syncState || ""
                  }&source=${filters.source || ""}&selected=${
                    reservation.externalBookingId
                  }`}
                  key={reservation.externalBookingId}
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium">{reservation.slotLabel}</p>
                        <StatusPill label="In sync" tone="success" />
                        <StatusPill label={reservation.slotType} tone="neutral" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {reservation.weekdayLabel} {reservation.dateLabel}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Source label: {reservation.sourceLabel || "Unspecified in source"}
                      </p>
                    </div>
                    <div className="space-y-2 text-sm md:text-right">
                      <p className="text-muted-foreground">
                        External booking ID: {reservation.externalBookingId}
                      </p>
                      <p className="font-medium">
                        {formatCurrency(reservation.spendEstimate)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No reservations match the current filters"
              description="Either the live reservation source returned no occupied tables for this week, or the current filter scope removes every result."
            />
          )}
        </SectionCard>

        <SectionCard
          eyebrow="Detail Panel"
          title="Reservation detail"
          description="The detail panel shows sync-aware fields NightOS can already trust."
        >
          {selectedReservation ? (
            <div className="space-y-3">
              <div className="surface-muted p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  External source
                </p>
                <p className="mt-2 text-sm">{selectedReservation.externalSource}</p>
              </div>
              <div className="surface-muted p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  External booking ID
                </p>
                <p className="mt-2 text-sm">
                  {selectedReservation.externalBookingId}
                </p>
              </div>
              <div className="surface-muted p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Source event
                </p>
                <p className="mt-2 text-sm">{selectedReservation.sourceEventId}</p>
              </div>
              <div className="surface-muted p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Last live read
                </p>
                <p className="mt-2 text-sm">
                  {formatDateTime(data.snapshot.fetchedAt)}
                </p>
              </div>
              <div className="surface-muted p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Operational note
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  The current source does not expose a verified client identity for this booking. NightOS stores the live source label separately until richer data is available.
                </p>
              </div>
            </div>
          ) : (
            <EmptyState
              title="No reservation selected"
              description="Select a live reservation row to inspect source and sync metadata."
            />
          )}
        </SectionCard>
      </div>
    </div>
  );
}

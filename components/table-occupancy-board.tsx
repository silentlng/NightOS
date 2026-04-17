import { cn, formatCurrency } from "@/lib/utils";
import type { ReservationSourceNight } from "@/lib/integrations/reservation-source";

export function TableOccupancyBoard({
  inventory,
  selectedNight,
}: {
  inventory: string[];
  selectedNight?: ReservationSourceNight;
}) {
  if (!selectedNight) {
    return null;
  }

  const occupiedBySlotId = new Map(
    selectedNight.slots
      .filter((slot) => slot.slotType === "table")
      .map((slot) => [slot.slotId, slot]),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">
            {selectedNight.weekdayLabel} {selectedNight.dateLabel}
          </p>
          <p className="text-sm text-muted-foreground">
            Table plan board based on the live reservation source.
          </p>
        </div>
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
          {selectedNight.standardReservations}/{inventory.length || 0} standard tables occupied
        </p>
      </div>

      {inventory.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {inventory.map((tableId) => {
            const reservation = occupiedBySlotId.get(tableId);
            const occupied = Boolean(reservation);

            return (
              <div
                className={cn(
                  "surface-muted space-y-3 p-4 transition",
                  occupied
                    ? "border-accent/30 bg-accent/[0.08]"
                    : "border-white/7 bg-white/[0.02]",
                )}
                key={tableId}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-foreground">Table {tableId}</p>
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.2em]",
                      occupied
                        ? "border border-success/30 bg-success/10 text-success"
                        : "border border-white/10 bg-white/[0.03] text-muted-foreground",
                    )}
                  >
                    {occupied ? "Occupied" : "Open"}
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Source label
                  </p>
                  <p className="text-sm text-foreground">
                    {reservation?.sourceLabel || "No live booking label"}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Spend estimate
                  </p>
                  <p className="text-sm text-foreground">
                    {formatCurrency(reservation?.spendEstimate ?? null)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="surface-muted p-5 text-sm leading-6 text-muted-foreground">
          Table inventory becomes available once the source layout has been detected.
        </div>
      )}
    </div>
  );
}

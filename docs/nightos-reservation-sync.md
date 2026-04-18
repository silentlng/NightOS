# NightOS Reservation Sync

## Source of truth

The reservation site remains the operational writer.

NightOS reads from it and turns that input into:

- operational reservation visibility
- sync-aware reservations
- RP performance structure
- CRM readiness signals
- direction and manager decision support

## Current technical state

NightOS has a working **inspection path** for the reservation source when these variables are present:

- `COVA_RESERVATION_SOURCE_URL`
- `COVA_RESERVATION_SOURCE_PIN`

That inspection path is useful for:

- validating structure
- reading a week window
- checking table inventory
- verifying whether the writer is reachable

It must **not** be treated as an approved production sync until:

- the data contract is validated
- the business owner approves the writer-to-reader relationship
- `NIGHTOS_RESERVATION_SOURCE_APPROVED=true`

## What the source currently exposes in a useful way

- date-scoped occupied slots
- table identifiers
- supplemental slot identifiers
- a free-text source label
- price or spend strings

## What the source does not yet expose cleanly enough

- verified client identity
- structured phone and email fields
- preferences
- explicit RP foreign keys
- stable lifecycle states such as created, updated, cancelled, seated

## What NightOS already does with the source

- reads selected week windows
- maps slots into sync-aware reservation structures
- stores source-oriented fields such as `external_booking_id`, `external_source`, `source_event_id`, and `last_synced_at`
- scopes RP visibility from source labels and alias mappings
- keeps CRM intentionally empty when identity data is not trustworthy
- blocks persistence until Supabase is ready and production approval is explicit

## Recommended production sync flow

1. The reservation site writes bookings, table state, status changes, and client identity.
2. NightOS calls `POST /api/sync/reservation-source/pull`.
3. NightOS upserts events, reservations, and table inventory into Supabase.
4. CRM, analytics, alerts, and management reporting read from Supabase.

Required protected header:

- `x-sync-secret`

## Approval rule

Use the source readiness check freely for technical validation.

Do not approve persistence or operational reliance until:

- the reservation writer exposes the required contract fields
- cancellation and update behavior are understood
- role scoping is validated
- ownership and approval are explicit

## Honest limitations

- RP performance still depends on the quality of writer-side labels.
- VIP CRM should remain empty until real client identity fields are available.
- Historical trend quality depends on scheduled sync execution after Supabase setup.
- Deletion reconciliation and full lifecycle traceability are still a next-phase hardening task.

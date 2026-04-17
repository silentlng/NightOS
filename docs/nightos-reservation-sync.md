# NightOS Reservation Sync

## Source of truth

The reservation site remains the operational writer.

NightOS reads from it and transforms the result into:

- operational reservation visibility
- warehouse-ready reservations
- RP performance structure
- CRM readiness signals

## Current live integration

NightOS now connects to:

- `https://cova-club-resa-production.up.railway.app/`

The source currently works with:

- PIN-gated access
- Socket.IO live reads
- occupancy labels
- price values

## Current payload reality

What the source currently exposes in a useful way:

- date-scoped occupied slots
- table identifiers
- supplemental slot identifiers
- a free-text label
- a price string

What it does **not** expose cleanly yet:

- verified client identity
- structured customer contact data
- preferences
- explicit RP foreign keys

## What NightOS does with it

- reads live week snapshots through Socket.IO
- maps slots to `external_booking_id`
- stores source fields for sync-aware visibility
- keeps CRM empty instead of inventing clients
- can scope RP views through dedicated `rp_profiles.source_labels` aliases instead of relying only on viewer names
- lets operators move week by week through the live source window in the product UI
- exposes a manual live source check and a Supabase persistence trigger in Settings

## Production sync path

Recommended production flow:

1. Reservation site writes its live occupancy.
2. NightOS scheduled job calls `/api/sync/reservation-source/pull`.
3. NightOS upserts events, reservations, and table inventory into Supabase.
4. CRM and analytics read from Supabase.

## Honest limitations

- RP performance is currently derived from the same label the reservation site groups by.
- RP label scoping is more robust with aliases, but it still depends on consistent source-side naming.
- CRM cannot be trusted until a richer client payload exists.
- Historical trend quality depends on recurring sync execution after Supabase setup.

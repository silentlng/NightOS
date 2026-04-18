# NightOS Handbook

## What NightOS is

NightOS is the production-oriented foundation for **Cova Club OS**, a private operating platform for a premium nightclub.

It is not:

- a public reservation site
- a marketing website
- a replacement for the current booking writer

It is:

- the internal management dashboard
- the reservation reading layer
- the RP performance layer
- the VIP CRM operating layer
- the decision-support and audit surface

## Core product rules

- The reservation site remains the operational source of truth.
- NightOS reads and exploits reservation data.
- No fake reservations, fake clients, fake revenues, or fake rankings are generated.
- Empty states stay visible until real synchronized data exists.
- Source inspection is not the same thing as production approval.

## Current application state

NightOS currently includes:

- a premium internal dashboard shell
- protected `/app/*` routes with server-side auth checks
- preview-safe `/preview/*` routes for controlled demos
- Dashboard
- Reservations
- RP Performance
- VIP CRM empty-state architecture
- Analytics
- Settings as an internal control center
- a technical reservation-source inspection path
- a sync route ready for Supabase persistence

## Current stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase-ready auth and data architecture
- Supabase SQL migration with RLS policies
- Vercel-ready deployment structure

## Roles and visibility

- `admin`: full access
- `manager`: business visibility and operations visibility
- `rp`: own reservations, own clients, own relevant performance data

NightOS keeps role protection on the server side. Preview routes exist only for safe demos while production infrastructure is still being connected.

## Reservation source posture

NightOS can inspect the operational reservation source when these variables are set:

- `COVA_RESERVATION_SOURCE_URL`
- `COVA_RESERVATION_SOURCE_PIN`

That path is useful for:

- week-window inspection
- table-inventory discovery
- source availability checks
- validating the writer structure

Production approval still requires:

- a validated writer contract
- approved ownership
- `NIGHTOS_RESERVATION_SOURCE_APPROVED=true`

## What the source currently exposes in a useful way

- date-scoped occupied slots
- table identifiers
- supplemental slot identifiers
- a free-text label
- a price string

## What it does not yet expose cleanly

- verified client identity
- structured customer contact data
- preferences
- explicit RP foreign keys
- durable lifecycle states

## What NightOS already does with the source

- reads selected week windows
- maps slots to sync-aware reservation structures
- stores source-oriented metadata for future lineage and deduplication
- scopes RP views through source-label aliases
- keeps CRM empty instead of inventing clients
- blocks persistence until Supabase is ready and approval is explicit

## Operational sync path

Recommended production flow:

1. The reservation site writes bookings, statuses, and identity data.
2. NightOS calls `POST /api/sync/reservation-source/pull`.
3. NightOS upserts events, reservations, and table inventory into Supabase.
4. CRM and analytics read from Supabase.

Required sync header:

- `x-sync-secret`

## Environment variables

Set these in `.env.local` locally and in Vercel for production:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESERVATION_SYNC_SHARED_SECRET`
- `COVA_RESERVATION_SOURCE_NAME`
- `COVA_RESERVATION_SOURCE_URL`
- `COVA_RESERVATION_SOURCE_PIN`
- `NIGHTOS_RESERVATION_SOURCE_APPROVED`

Important:

- secrets stay out of git
- the service role key never goes to the client
- the reservation source PIN is kept locally and not committed

## Supabase data model

The prepared schema includes:

- `profiles`
- `rp_profiles`
- `clients`
- `tables_club`
- `events`
- `reservations`
- `client_visits`
- `audit_logs`

The migrations are ready in:

- `supabase/migrations/20260417_0001_nightos_schema.sql`
- `supabase/migrations/20260417_0002_rp_source_labels.sql`

It includes:

- role enums
- sync enums
- RLS on protected tables
- `auth.uid()`-based policies
- `WITH CHECK` protections
- role-aware scoping for RP visibility

## Deployment

1. Push the repository to GitHub.
2. Import the repository into Vercel.
3. Add the environment variables.
4. Run the Supabase migrations.
5. Create authenticated users and role rows.
6. Validate the reservation contract.
7. Enable production approval only when the source is genuinely ready.

## Current honest limitations

- The current reservation source inspection path exposes occupancy labels and spend values, not full verified client identities.
- VIP CRM therefore stays intentionally empty for now.
- RP performance is still derived from the same label the reservation site groups by.
- Deletion reconciliation and lifecycle hardening remain later steps.
- Historical analytics quality depends on recurring sync execution after Supabase setup.

## What remains to connect

Still pending before full production readiness:

- a real Supabase project
- authenticated users and role rows in `profiles`
- persistent warehouse sync execution
- explicit production approval of the reservation writer
- richer identity payloads for CRM

## Key repository paths

- [README.md](/Users/lng/Documents/Playground/README.md)
- [docs/nightos-reservation-sync.md](/Users/lng/Documents/Playground/docs/nightos-reservation-sync.md)
- [docs/nightos-reservation-contract.md](/Users/lng/Documents/Playground/docs/nightos-reservation-contract.md)
- [docs/nightos-deployment.md](/Users/lng/Documents/Playground/docs/nightos-deployment.md)
- [docs/nightos-exceptional-roadmap.md](/Users/lng/Documents/Playground/docs/nightos-exceptional-roadmap.md)

## GitHub repository

- [github.com/silentlng/NightOS](https://github.com/silentlng/NightOS)

# NightOS Handbook

## What NightOS is

NightOS is the production-oriented foundation for **Cova Club OS**, an internal premium operating dashboard for a high-end nightclub.

It is not:

- a public reservation site
- a marketing website
- a replacement for the current operational booking tool

It is:

- the analytics layer
- the CRM layer
- the RP performance layer
- the operating dashboard
- the future bridge point for a private creative SaaS

## Core product rules

- The reservation site remains the operational source of truth.
- NightOS reads and exploits reservation data.
- No fake reservations, fake clients, fake revenues, or fake rankings are generated.
- Empty states stay visible until real synchronized data exists.

## Current application state

NightOS currently includes:

- a premium internal dashboard shell
- protected `/app/*` routes with server-side auth checks
- preview-safe `/preview/*` routes for demo access
- Dashboard
- Reservations
- RP Performance
- VIP CRM empty-state architecture
- Analytics
- Settings
- a live read-only reservation-source connection path
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

NightOS keeps role protection on the server side. Preview routes exist only for safe demos while infrastructure is still being connected.

## Reservation source connection

NightOS is wired to read the operational reservation source in live mode through Socket.IO.

Current live source:

- `https://cova-club-resa-production.up.railway.app/`

Current source behavior:

- PIN-gated access
- Socket.IO live reads
- occupancy labels
- spend or price fields

What the source currently exposes in a useful way:

- date-scoped occupied slots
- table identifiers
- supplemental slot identifiers
- a free-text label
- a price string

What it does not yet expose cleanly:

- verified client identity
- structured customer contact data
- preferences
- explicit RP foreign keys

## What NightOS already does with the source

- reads live week snapshots through Socket.IO
- maps slots to `external_booking_id`
- stores source fields for sync-aware visibility
- keeps CRM empty instead of inventing clients

## Operational sync path

Recommended production flow:

1. The reservation site writes live occupancy.
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

The migration is ready in:

- `supabase/migrations/20260417_0001_nightos_schema.sql`

It includes:

- role enums
- sync enums
- RLS on protected tables
- `auth.uid()`-based policies
- `WITH CHECK` protections
- role-aware scoping for RP visibility

## Deployment

Deployment target:

- Vercel

Deployment flow:

1. Push the repository to GitHub.
2. Import the repository into Vercel.
3. Add the environment variables.
4. Run the Supabase migration.
5. Trigger the sync route after credentials are ready.

## Current honest limitations

- The current reservation source exposes occupancy labels and spend values, not full verified client identities.
- VIP CRM therefore stays intentionally empty for now.
- RP performance is currently derived from the same label the reservation site groups by.
- Deletion reconciliation in the sync pipeline is not complete yet.
- Historical analytics quality depends on recurring sync execution after Supabase setup.

## What remains to connect

Still pending before full production readiness:

- real Supabase project credentials
- authenticated users and role rows in `profiles`
- persistent warehouse sync execution
- Vercel project connection and production environment setup

## Key repository paths

- `README.md`
- `docs/nightos-reservation-sync.md`
- `docs/nightos-deployment.md`
- `supabase/migrations/20260417_0001_nightos_schema.sql`

## GitHub repository

- `https://github.com/silentlng/NightOS`

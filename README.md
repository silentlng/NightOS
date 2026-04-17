# NightOS

NightOS is the production-oriented foundation for **Cova Club OS**, an internal premium operating dashboard for a high-end nightclub.

It is **not**:

- a public reservation site
- a marketing website
- a replacement for the current operational booking tool

It **is**:

- the analytics layer
- the CRM layer
- the RP performance layer
- the operating dashboard
- the future bridge point for a private creative SaaS

## Product rules

- The reservation site remains the operational source of truth.
- NightOS reads and exploits reservation data.
- No fake reservations, fake clients, fake revenues, or fake rankings are generated.
- Empty states stay visible until real synchronized data exists.

## Current stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase-ready auth and data architecture
- Supabase SQL migration with RLS policies
- Vercel-ready deployment structure

## Implemented now

- Premium internal dashboard shell
- Protected `/app/*` routes with server-side auth checks
- Preview-safe `/preview/*` routes for demo access
- Dashboard
- Reservations
- RP Performance
- VIP CRM empty-state architecture
- Analytics
- Settings
- Live read-only connection path to the operational reservation source
- Sync route ready for Supabase persistence

## Reservation source connection

NightOS is wired to read the current source site in live mode through Socket.IO once these env vars are present:

- `COVA_RESERVATION_SOURCE_URL`
- `COVA_RESERVATION_SOURCE_PIN`

Source docs:

- [docs/nightos-reservation-sync.md](/Users/lng/Documents/Playground/docs/nightos-reservation-sync.md)
- [docs/nightos-deployment.md](/Users/lng/Documents/Playground/docs/nightos-deployment.md)
- [docs/nightos-handbook.md](/Users/lng/Documents/Playground/docs/nightos-handbook.md)

## Run locally

Use the project-local Node runtime in this repository or your own installed Node 20+ / 22+.

```bash
cd /Users/lng/Documents/Playground
npm install
npm run dev
```

Open:

- `http://localhost:3000`

## Quality checks

```bash
cd /Users/lng/Documents/Playground
npm run check
npm run build
```

## Supabase

Run:

- [supabase/migrations/20260417_0001_nightos_schema.sql](/Users/lng/Documents/Playground/supabase/migrations/20260417_0001_nightos_schema.sql)

The schema includes:

- `profiles`
- `rp_profiles`
- `clients`
- `tables_club`
- `events`
- `reservations`
- `client_visits`
- `audit_logs`

## Deployment

1. Push to GitHub.
2. Import the repo into Vercel.
3. Add the environment variables from `.env.example`.
4. Run the Supabase migration.
5. Trigger the sync route after credentials are ready.

## Honest limitations

- The current reservation source exposes occupancy labels and spend values, not full verified client identities.
- VIP CRM therefore stays intentionally empty for now.
- Deletion reconciliation in the sync pipeline is not complete yet.

## Legacy files

This repository still contains older local experiments and static assets from the pre-existing workspace. They are preserved rather than deleted, but NightOS itself is the Next.js application under the root `app/`, `components/`, `lib/`, and `supabase/` structure.

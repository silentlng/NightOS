# NightOS

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

## Product rules

- The reservation site remains the operational source of truth.
- NightOS reads, structures, and exploits reservation data.
- NightOS does not invent reservations, clients, revenue, or RP rankings.
- If the writer contract is incomplete, the UI stays honest and premium instead of fabricating business activity.
- Source inspection does not equal production approval.

## Current stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase-ready auth and data architecture
- Supabase SQL migrations with RLS policies
- Vercel-ready deployment structure

## Implemented now

- Premium internal dashboard shell
- Protected `/app/*` routes with server-side auth checks
- Proxy-based Supabase session refresh on protected app routes
- Preview-safe `/preview/*` routes for controlled demos
- Dashboard
- Reservations
- RP Performance
- VIP CRM empty-state and enrichment structure
- Analytics
- Settings as a real internal control center
- Reservation source inspection path
- Sync route prepared for Supabase persistence
- Role-aware RP label scoping
- Approval gate for production reservation sync

## Reservation source posture

NightOS can inspect the reservation source when these environment variables are present:

- `COVA_RESERVATION_SOURCE_URL`
- `COVA_RESERVATION_SOURCE_PIN`

NightOS treats that as a **technical inspection path**, not an approved production feed.

Production posture stays staged until:

- the reservation contract is validated
- ownership is clear
- `NIGHTOS_RESERVATION_SOURCE_APPROVED=true`

Core modules support week-by-week inspection with `?week=<offset>`, which lets operators inspect another operational window without inventing activity when the current week is empty.

Source docs:

- [docs/nightos-reservation-sync.md](/Users/lng/Documents/Playground/docs/nightos-reservation-sync.md)
- [docs/nightos-reservation-contract.md](/Users/lng/Documents/Playground/docs/nightos-reservation-contract.md)
- [docs/nightos-deployment.md](/Users/lng/Documents/Playground/docs/nightos-deployment.md)
- [docs/nightos-exceptional-roadmap.md](/Users/lng/Documents/Playground/docs/nightos-exceptional-roadmap.md)
- [docs/nightos-handbook.md](/Users/lng/Documents/Playground/docs/nightos-handbook.md)

## Run locally

Use the project-local Node runtime in this repository or your own installed Node runtime that matches `.nvmrc`.

```bash
cd /Users/lng/Documents/Playground
npm install
npm run dev
```

Open:

- `http://localhost:3000`

Validated locally with:

- Node `24.15.0`
- npm `11.12.1`

## Quality checks

```bash
cd /Users/lng/Documents/Playground
npm run check
npm run build
```

## Supabase

Run:

- [supabase/migrations/20260417_0001_nightos_schema.sql](/Users/lng/Documents/Playground/supabase/migrations/20260417_0001_nightos_schema.sql)
- [supabase/migrations/20260417_0002_rp_source_labels.sql](/Users/lng/Documents/Playground/supabase/migrations/20260417_0002_rp_source_labels.sql)

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
4. Run the Supabase migrations.
5. Create users and role rows in `profiles` and `rp_profiles`.
6. Validate the reservation contract.
7. Set `NIGHTOS_RESERVATION_SOURCE_APPROVED=true` only when the source is approved for production use.
8. Trigger the sync route after credentials and approval are ready.

## Honest limitations

- The current reservation source inspection path exposes occupancy labels and spend values, not full verified client identities.
- VIP CRM therefore stays intentionally strict until richer identity data exists.
- Booking lifecycle status, durable updated timestamps, and cancellation reconciliation still need a stronger writer contract.
- Historical automation still depends on Supabase plus scheduled execution.
- Production auth rollout still needs a real Supabase project, invited users, and role provisioning.
- When Supabase Auth or role provisioning is missing, protected routes intentionally redirect to `/auth/setup-required` instead of pretending access is ready.

## Legacy files

This repository still contains older local experiments and static assets from the pre-existing workspace. They are preserved rather than deleted, but NightOS itself is the Next.js application under the root `app/`, `components/`, `lib/`, and `supabase/` structure.

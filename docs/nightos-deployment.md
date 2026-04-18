# NightOS Deployment

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth + PostgreSQL
- Vercel deployment target

## Environment variables

Set these in `.env.local` for local development and in Vercel for production:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESERVATION_SYNC_SHARED_SECRET`
- `COVA_RESERVATION_SOURCE_NAME`
- `COVA_RESERVATION_SOURCE_URL`
- `COVA_RESERVATION_SOURCE_PIN`
- `NIGHTOS_RESERVATION_SOURCE_APPROVED`

## Supabase setup

1. Create a Supabase project.
2. Run the migrations in `supabase/migrations/20260417_0001_nightos_schema.sql` and `supabase/migrations/20260417_0002_rp_source_labels.sql`.
3. Create initial users in Supabase Auth.
4. Insert matching rows into `profiles` and `rp_profiles`.
5. Configure all environment variables locally and in Vercel.

## Reservation source posture

NightOS includes a technical inspection path for the reservation source:

- source inspection logic: `lib/integrations/reservation-source.ts`
- sync route: `POST /api/sync/reservation-source/pull`
- required protected header: `x-sync-secret`

Important:

- technical inspection is not the same as approved production sync
- keep `NIGHTOS_RESERVATION_SOURCE_APPROVED=false` until the writer contract is validated
- do not allow persistent ingestion until ownership and lifecycle behavior are clear

Example dry run:

```bash
curl -X POST http://localhost:3000/api/sync/reservation-source/pull \
  -H "Content-Type: application/json" \
  -H "x-sync-secret: YOUR_SECRET" \
  -d '{"dryRun": true}'
```

## Vercel

1. Import the GitHub repository in Vercel.
2. Set the environment variables above.
3. Deploy.
4. Keep the source approval flag off during technical validation.
5. Turn the approval flag on only after contract validation and a successful end-to-end persistence test.

## Known limitations

- The current reservation source inspection path exposes occupancy labels and price fields, not verified client identities.
- VIP CRM therefore stays empty until richer data is synchronized.
- Sync upsert is implemented for current-source snapshots, but deletion reconciliation and full lifecycle hardening are still next-phase work.

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

## Supabase setup

1. Create a Supabase project.
2. Run the migration in `supabase/migrations/20260417_0001_nightos_schema.sql`.
3. Create initial users in Supabase Auth.
4. Insert matching rows into `profiles` and `rp_profiles`.
5. Configure all environment variables locally and in Vercel.

## Reservation source connection

NightOS reads the operational reservation site in live mode via Socket.IO.

- Live read path: `lib/integrations/reservation-source.ts`
- Sync route: `POST /api/sync/reservation-source/pull`
- Required header: `x-sync-secret`

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
4. Trigger the sync route manually or from a scheduled job once Supabase is ready.

## Known limitations

- The current reservation source exposes occupancy labels and price fields, not verified client identities.
- VIP CRM therefore stays empty until richer data is synchronized.
- Sync upsert is implemented for current-source snapshots, but deletion reconciliation is still a later step.

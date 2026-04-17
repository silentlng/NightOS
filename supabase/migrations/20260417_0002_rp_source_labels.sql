alter table public.rp_profiles
add column if not exists source_labels text[] not null default '{}'::text[];

create index if not exists rp_profiles_source_labels_idx
on public.rp_profiles
using gin (source_labels);

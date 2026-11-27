create table if not exists public.springvision_archive_seasons (
  source_season_id uuid primary key,
  season_number integer not null,
  season_title text not null,
  logo_url text,
  description text,
  season_status text not null,
  contest_at timestamptz,
  is_public boolean not null default false,
  archived_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  entry_count integer not null default 0 check (entry_count >= 0),
  participant_count integer not null default 0 check (participant_count >= 0),
  entries jsonb not null default '[]'::jsonb check (jsonb_typeof(entries) = 'array'),
  standings jsonb not null default '[]'::jsonb check (jsonb_typeof(standings) = 'array')
);

create index if not exists springvision_archive_seasons_order_idx
  on public.springvision_archive_seasons (season_number desc);

create index if not exists springvision_archive_seasons_public_idx
  on public.springvision_archive_seasons (is_public, season_number desc);

alter table public.springvision_archive_seasons enable row level security;

revoke all on table public.springvision_archive_seasons from public, anon, authenticated;
grant all on table public.springvision_archive_seasons to service_role;

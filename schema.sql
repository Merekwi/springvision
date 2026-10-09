-- SpringVision starter schema for Supabase/Postgres.
-- Review before applying to a live project. This schema alone does NOT implement Telegram auth.
-- Never place a Supabase service_role key in the frontend.

create extension if not exists pgcrypto;

create type public.app_role as enum ('user', 'admin', 'super_admin');
create type public.season_status as enum ('draft', 'registration', 'moderation', 'drawn', 'jury_voting', 'televoting', 'finished', 'archived');
create type public.submission_status as enum ('pending', 'approved', 'rejected', 'withdrawn');

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  telegram_id bigint unique,
  telegram_username text,
  display_name text not null default 'Участник',
  role public.app_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.seasons (
  id uuid primary key default gen_random_uuid(),
  season_number integer not null unique check (season_number > 0),
  title text not null,
  logo_url text,
  status public.season_status not null default 'draft',
  registration_opens_at timestamptz,
  registration_closes_at timestamptz,
  jury_deadline timestamptz,
  show_starts_at timestamptz,
  televote_minutes integer not null default 60 check (televote_minutes between 1 and 240),
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (registration_opens_at is null or registration_closes_at is null or registration_opens_at < registration_closes_at)
);

create table if not exists public.countries (
  code text primary key,
  name text not null unique,
  flag_emoji text not null default '🏳️',
  enabled boolean not null default true
);

create table if not exists public.season_countries (
  season_id uuid not null references public.seasons(id) on delete cascade,
  country_code text not null references public.countries(code),
  enabled boolean not null default true,
  primary key (season_id, country_code)
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.seasons(id) on delete cascade,
  user_id uuid not null references public.profiles(id),
  country_code text not null references public.countries(code),
  artist text not null check (char_length(artist) between 1 and 120),
  song_title text not null check (char_length(song_title) between 1 and 160),
  performance_url text not null,
  recap_storage_path text,
  status public.submission_status not null default 'pending',
  moderation_comment text,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  performance_order integer check (performance_order is null or performance_order > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (season_id, country_code),
  unique (season_id, performance_order)
);

create table if not exists public.season_jury (
  season_id uuid not null references public.seasons(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  submission_id uuid references public.submissions(id) on delete set null,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  primary key (season_id, user_id)
);

create table if not exists public.jury_votes (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.seasons(id) on delete cascade,
  juror_id uuid not null references public.profiles(id) on delete cascade,
  target_submission_id uuid not null references public.submissions(id) on delete cascade,
  points integer not null check (points in (1,2,3,4,5,6,7,8,10,12)),
  is_random_fallback boolean not null default false,
  created_at timestamptz not null default now(),
  unique (season_id, juror_id, points),
  unique (season_id, juror_id, target_submission_id)
);

create table if not exists public.televote_ballots (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.seasons(id) on delete cascade,
  voter_id uuid not null references public.profiles(id) on delete cascade,
  submitted_at timestamptz not null default now(),
  unique (season_id, voter_id)
);

create table if not exists public.televote_points (
  ballot_id uuid not null references public.televote_ballots(id) on delete cascade,
  target_submission_id uuid not null references public.submissions(id) on delete cascade,
  points integer not null check (points in (1,2,3,4,5,6,7,8,10,12)),
  primary key (ballot_id, target_submission_id),
  unique (ballot_id, points)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  season_id uuid references public.seasons(id) on delete set null,
  created_by uuid references public.profiles(id),
  audience text not null check (audience in ('all', 'participants', 'jury', 'unvoted_jury', 'specific_users')),
  title text not null check (char_length(title) between 1 and 120),
  message text not null check (char_length(message) between 1 and 4000),
  created_at timestamptz not null default now()
);

create table if not exists public.notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  notification_id uuid not null references public.notifications(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'queued' check (status in ('queued', 'sent', 'failed', 'blocked')),
  error_text text,
  attempted_at timestamptz,
  unique (notification_id, user_id)
);

create table if not exists public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles(id),
  action text not null,
  entity_type text not null,
  entity_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Country uniqueness is protected by UNIQUE(season_id, country_code), so concurrent
-- submissions cannot reserve the same country twice. Backend/RLS must additionally
-- verify that the season is accepting submissions and that the caller owns the row.
-- Do not enable production access until Telegram initData is validated server-side,
-- policies are reviewed, and RPC/Edge Functions enforce jury eligibility and voting rules.

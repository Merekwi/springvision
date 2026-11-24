
create table if not exists public.submission_edit_tokens (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique check (token_hash ~ '^[a-f0-9]{64}$'),
  submission_id uuid not null unique references public.submissions(id) on delete cascade,
  season_id uuid not null references public.seasons(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  original_artist text not null,
  original_song_title text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  disqualified_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists submission_edit_tokens_expiry_idx
  on public.submission_edit_tokens(expires_at)
  where used_at is null;

alter table public.submission_edit_tokens enable row level security;
revoke all on table public.submission_edit_tokens from anon, authenticated;
grant all on table public.submission_edit_tokens to service_role;

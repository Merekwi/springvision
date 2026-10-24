-- Add publication gates for final media to already initialized databases.
alter table public.seasons
  add column if not exists twitch_published boolean not null default false,
  add column if not exists recording_published boolean not null default false;

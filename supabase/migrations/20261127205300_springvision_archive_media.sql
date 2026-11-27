alter table public.springvision_archive_seasons
  add column if not exists recording_storage_path text,
  add column if not exists combined_recap_storage_path text,
  add column if not exists twitch_url text,
  add column if not exists twitch_published boolean not null default false,
  add column if not exists recording_published boolean not null default false;

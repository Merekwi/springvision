create table if not exists public.telegram_bot_updates (
  update_id bigint primary key,
  received_at timestamptz not null default now()
);

alter table public.telegram_bot_updates enable row level security;

revoke all on table public.telegram_bot_updates from anon, authenticated;
grant all on table public.telegram_bot_updates to service_role;

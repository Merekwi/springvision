create table if not exists public.season_country_reservations (
  id uuid primary key default gen_random_uuid(),
  source_season_id uuid not null references public.seasons(id) on delete cascade,
  target_season_id uuid null references public.seasons(id) on delete set null,
  user_id uuid not null references public.profiles(id) on delete cascade,
  country_code text not null references public.countries(code),
  submission_id uuid null references public.submissions(id) on delete set null,
  status text not null default 'reserved'
    check (status in ('reserved', 'submitted', 'expired', 'cancelled')),
  expires_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint season_country_reservations_source_user_key unique (source_season_id, user_id)
);

create unique index if not exists season_country_reservations_one_active_country
  on public.season_country_reservations (country_code)
  where status = 'reserved';

create unique index if not exists season_country_reservations_one_active_user
  on public.season_country_reservations (user_id)
  where status = 'reserved';

create index if not exists season_country_reservations_target_status_idx
  on public.season_country_reservations (target_season_id, status);

alter table public.season_country_reservations enable row level security;
revoke all on table public.season_country_reservations from anon, authenticated;
grant all on table public.season_country_reservations to service_role;

create or replace function public.springvision_attach_country_reservations_to_new_season()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  update public.season_country_reservations r
     set target_season_id = new.id,
         expires_at = case
           when new.registration_closes_at is not null
             then new.registration_closes_at - interval '24 hours'
           else null
         end,
         status = case
           when new.status not in ('draft', 'registration') then 'expired'
           when new.registration_closes_at is not null
             and new.registration_closes_at - interval '24 hours' <= now() then 'expired'
           else 'reserved'
         end,
         updated_at = now()
    from public.seasons source
   where source.id = r.source_season_id
     and r.status = 'reserved'
     and r.target_season_id is null
     and source.season_number < new.season_number
     and not exists (
       select 1 from public.seasons earlier
        where earlier.season_number > source.season_number
          and earlier.season_number < new.season_number
     );
  return new;
end;
$$;

drop trigger if exists springvision_attach_country_reservations_after_season_insert on public.seasons;
create trigger springvision_attach_country_reservations_after_season_insert
after insert on public.seasons
for each row execute function public.springvision_attach_country_reservations_to_new_season();

create or replace function public.springvision_sync_country_reservation_deadline()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  update public.season_country_reservations
     set expires_at = case
           when new.registration_closes_at is not null
             then new.registration_closes_at - interval '24 hours'
           else null
         end,
         status = case
           when new.status not in ('draft', 'registration') then 'expired'
           when new.registration_closes_at is not null
             and new.registration_closes_at - interval '24 hours' <= now() then 'expired'
           else status
         end,
         updated_at = now()
   where target_season_id = new.id
     and status = 'reserved';
  return new;
end;
$$;

drop trigger if exists springvision_sync_country_reservation_deadline_after_season_update on public.seasons;
create trigger springvision_sync_country_reservation_deadline_after_season_update
after update of registration_closes_at, status on public.seasons
for each row execute function public.springvision_sync_country_reservation_deadline();

revoke all on function public.springvision_attach_country_reservations_to_new_season() from public, anon, authenticated;
revoke all on function public.springvision_sync_country_reservation_deadline() from public, anon, authenticated;

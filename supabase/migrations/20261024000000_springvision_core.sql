-- SpringVision core schema. Browser access is closed; Telegram-verified Edge Functions use service_role.
-- Never place a bot token or service_role key in public frontend files.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
 id uuid primary key default gen_random_uuid(),
 telegram_id bigint not null unique,
 telegram_username text,
 display_name text not null default 'Участник',
 role text not null default 'user' check (role in ('user','admin','super_admin')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table if not exists public.seasons (
 id uuid primary key default gen_random_uuid(),
 season_number integer not null unique check (season_number > 0),
 title text not null check (char_length(title) between 1 and 160),
 logo_url text,
 description text,
 status text not null default 'draft' check (status in ('draft','registration','moderation','drawn','jury_voting','televoting','finished','archived')),
 registration_opens_at timestamptz,
 registration_closes_at timestamptz,
 jury_deadline timestamptz,
 contest_at timestamptz,
 televote_minutes integer not null default 60 check (televote_minutes between 1 and 240),
 participant_list_published boolean not null default false,
 draw_published boolean not null default false,
 jury_voting_open boolean not null default false,
 jury_results_published boolean not null default false,
 televote_open boolean not null default false,
 televote_results_published boolean not null default false,
 overall_results_published boolean not null default false,
 twitch_url text,
 recording_storage_path text,
 combined_recap_storage_path text,
 created_by uuid references public.profiles(id) on delete set null,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 check (registration_opens_at is null or registration_closes_at is null or registration_opens_at < registration_closes_at)
);

create table if not exists public.countries (
 code text primary key check (code = lower(code)),
 name text not null,
 flag_path text not null,
 enabled boolean not null default true
);

insert into public.countries (code,name,flag_path) values
  ('al', 'Албания', 'assets/flags/heart/al.svg'),
  ('ad', 'Андорра', 'assets/flags/heart/ad.svg'),
  ('am', 'Армения', 'assets/flags/heart/am.svg'),
  ('at', 'Австрия', 'assets/flags/heart/at.svg'),
  ('az', 'Азербайджан', 'assets/flags/heart/az.svg'),
  ('by', 'Беларусь', 'assets/flags/heart/by.svg'),
  ('be', 'Бельгия', 'assets/flags/heart/be.svg'),
  ('ba', 'Босния и Герцеговина', 'assets/flags/heart/ba.svg'),
  ('bg', 'Болгария', 'assets/flags/heart/bg.svg'),
  ('hr', 'Хорватия', 'assets/flags/heart/hr.svg'),
  ('cy', 'Кипр', 'assets/flags/heart/cy.svg'),
  ('cz', 'Чехия', 'assets/flags/heart/cz.svg'),
  ('dk', 'Дания', 'assets/flags/heart/dk.svg'),
  ('ee', 'Эстония', 'assets/flags/heart/ee.svg'),
  ('fi', 'Финляндия', 'assets/flags/heart/fi.svg'),
  ('fr', 'Франция', 'assets/flags/heart/fr.svg'),
  ('ge', 'Грузия', 'assets/flags/heart/ge.svg'),
  ('de', 'Германия', 'assets/flags/heart/de.svg'),
  ('gr', 'Греция', 'assets/flags/heart/gr.svg'),
  ('hu', 'Венгрия', 'assets/flags/heart/hu.svg'),
  ('is', 'Исландия', 'assets/flags/heart/is.svg'),
  ('ie', 'Ирландия', 'assets/flags/heart/ie.svg'),
  ('il', 'Израиль', 'assets/flags/heart/il.svg'),
  ('it', 'Италия', 'assets/flags/heart/it.svg'),
  ('kz', 'Казахстан', 'assets/flags/heart/kz.svg'),
  ('xk', 'Косово', 'assets/flags/heart/xk.svg'),
  ('lv', 'Латвия', 'assets/flags/heart/lv.svg'),
  ('lt', 'Литва', 'assets/flags/heart/lt.svg'),
  ('lu', 'Люксембург', 'assets/flags/heart/lu.svg'),
  ('mt', 'Мальта', 'assets/flags/heart/mt.svg'),
  ('md', 'Молдова', 'assets/flags/heart/md.svg'),
  ('mc', 'Монако', 'assets/flags/heart/mc.svg'),
  ('me', 'Черногория', 'assets/flags/heart/me.svg'),
  ('ma', 'Марокко', 'assets/flags/heart/ma.svg'),
  ('nl', 'Нидерланды', 'assets/flags/heart/nl.svg'),
  ('mk', 'Северная Македония', 'assets/flags/heart/mk.svg'),
  ('no', 'Норвегия', 'assets/flags/heart/no.svg'),
  ('pl', 'Польша', 'assets/flags/heart/pl.svg'),
  ('pt', 'Португалия', 'assets/flags/heart/pt.svg'),
  ('ro', 'Румыния', 'assets/flags/heart/ro.svg'),
  ('ru', 'Россия', 'assets/flags/heart/ru.svg'),
  ('sm', 'Сан-Марино', 'assets/flags/heart/sm.svg'),
  ('rs', 'Сербия', 'assets/flags/heart/rs.svg'),
  ('sk', 'Словакия', 'assets/flags/heart/sk.svg'),
  ('si', 'Словения', 'assets/flags/heart/si.svg'),
  ('es', 'Испания', 'assets/flags/heart/es.svg'),
  ('se', 'Швеция', 'assets/flags/heart/se.svg'),
  ('ch', 'Швейцария', 'assets/flags/heart/ch.svg'),
  ('tr', 'Турция', 'assets/flags/heart/tr.svg'),
  ('ua', 'Украина', 'assets/flags/heart/ua.svg'),
  ('gb', 'Великобритания', 'assets/flags/heart/gb.svg'),
  ('us', 'США', 'assets/flags/heart/us.svg'),
  ('ca', 'Канада', 'assets/flags/heart/ca.svg'),
  ('au', 'Австралия', 'assets/flags/heart/au.svg'),
  ('nz', 'Новая Зеландия', 'assets/flags/heart/nz.svg'),
  ('jp', 'Япония', 'assets/flags/heart/jp.svg'),
  ('kr', 'Южная Корея', 'assets/flags/heart/kr.svg'),
  ('cn', 'Китай', 'assets/flags/heart/cn.svg'),
  ('in', 'Индия', 'assets/flags/heart/in.svg'),
  ('br', 'Бразилия', 'assets/flags/heart/br.svg'),
  ('ar', 'Аргентина', 'assets/flags/heart/ar.svg'),
  ('mx', 'Мексика', 'assets/flags/heart/mx.svg'),
  ('cl', 'Чили', 'assets/flags/heart/cl.svg'),
  ('za', 'ЮАР', 'assets/flags/heart/za.svg'),
  ('eg', 'Египет', 'assets/flags/heart/eg.svg'),
  ('tn', 'Тунис', 'assets/flags/heart/tn.svg'),
  ('dz', 'Алжир', 'assets/flags/heart/dz.svg'),
  ('th', 'Таиланд', 'assets/flags/heart/th.svg'),
  ('vn', 'Вьетнам', 'assets/flags/heart/vn.svg'),
  ('id', 'Индонезия', 'assets/flags/heart/id.svg'),
  ('ph', 'Филиппины', 'assets/flags/heart/ph.svg'),
  ('sg', 'Сингапур', 'assets/flags/heart/sg.svg'),
  ('my', 'Малайзия', 'assets/flags/heart/my.svg'),
  ('sa', 'Саудовская Аравия', 'assets/flags/heart/sa.svg'),
  ('ae', 'ОАЭ', 'assets/flags/heart/ae.svg'),
  ('qa', 'Катар', 'assets/flags/heart/qa.svg'),
  ('jo', 'Иордания', 'assets/flags/heart/jo.svg'),
  ('lb', 'Ливан', 'assets/flags/heart/lb.svg'),
  ('pk', 'Пакистан', 'assets/flags/heart/pk.svg'),
  ('bd', 'Бангладеш', 'assets/flags/heart/bd.svg'),
  ('np', 'Непал', 'assets/flags/heart/np.svg'),
  ('lk', 'Шри-Ланка', 'assets/flags/heart/lk.svg'),
  ('ir', 'Иран', 'assets/flags/heart/ir.svg'),
  ('iq', 'Ирак', 'assets/flags/heart/iq.svg'),
  ('af', 'Афганистан', 'assets/flags/heart/af.svg'),
  ('uz', 'Узбекистан', 'assets/flags/heart/uz.svg'),
  ('kg', 'Кыргызстан', 'assets/flags/heart/kg.svg'),
  ('tj', 'Таджикистан', 'assets/flags/heart/tj.svg'),
  ('tm', 'Туркменистан', 'assets/flags/heart/tm.svg'),
  ('mn', 'Монголия', 'assets/flags/heart/mn.svg'),
  ('ke', 'Кения', 'assets/flags/heart/ke.svg'),
  ('ng', 'Нигерия', 'assets/flags/heart/ng.svg'),
  ('gh', 'Гана', 'assets/flags/heart/gh.svg'),
  ('et', 'Эфиопия', 'assets/flags/heart/et.svg'),
  ('tz', 'Танзания', 'assets/flags/heart/tz.svg'),
  ('ug', 'Уганда', 'assets/flags/heart/ug.svg'),
  ('sn', 'Сенегал', 'assets/flags/heart/sn.svg'),
  ('ci', 'Кот-д’Ивуар', 'assets/flags/heart/ci.svg'),
  ('cm', 'Камерун', 'assets/flags/heart/cm.svg'),
  ('cd', 'ДР Конго', 'assets/flags/heart/cd.svg'),
  ('ao', 'Ангола', 'assets/flags/heart/ao.svg'),
  ('mz', 'Мозамбик', 'assets/flags/heart/mz.svg'),
  ('zw', 'Зимбабве', 'assets/flags/heart/zw.svg'),
  ('zm', 'Замбия', 'assets/flags/heart/zm.svg'),
  ('bw', 'Ботсвана', 'assets/flags/heart/bw.svg'),
  ('na', 'Намибия', 'assets/flags/heart/na.svg'),
  ('mg', 'Мадагаскар', 'assets/flags/heart/mg.svg'),
  ('mu', 'Маврикий', 'assets/flags/heart/mu.svg'),
  ('sc', 'Сейшелы', 'assets/flags/heart/sc.svg'),
  ('fj', 'Фиджи', 'assets/flags/heart/fj.svg'),
  ('pg', 'Папуа — Новая Гвинея', 'assets/flags/heart/pg.svg'),
  ('sb', 'Соломоновы Острова', 'assets/flags/heart/sb.svg'),
  ('ws', 'Самоа', 'assets/flags/heart/ws.svg'),
  ('to', 'Тонга', 'assets/flags/heart/to.svg'),
  ('vu', 'Вануату', 'assets/flags/heart/vu.svg'),
  ('pw', 'Палау', 'assets/flags/heart/pw.svg'),
  ('mh', 'Маршалловы Острова', 'assets/flags/heart/mh.svg'),
  ('ki', 'Кирибати', 'assets/flags/heart/ki.svg'),
  ('tv', 'Тувалу', 'assets/flags/heart/tv.svg'),
  ('nr', 'Науру', 'assets/flags/heart/nr.svg'),
  ('mv', 'Мальдивы', 'assets/flags/heart/mv.svg'),
  ('bt', 'Бутан', 'assets/flags/heart/bt.svg'),
  ('bn', 'Бруней', 'assets/flags/heart/bn.svg'),
  ('kh', 'Камбоджа', 'assets/flags/heart/kh.svg'),
  ('la', 'Лаос', 'assets/flags/heart/la.svg'),
  ('mm', 'Мьянма', 'assets/flags/heart/mm.svg'),
  ('tl', 'Восточный Тимор', 'assets/flags/heart/tl.svg'),
  ('bo', 'Боливия', 'assets/flags/heart/bo.svg'),
  ('pe', 'Перу', 'assets/flags/heart/pe.svg'),
  ('ec', 'Эквадор', 'assets/flags/heart/ec.svg'),
  ('co', 'Колумбия', 'assets/flags/heart/co.svg'),
  ('ve', 'Венесуэла', 'assets/flags/heart/ve.svg'),
  ('uy', 'Уругвай', 'assets/flags/heart/uy.svg'),
  ('py', 'Парагвай', 'assets/flags/heart/py.svg'),
  ('gy', 'Гайана', 'assets/flags/heart/gy.svg'),
  ('sr', 'Суринам', 'assets/flags/heart/sr.svg'),
  ('cr', 'Коста-Рика', 'assets/flags/heart/cr.svg'),
  ('pa', 'Панама', 'assets/flags/heart/pa.svg'),
  ('gt', 'Гватемала', 'assets/flags/heart/gt.svg'),
  ('bz', 'Белиз', 'assets/flags/heart/bz.svg'),
  ('hn', 'Гондурас', 'assets/flags/heart/hn.svg'),
  ('sv', 'Сальвадор', 'assets/flags/heart/sv.svg'),
  ('ni', 'Никарагуа', 'assets/flags/heart/ni.svg'),
  ('cu', 'Куба', 'assets/flags/heart/cu.svg'),
  ('jm', 'Ямайка', 'assets/flags/heart/jm.svg'),
  ('ht', 'Гаити', 'assets/flags/heart/ht.svg'),
  ('do', 'Доминиканская Республика', 'assets/flags/heart/do.svg'),
  ('bs', 'Багамы', 'assets/flags/heart/bs.svg'),
  ('bb', 'Барбадос', 'assets/flags/heart/bb.svg'),
  ('tt', 'Тринидад и Тобаго', 'assets/flags/heart/tt.svg'),
  ('gd', 'Гренада', 'assets/flags/heart/gd.svg'),
  ('lc', 'Сент-Люсия', 'assets/flags/heart/lc.svg'),
  ('vc', 'Сент-Винсент и Гренадины', 'assets/flags/heart/vc.svg'),
  ('ag', 'Антигуа и Барбуда', 'assets/flags/heart/ag.svg'),
  ('dm', 'Доминика', 'assets/flags/heart/dm.svg'),
  ('kn', 'Сент-Китс и Невис', 'assets/flags/heart/kn.svg')
on conflict (code) do update set name=excluded.name, flag_path=excluded.flag_path;

create table if not exists public.submissions (
 id uuid primary key default gen_random_uuid(),
 season_id uuid not null references public.seasons(id) on delete cascade,
 user_id uuid not null references public.profiles(id) on delete cascade,
 country_code text not null references public.countries(code),
 artist text not null check (char_length(artist) between 1 and 120),
 song_title text not null check (char_length(song_title) between 1 and 160),
 performance_url text not null check (performance_url ~ '^https?://'),
 recap_storage_path text,
 status text not null default 'pending' check (status in ('pending','approved','rejected','withdrawn')),
 moderation_comment text,
 reviewed_by uuid references public.profiles(id) on delete set null,
 reviewed_at timestamptz,
 performance_order integer check (performance_order is null or performance_order > 0),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create unique index if not exists submissions_active_country_unique on public.submissions(season_id,country_code) where status in ('pending','approved');
create unique index if not exists submissions_active_user_unique on public.submissions(season_id,user_id) where status in ('pending','approved');
create unique index if not exists submissions_order_unique on public.submissions(season_id,performance_order) where performance_order is not null;

create table if not exists public.season_jury (
 season_id uuid not null references public.seasons(id) on delete cascade,
 user_id uuid not null references public.profiles(id) on delete cascade,
 submission_id uuid references public.submissions(id) on delete set null,
 granted_at timestamptz not null default now(),
 revoked_at timestamptz,
 primary key (season_id,user_id)
);

create table if not exists public.jury_votes (
 id uuid primary key default gen_random_uuid(),
 season_id uuid not null references public.seasons(id) on delete cascade,
 juror_id uuid not null references public.profiles(id) on delete cascade,
 target_submission_id uuid not null references public.submissions(id) on delete cascade,
 points integer not null check (points in (1,2,3,4,5,6,7,8,10,12)),
 is_random_fallback boolean not null default false,
 created_at timestamptz not null default now(),
 unique (season_id,juror_id,points),
 unique (season_id,juror_id,target_submission_id)
);

create table if not exists public.televote_ballots (
 id uuid primary key default gen_random_uuid(),
 season_id uuid not null references public.seasons(id) on delete cascade,
 voter_id uuid not null references public.profiles(id) on delete cascade,
 submitted_at timestamptz not null default now(),
 unique (season_id,voter_id)
);

create table if not exists public.televote_points (
 ballot_id uuid not null references public.televote_ballots(id) on delete cascade,
 target_submission_id uuid not null references public.submissions(id) on delete cascade,
 points integer not null check (points in (1,2,3,4,5,6,7,8,10,12)),
 primary key (ballot_id,target_submission_id),
 unique (ballot_id,points)
);

create table if not exists public.notifications (
 id uuid primary key default gen_random_uuid(),
 season_id uuid references public.seasons(id) on delete set null,
 created_by uuid references public.profiles(id) on delete set null,
 audience text not null check (audience in ('all','participants','jury','unvoted_jury','specific_users')),
 title text not null check (char_length(title) between 1 and 120),
 message text not null check (char_length(message) between 1 and 4000),
 created_at timestamptz not null default now()
);

create table if not exists public.notification_deliveries (
 id uuid primary key default gen_random_uuid(),
 notification_id uuid not null references public.notifications(id) on delete cascade,
 user_id uuid not null references public.profiles(id) on delete cascade,
 status text not null default 'queued' check (status in ('queued','sent','failed','blocked')),
 error_text text,
 attempted_at timestamptz,
 unique (notification_id,user_id)
);

create table if not exists public.audit_log (
 id bigint generated always as identity primary key,
 actor_id uuid references public.profiles(id) on delete set null,
 action text not null,
 entity_type text not null,
 entity_id text,
 details jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at=now(); return new; end;
$$;
drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists seasons_set_updated_at on public.seasons;
create trigger seasons_set_updated_at before update on public.seasons for each row execute function public.set_updated_at();
drop trigger if exists submissions_set_updated_at on public.submissions;
create trigger submissions_set_updated_at before update on public.submissions for each row execute function public.set_updated_at();

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('springvision-private','springvision-private',false,52428800,array['video/mp4','video/webm','video/quicktime','image/png','image/jpeg'])
on conflict (id) do update set public=false,file_size_limit=52428800,allowed_mime_types=excluded.allowed_mime_types;

do $$
declare t text;
begin
 foreach t in array array['profiles','seasons','countries','submissions','season_jury','jury_votes','televote_ballots','televote_points','notifications','notification_deliveries','audit_log']
 loop execute format('alter table public.%I enable row level security',t); end loop;
end $$;

revoke all on all tables in schema public from anon,authenticated;
grant select on public.countries to anon,authenticated;
drop policy if exists countries_read_enabled on public.countries;
create policy countries_read_enabled on public.countries for select to anon,authenticated using (enabled=true);

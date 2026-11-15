-- ==========================================================================
-- Pulse Label — schéma Supabase
-- À exécuter UNE FOIS dans Supabase > SQL Editor > New query > Run.
-- Crée : table attractions (vos Pulse Score Attraction), table ratings (notes
-- visiteurs), vue attractions_public (lue par le site), fonction submit_rating,
-- règles de sécurité (RLS) et bucket photos.
-- ==========================================================================

create extension if not exists pgcrypto;

-- ── 1. Attractions : c'est la table que VOUS alimentez ──────────────────────
create table if not exists public.attractions (
  id             uuid primary key default gen_random_uuid(),
  slug           text unique not null,                 -- ex. 'toutatis'
  name           text not null,                        -- nom de l'attraction
  park           text not null,                        -- nom du parc
  city           text,
  country        text not null,
  region         text not null check (region in
                   ('europe','amerique-nord','amerique-latine','asie','moyen-orient','oceanie','afrique')),
  type           text not null check (type in
                   ('rollercoaster','darkride','simulateur','waterride','flatride','spectacle')),
  model          text,                                 -- modèle / système
  manufacturer   text,                                 -- constructeur
  year           int  check (year between 1850 and 2100),
  official_score numeric(3,1) not null check (official_score between 0 and 20),  -- Pulse Score Attraction, sur 20
  evaluated_on   date,                                 -- date de l'évaluation (affichée sur la fiche)
  disclosure     text,                                 -- ex. 'Visite à l''invitation du parc' (affiché si rempli)
  photo_url      text,                                 -- URL publique de la photo
  photo_credit   text,                                 -- crédit photo affiché
  published      boolean not null default true,        -- false = masquée (notes conservées) ; supprimer la ligne = retrait définitif, notes effacées
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ── 2. Notes des visiteurs : une note par visiteur et par attraction ────────
create table if not exists public.ratings (
  id             bigint generated always as identity primary key,
  attraction_id  uuid not null references public.attractions(id) on delete cascade,
  visitor_id     uuid not null,                        -- identifiant anonyme du navigateur
  score          smallint not null check (score between 0 and 20),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (attraction_id, visitor_id)
);
create index if not exists ratings_attraction_idx on public.ratings (attraction_id);

-- Si vous aviez exécuté la première version du schéma, ces lignes ajoutent les nouvelles colonnes.
alter table public.attractions add column if not exists evaluated_on date;
alter table public.attractions add column if not exists disclosure text;
-- Version anglaise (facultatif : si vide, le texte français est affiché)
alter table public.attractions add column if not exists model_en text;
alter table public.attractions add column if not exists disclosure_en text;

-- Passage de l'échelle sur 10 à l'échelle sur 20 (sans effet sur une base neuve).
alter table public.attractions drop constraint if exists attractions_official_score_check;
alter table public.attractions add  constraint attractions_official_score_check check (official_score between 0 and 20);
alter table public.ratings     drop constraint if exists ratings_score_check;
alter table public.ratings     add  constraint ratings_score_check check (score between 0 and 20);
-- Si vous aviez déjà saisi des notes sur 10, décommentez UNE SEULE FOIS :
-- update public.attractions set official_score = official_score * 2;
-- update public.ratings     set score = score * 2;

-- Mise à jour automatique de updated_at
create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end $$;
drop trigger if exists attractions_touch on public.attractions;
create trigger attractions_touch before update on public.attractions
  for each row execute function public.touch_updated_at();

-- ── 3. Sécurité (RLS) ──────────────────────────────────────────────────────
-- Les visiteurs peuvent LIRE les attractions publiées, jamais les modifier.
-- Ils ne peuvent ni lire ni écrire directement dans ratings : uniquement via
-- la fonction submit_rating ci-dessous, qui contrôle la note.
alter table public.attractions enable row level security;
alter table public.ratings     enable row level security;

drop policy if exists "Lecture publique des attractions publiées" on public.attractions;
create policy "Lecture publique des attractions publiées"
  on public.attractions for select to anon, authenticated using (published);

-- ── 4. Vue lue par le site : attraction + moyenne et nombre de notes ───────
-- La vue s'exécute avec les droits de son propriétaire : elle peut agréger
-- les notes sans exposer les notes individuelles ni les identifiants.
drop view if exists public.attractions_public;
create view public.attractions_public as
select
  a.id, a.slug, a.name, a.park, a.city, a.country, a.region, a.type,
  a.model, a.model_en, a.manufacturer, a.year, a.official_score, a.evaluated_on, a.disclosure, a.disclosure_en,
  a.photo_url, a.photo_credit,
  rank() over (order by a.official_score desc)   as official_rank,
  round(avg(r.score)::numeric, 1)                as visitor_avg,
  count(r.id)::int                               as visitor_count
from public.attractions a
left join public.ratings r on r.attraction_id = a.id
where a.published
group by a.id;

grant select on public.attractions_public to anon, authenticated;

-- ── 5. Enregistrer / modifier une note visiteur ────────────────────────────
create or replace function public.submit_rating(
  p_attraction_id uuid, p_visitor_id uuid, p_score int
) returns table (visitor_avg numeric, visitor_count int)
language plpgsql security definer set search_path = public as $$
begin
  if p_score is null or p_score < 0 or p_score > 20 then
    raise exception 'La note doit être comprise entre 0 et 20';
  end if;
  if not exists (select 1 from attractions where id = p_attraction_id and published) then
    raise exception 'Attraction introuvable';
  end if;

  insert into ratings (attraction_id, visitor_id, score)
  values (p_attraction_id, p_visitor_id, p_score)
  on conflict (attraction_id, visitor_id)
  do update set score = excluded.score, updated_at = now();

  return query
    select round(avg(r.score)::numeric, 1), count(*)::int
    from ratings r where r.attraction_id = p_attraction_id;
end $$;

revoke all on function public.submit_rating(uuid, uuid, int) from public;
grant execute on function public.submit_rating(uuid, uuid, int) to anon, authenticated;

-- ── 6. Bucket public pour les photos ───────────────────────────────────────
-- Envoyez vos photos dans Storage > attractions, puis copiez leur URL publique
-- dans la colonne photo_url.
insert into storage.buckets (id, name, public)
values ('attractions', 'attractions', true)
on conflict (id) do nothing;

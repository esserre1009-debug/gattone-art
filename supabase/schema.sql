-- =====================================================================
-- gattone.art - Schema Supabase
-- Eseguire in: Supabase Dashboard > SQL Editor > New query > Run
-- =====================================================================

-- Estensione per generare UUID se necessario (di solito già attiva)
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Tabella OPERE
-- ---------------------------------------------------------------------
create table if not exists public.artworks (
  id             text primary key,               -- manteniamo id testuali come nel JSON originale ('1','2',...)
  title          text not null,
  subject        text not null,
  availability   text not null default 'Disponibile',
  size_category  text not null,
  orientation    text not null default 'square',  -- square | horizontal | vertical
  dimensions     text,
  price          numeric,
  price_display  text,
  description    text,
  images         text[] not null default '{}',
  cover          text,
  sort_order     integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

comment on table public.artworks is 'Catalogo opere gattone.art';

-- trigger updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_artworks_updated_at on public.artworks;
create trigger trg_artworks_updated_at
before update on public.artworks
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Tabella IMPOSTAZIONI (chiave/valore JSON) -> categorie, flags, hero, instagram
-- ---------------------------------------------------------------------
create table if not exists public.app_settings (
  key         text primary key,   -- 'categories' | 'flags' | 'hero' | 'instagram'
  value       jsonb not null,
  updated_at  timestamptz not null default now()
);

drop trigger if exists trg_settings_updated_at on public.app_settings;
create trigger trg_settings_updated_at
before update on public.app_settings
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- RLS: lettura pubblica (anon key), scrittura SOLO da admin-server
-- (service_role key, che bypassa comunque RLS)
-- ---------------------------------------------------------------------
alter table public.artworks enable row level security;
alter table public.app_settings enable row level security;

drop policy if exists "artworks_public_read" on public.artworks;
create policy "artworks_public_read"
  on public.artworks for select
  to anon, authenticated
  using (true);

drop policy if exists "settings_public_read" on public.app_settings;
create policy "settings_public_read"
  on public.app_settings for select
  to anon, authenticated
  using (true);

-- Nessuna policy di insert/update/delete per anon/authenticated:
-- il pannello admin usa la SERVICE ROLE KEY (mai esposta al frontend
-- pubblico), che bypassa RLS by design in Supabase.

-- ---------------------------------------------------------------------
-- STORAGE: bucket pubblico per le immagini
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('artwork-images', 'artwork-images', true)
on conflict (id) do nothing;

drop policy if exists "artwork_images_public_read" on storage.objects;
create policy "artwork_images_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'artwork-images');

-- Upload/gestione file consentiti solo via service_role (admin-server),
-- quindi non serve una policy insert/update/delete per anon.

-- ---------------------------------------------------------------------
-- Indici utili
-- ---------------------------------------------------------------------
create index if not exists idx_artworks_subject on public.artworks (subject);
create index if not exists idx_artworks_availability on public.artworks (availability);
create index if not exists idx_artworks_size_category on public.artworks (size_category);
create index if not exists idx_artworks_sort_order on public.artworks (sort_order);

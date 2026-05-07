-- LRD / Colegio Verde
-- Ejecuta este archivo en el SQL Editor de Supabase.

create extension if not exists pgcrypto;

do $$ begin
  create type public.content_status as enum ('pendiente', 'aprobado', 'rechazado', 'publico', 'suspendido');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.report_status as enum ('abierto', 'en_revision', 'resuelto', 'descartado');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.appeal_status as enum ('pendiente', 'aceptada', 'rechazada');
exception when duplicate_object then null; end $$;

create table if not exists public.roles (
  name text primary key,
  description text not null,
  created_at timestamptz not null default now()
);

insert into public.roles (name, description) values
('usuario', 'Usuario normal'),
('reportero', 'Crea noticias y contenido especial'),
('staff', 'Revisa publicaciones y aplica sanciones'),
('moderador', 'Supervisa cuentas, logs y apelaciones'),
('admin', 'Acceso total')
on conflict (name) do nothing;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  username text unique not null,
  contact text not null,
  phone text,
  avatar_url text,
  validation_answers text,
  role text not null default 'usuario' references public.roles(name),
  status public.content_status not null default 'pendiente',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  kind text not null default 'general',
  created_at timestamptz not null default now()
);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists public.images (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.users(id) on delete set null,
  bucket text not null,
  path text not null,
  alt_text text,
  created_at timestamptz not null default now()
);

create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.users(id) on delete set null,
  author text not null,
  title text not null,
  content text not null,
  category text default 'General',
  tag_list text[] not null default '{}',
  image_url text,
  status public.content_status not null default 'pendiente',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.users(id) on delete set null,
  author text not null,
  section text not null default 'publicaciones', -- publicaciones | foro
  type text not null default 'publicacion',
  title text not null default 'Publicación',
  content text not null,
  tag_list text[] not null default '{}',
  image_url text,
  status public.content_status not null default 'pendiente',
  likes_count integer not null default 0,
  saves_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid references public.users(id) on delete set null,
  author text not null,
  kind text not null default 'comment',
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(post_id, user_id)
);

create table if not exists public.saves (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(post_id, user_id)
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  target_type text not null,
  target_id uuid not null,
  reporter_id uuid references public.users(id) on delete set null,
  reason text not null,
  status public.report_status not null default 'abierto',
  created_at timestamptz not null default now()
);

create table if not exists public.strikes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  issued_by uuid references public.users(id) on delete set null,
  reason text not null,
  count integer not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists public.appeals (
  id uuid primary key default gen_random_uuid(),
  target_type text not null,
  target_id uuid not null,
  author_id uuid references public.users(id) on delete set null,
  reason text not null,
  status public.appeal_status not null default 'pendiente',
  created_at timestamptz not null default now()
);

create table if not exists public.moderation_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.users(id) on delete set null,
  action text not null,
  target_type text not null,
  target_id uuid,
  affected_id uuid,
  reason text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.pending_approvals (
  id uuid primary key default gen_random_uuid(),
  target_type text not null,
  target_id uuid not null,
  requested_by uuid references public.users(id) on delete set null,
  reviewed_by uuid references public.users(id) on delete set null,
  status public.content_status not null default 'pendiente',
  reason text not null,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.users(id) on delete set null,
  author text not null,
  title text not null,
  content text not null,
  status public.content_status not null default 'publico',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.categories (name, kind) values
('General', 'general'),
('Académico', 'news'),
('Deportes', 'news'),
('Cultura', 'news'),
('Avisos', 'announcements')
on conflict (name) do nothing;

insert into public.tags (name) values
('escuela'),('colegio'),('deportes'),('tareas'),('eventos'),('noticias'),('foro'),('comunidad')
on conflict (name) do nothing;

create or replace function public.current_role()
returns text
language sql
stable
as $$
  select coalesce((select u.role from public.users u where u.id = auth.uid()), 'visitante');
$$;

create or replace function public.is_role(role_name text)
returns boolean
language sql
stable
as $$
  select public.current_role() = role_name;
$$;

create or replace function public.is_moderator()
returns boolean
language sql
stable
as $$
  select public.current_role() in ('staff','moderador','admin');
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select public.current_role() = 'admin';
$$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_users_updated on public.users;
create trigger trg_users_updated before update on public.users
for each row execute function public.touch_updated_at();

drop trigger if exists trg_news_updated on public.news;
create trigger trg_news_updated before update on public.news
for each row execute function public.touch_updated_at();

drop trigger if exists trg_posts_updated on public.posts;
create trigger trg_posts_updated before update on public.posts
for each row execute function public.touch_updated_at();

drop trigger if exists trg_announcements_updated on public.announcements;
create trigger trg_announcements_updated before update on public.announcements
for each row execute function public.touch_updated_at();

alter table public.roles enable row level security;
alter table public.users enable row level security;
alter table public.categories enable row level security;
alter table public.tags enable row level security;
alter table public.images enable row level security;
alter table public.news enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;
alter table public.saves enable row level security;
alter table public.reports enable row level security;
alter table public.strikes enable row level security;
alter table public.appeals enable row level security;
alter table public.moderation_logs enable row level security;
alter table public.pending_approvals enable row level security;
alter table public.announcements enable row level security;

-- Public read
create policy "roles read" on public.roles for select using (true);
create policy "categories read" on public.categories for select using (true);
create policy "tags read" on public.tags for select using (true);
create policy "news public read" on public.news for select using (status = 'aprobado' or public.is_moderator());
create policy "posts public read" on public.posts for select using (status = 'aprobado' or public.is_moderator());
create policy "comments public read" on public.comments for select using (true);
create policy "announcements public read" on public.announcements for select using (status = 'publico' or public.is_moderator());
create policy "images public read" on public.images for select using (true);
create policy "logs moderator read" on public.moderation_logs for select using (public.is_moderator());
create policy "approvals moderator read" on public.pending_approvals for select using (public.is_moderator());
create policy "reports moderator read" on public.reports for select using (public.is_moderator() or reporter_id = auth.uid());
create policy "strikes self or moderator read" on public.strikes for select using (public.is_moderator() or user_id = auth.uid());
create policy "appeals self or moderator read" on public.appeals for select using (public.is_moderator() or author_id = auth.uid());

-- Users
create policy "users can read own" on public.users for select using (id = auth.uid() or public.is_moderator());
create policy "users can insert own" on public.users for insert with check (id = auth.uid());
create policy "users can update own" on public.users for update using (id = auth.uid()) with check (id = auth.uid());
create policy "users moderator update" on public.users for update using (public.is_moderator()) with check (public.is_moderator());

-- News
create policy "news insert reporter" on public.news for insert with check (auth.uid() is not null);
create policy "news update reporter or moderator" on public.news for update using (author_id = auth.uid() or public.is_moderator()) with check (author_id = auth.uid() or public.is_moderator());
create policy "news delete moderator" on public.news for delete using (public.is_moderator());

-- Posts
create policy "posts insert auth" on public.posts for insert with check (auth.uid() is not null);
create policy "posts update owner or moderator" on public.posts for update using (author_id = auth.uid() or public.is_moderator()) with check (author_id = auth.uid() or public.is_moderator());
create policy "posts delete owner or moderator" on public.posts for delete using (author_id = auth.uid() or public.is_moderator());

-- Interactions
create policy "comments insert auth" on public.comments for insert with check (auth.uid() is not null);
create policy "comments update own or moderator" on public.comments for update using (author_id = auth.uid() or public.is_moderator()) with check (author_id = auth.uid() or public.is_moderator());
create policy "comments delete own or moderator" on public.comments for delete using (author_id = auth.uid() or public.is_moderator());

create policy "likes insert own" on public.likes for insert with check (user_id = auth.uid());
create policy "likes delete own" on public.likes for delete using (user_id = auth.uid());
create policy "saves insert own" on public.saves for insert with check (user_id = auth.uid());
create policy "saves delete own" on public.saves for delete using (user_id = auth.uid());

create policy "reports insert auth" on public.reports for insert with check (auth.uid() is not null);
create policy "reports update moderator" on public.reports for update using (public.is_moderator()) with check (public.is_moderator());

create policy "strikes insert moderator" on public.strikes for insert with check (public.is_moderator());
create policy "appeals insert auth" on public.appeals for insert with check (auth.uid() is not null);
create policy "appeals update moderator" on public.appeals for update using (public.is_moderator()) with check (public.is_moderator());

create policy "logs insert moderator" on public.moderation_logs for insert with check (public.is_moderator() or public.is_admin());
create policy "approvals insert auth" on public.pending_approvals for insert with check (auth.uid() is not null);
create policy "approvals update moderator" on public.pending_approvals for update using (public.is_moderator()) with check (public.is_moderator());

create policy "announcements insert moderator" on public.announcements for insert with check (public.is_moderator());
create policy "announcements update moderator" on public.announcements for update using (public.is_moderator()) with check (public.is_moderator());
create policy "announcements delete moderator" on public.announcements for delete using (public.is_moderator());

-- Storage policies (buckets must exist)
-- profile-images, post-images, news-images
-- Read is public because the app uses public URLs.

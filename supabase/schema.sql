-- Aman dijalankan berulang kali.
-- Jalankan seluruh isi file ini di Supabase > SQL Editor > New query > Run

create table if not exists milestones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  title text not null,
  lang text not null,
  scope text not null check (scope in ('daily','weekly')),
  due_date date not null default current_date,
  minutes int not null default 45,
  status text not null default 'todo' check (status in ('todo','doing','done')),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null,
  stack text,
  deadline date,
  created_at timestamptz not null default now()
);

create table if not exists project_milestones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  project_id uuid not null references projects on delete cascade,
  title text not null,
  status text not null default 'todo' check (status in ('todo','doing','review','done')),
  due_date date,
  created_at timestamptz not null default now()
);

-- Keamanan: setiap pengguna hanya bisa melihat & mengubah datanya sendiri
alter table milestones enable row level security;
alter table projects enable row level security;
alter table project_milestones enable row level security;

drop policy if exists "milik sendiri" on milestones;
create policy "milik sendiri" on milestones for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "milik sendiri" on projects;
create policy "milik sendiri" on projects for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "milik sendiri" on project_milestones;
create policy "milik sendiri" on project_milestones for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- supabase/migrations/0001_init.sql
create extension if not exists pgcrypto;

create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id),
  title text not null,
  target_date date,
  status text not null default 'open' check (status in ('open','closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id),
  goal_id uuid references goals(id) on delete set null,
  title text not null,
  kind text not null default 'task' check (kind in ('task','event')),
  done boolean not null default false,
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id),
  date date not null,
  amount numeric not null,
  kind text not null default 'expense' check (kind in ('expense','investment')),
  current_value numeric,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id),
  name text not null,
  category text not null check (category in ('partnership','vendor','labour','misc')),
  phone text,
  email text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table work_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id),
  task_name text not null,
  tag text,
  date date not null,
  duration_hours numeric not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id),
  contact_id uuid references contacts(id),
  name text not null,
  stage text not null default 'Brief',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table project_columns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id),
  project_id uuid not null references projects(id) on delete cascade,
  name text not null,
  position int not null
);

create table project_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id),
  project_id uuid not null references projects(id) on delete cascade,
  column_id uuid not null references project_columns(id) on delete cascade,
  title text not null,
  description text,
  due_date date,
  position int not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table reference_images (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id),
  project_id uuid not null references projects(id) on delete cascade,
  storage_path text not null,
  caption text,
  created_at timestamptz not null default now()
);

create table correspondence (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id),
  project_id uuid not null references projects(id) on delete cascade,
  direction text not null check (direction in ('received','sent')),
  subject text not null,
  notes text,
  attachment_storage_path text,
  date date not null,
  created_at timestamptz not null default now()
);

do $$
declare t text;
begin
  foreach t in array array['goals','tasks','expenses','contacts','work_logs','projects','project_cards'] loop
    execute format('create trigger %I_set_updated_at before update on %I for each row execute function set_updated_at();', t, t);
  end loop;
end $$;

do $$
declare t text;
begin
  foreach t in array array['goals','tasks','expenses','contacts','work_logs','projects','project_columns','project_cards','reference_images','correspondence'] loop
    execute format('alter table %I enable row level security;', t);
    execute format('create policy %I_owner on %I for all using (user_id = auth.uid()) with check (user_id = auth.uid());', t, t);
    execute format('grant select, insert, update, delete on %I to authenticated;', t);
  end loop;
end $$;

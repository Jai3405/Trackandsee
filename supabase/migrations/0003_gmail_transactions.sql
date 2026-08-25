-- supabase/migrations/0003_gmail_transactions.sql
create table gmail_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique default auth.uid() references auth.users(id),
  refresh_token text not null,
  connected_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table pending_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id),
  source_message_id text not null,
  -- Nullable: a matched email that fails to parse still gets a row (never
  -- silently dropped), with amount/merchant/category_guess left null so she
  -- can enter them manually in the review queue.
  amount numeric,
  merchant text,
  category_guess text,
  occurred_at timestamptz not null,
  raw_snippet text,
  status text not null default 'pending' check (status in ('pending','approved','discarded')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, source_message_id)
);

create trigger pending_transactions_set_updated_at before insert or update on pending_transactions
  for each row execute function set_updated_at();

alter table gmail_connections enable row level security;
create policy gmail_connections_owner on gmail_connections for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

alter table pending_transactions enable row level security;
create policy pending_transactions_owner on pending_transactions for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- gmail_connections is a credential record, not content worth preserving —
-- real delete, not the soft-delete pattern the rest of the schema uses.
grant select, insert, update, delete on gmail_connections to authenticated;
-- pending_transactions follows the standard soft-delete-table grant: no delete.
grant select, insert, update on pending_transactions to authenticated;

-- Supabase's default ACL grants truncate to anon/authenticated on every new
-- table; 0001_init.sql's blanket revoke only covered tables that existed at
-- the time it ran, not these — repeat it here, same as 0001 established.
revoke truncate on gmail_connections, pending_transactions from anon, authenticated;

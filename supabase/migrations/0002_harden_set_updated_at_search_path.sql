-- supabase/migrations/0002_harden_set_updated_at_search_path.sql
-- Supabase's hosted security advisor flags a function with no explicit
-- search_path as mutable/hijackable (a role could shadow object resolution
-- by creating same-named objects earlier in the session's search_path).
-- Local Docker testing doesn't run this lint, so it only surfaced once
-- applied to the real project. Locking search_path to '' is the standard fix.
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql set search_path = '';

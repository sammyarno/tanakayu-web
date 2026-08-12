-- Baseline migration: snapshot of the live "Tanakayu" Supabase project (ifticiygfzgydpptysbs)
-- as of 2026-08-12. Captures schema, RLS policies, functions, triggers and one auth-schema
-- customization that predate migration tracking. Every schema change from now on must be
-- added as a NEW migration file (`supabase migration new <name>`) -- never edit this file again.

-- ============================================
-- Extensions
-- ============================================

create extension if not exists pgcrypto with schema extensions;
create extension if not exists "uuid-ossp" with schema extensions;

-- ============================================
-- Enum types
-- ============================================

create type public.user_role as enum ('SUPERADMIN', 'ADMINISTRATOR', 'MEMBER', 'MERCHANT');
create type public.waitlist_status as enum ('PENDING', 'APPROVED', 'REJECTED');

-- ============================================
-- Tables
-- ============================================

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  full_name text not null default '',
  phone_number text not null default '',
  address text not null default '',
  role user_role not null default 'MEMBER',
  suspended_until timestamptz,
  failed_login_attempts integer not null default 0,
  created_at timestamptz not null default now(),
  modified_at timestamptz,
  modified_by text
);

create table public.post_categories (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  code text not null unique,
  created_at timestamptz not null default now(),
  created_by text not null,
  modified_at timestamptz,
  modified_by text
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  type text not null default 'pengumuman',
  start_date timestamptz,
  end_date timestamptz,
  created_at timestamptz not null default now(),
  created_by text not null,
  modified_at timestamptz,
  modified_by text,
  deleted_at timestamptz,
  deleted_by text
);

create table public.post_category_map (
  post_id uuid not null references public.posts(id),
  category_id uuid not null references public.post_categories(id),
  created_at timestamptz default now(),
  created_by text,
  primary key (post_id, category_id)
);

create table public.post_votes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  vote_type text not null check (vote_type in ('upvote', 'downvote')),
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

create index idx_post_votes_post_id on public.post_votes(post_id);
create index idx_post_votes_user_id on public.post_votes(user_id);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  created_by text not null,
  modified_at timestamptz,
  modified_by text,
  date date not null,
  category text not null,
  title text not null,
  description text,
  amount real not null,
  type text not null
);

create index idx_transactions_date on public.transactions(date desc);
create index idx_transactions_date_type on public.transactions(date, type);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  entity_type text not null,
  entity_id text,
  actor text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index idx_audit_logs_entity on public.audit_logs(entity_type, entity_id);
create index idx_audit_logs_actor on public.audit_logs(actor);
create index idx_audit_logs_created_at on public.audit_logs(created_at desc);

create table public.member_invites (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  full_name text not null default '',
  phone_number text,
  created_by text not null,
  expires_at timestamptz,
  used_at timestamptz,
  used_by uuid references auth.users(id) on delete set null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.member_waitlist (
  id uuid primary key default gen_random_uuid(),
  username text not null,
  full_name text not null default '',
  email text not null,
  phone_number text not null,
  address text not null default '',
  status waitlist_status not null default 'PENDING',
  invite_id uuid references public.member_invites(id) on delete set null,
  approved_user_id uuid references auth.users(id) on delete set null,
  reviewed_by text,
  reviewed_at timestamptz,
  reject_reason text,
  created_at timestamptz not null default now()
);

create unique index member_waitlist_username_key on public.member_waitlist (lower(username));
create unique index member_waitlist_email_key on public.member_waitlist (lower(email));
create unique index member_waitlist_phone_key on public.member_waitlist (phone_number);

-- Password hashes, split out so the superadmin SELECT policy on member_waitlist can never expose them
create table public.member_waitlist_secrets (
  waitlist_id uuid primary key references public.member_waitlist(id) on delete cascade,
  password_hash text not null,
  created_at timestamptz not null default now()
);

-- Live admin notifications for the waitlist
alter publication supabase_realtime add table public.member_waitlist;

-- ============================================
-- auth schema customization
-- ============================================

-- Lets the login-with-username edge function dedupe refresh tokens per-device via JWT ID.
-- NOTE: on hosted Supabase, `postgres` has supabase_auth_admin privileges, so this applies
-- cleanly via `supabase db push`. The local CLI stack does not grant that by default, so
-- `supabase db start` / `db reset` will fail on this statement alone -- run
-- `grant supabase_auth_admin to postgres;` once against the local db first if you need it locally.
alter table auth.refresh_tokens add column token_jti text;
create unique index refresh_tokens_user_jti_idx on auth.refresh_tokens(user_id, token_jti);

-- ============================================
-- Functions
-- ============================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, username, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.get_balance_before_date(target_date date)
returns numeric
language sql
stable
as $$
  select coalesce(
    sum(case when type = 'income' then amount else -amount end),
    0
  )
  from public.transactions
  where date < target_date;
$$;

create or replace function public.get_transaction_date_range()
returns table(min_date date, max_date date)
language plpgsql
stable
as $$
begin
  return query select min(t.date), max(t.date) from public.transactions t;
end;
$$;

-- Copies a waitlist-stored bcrypt hash onto the auth user created at approval time.
create or replace function public.set_user_password_hash(p_user_id uuid, p_hash text)
returns void
language plpgsql
security definer
set search_path = auth, public
as $$
begin
  update auth.users set encrypted_password = p_hash, updated_at = now() where id = p_user_id;
end;
$$;

revoke execute on function public.set_user_password_hash(uuid, text) from public;
grant execute on function public.set_user_password_hash(uuid, text) to service_role;

-- Inserts a waitlist entry + its password hash atomically; plaintext never lands in a column.
create or replace function public.submit_waitlist(
  p_username text,
  p_full_name text,
  p_email text,
  p_phone_number text,
  p_address text,
  p_password text,
  p_invite_id uuid default null
) returns uuid
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_id uuid;
begin
  insert into public.member_waitlist (username, full_name, email, phone_number, address, invite_id)
  values (p_username, p_full_name, p_email, p_phone_number, p_address, p_invite_id)
  returning id into v_id;

  insert into public.member_waitlist_secrets (waitlist_id, password_hash)
  values (v_id, extensions.crypt(p_password, extensions.gen_salt('bf')));

  return v_id;
end;
$$;

revoke execute on function public.submit_waitlist(text, text, text, text, text, text, uuid) from public;
grant execute on function public.submit_waitlist(text, text, text, text, text, text, uuid) to service_role;

-- ============================================
-- Row Level Security
-- ============================================

alter table public.profiles enable row level security;
alter table public.post_categories enable row level security;
alter table public.posts enable row level security;
alter table public.post_category_map enable row level security;
alter table public.post_votes enable row level security;
alter table public.transactions enable row level security;
alter table public.audit_logs enable row level security;
alter table public.member_invites enable row level security;
alter table public.member_waitlist enable row level security;
alter table public.member_waitlist_secrets enable row level security;
-- member_waitlist_secrets intentionally has NO policies: only service_role (which bypasses RLS) can touch it.

-- profiles
create policy "Allow authenticated read" on public.profiles for select to authenticated using (true);
create policy "Allow self update" on public.profiles for update to authenticated using (auth.uid() = id);
create policy "Allow service role all" on public.profiles for all to service_role using (true);
create policy "Allow superadmin delete" on public.profiles for delete to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'SUPERADMIN'::user_role));
create policy "Allow superadmin update" on public.profiles for update to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'SUPERADMIN'::user_role));

-- post_categories
create policy "Allow anonymous users to read announcement_categories" on public.post_categories for select to anon using (true);
create policy "Allow authenticated users to read announcement_categories" on public.post_categories for select to authenticated using (true);
create policy "Allow authenticated users to insert announcement_categories" on public.post_categories for insert to authenticated with check (true);
create policy "Allow authenticated users to update announcement_categories" on public.post_categories for update to authenticated using (true) with check (true);
create policy "Allow authenticated users to delete announcement_categories" on public.post_categories for delete to authenticated using (true);

-- posts
create policy "Allow anonymous users to read non-deleted posts" on public.posts for select to anon using (deleted_at is null);
create policy "Authenticated users can read non-deleted posts" on public.posts for select to authenticated using (deleted_at is null);
create policy "Authenticated users can insert posts" on public.posts for insert to authenticated with check (true);
create policy "Authenticated users can update posts" on public.posts for update to authenticated using (true) with check (true);
create policy "Authenticated users can delete posts" on public.posts for delete to authenticated using (true);
create policy "Service role has full access to posts" on public.posts for all to service_role using (true) with check (true);

-- post_category_map
create policy "Allow anonymous users to read post category map" on public.post_category_map for select to anon using (true);
create policy "Authenticated users can read post category map" on public.post_category_map for select to authenticated using (true);
create policy "Authenticated users can insert post category map" on public.post_category_map for insert to authenticated with check (true);
create policy "Authenticated users can delete post category map" on public.post_category_map for delete to authenticated using (true);
create policy "Service role has full access to post category map" on public.post_category_map for all to service_role using (true) with check (true);

-- post_votes
create policy "Allow anonymous users to read post votes" on public.post_votes for select to anon using (true);
create policy "Authenticated users can read all votes" on public.post_votes for select to authenticated using (true);
create policy "Authenticated users can insert own votes" on public.post_votes for insert to authenticated with check (user_id = auth.uid());
create policy "Authenticated users can update own votes" on public.post_votes for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Authenticated users can delete own votes" on public.post_votes for delete to authenticated using (user_id = auth.uid());
create policy "Service role has full access to post votes" on public.post_votes for all to service_role using (true) with check (true);

-- transactions
create policy "Enable read access for all users" on public.transactions for select to public using (true);
create policy "Enable insert for authenticated users only" on public.transactions for insert to authenticated with check (true);
create policy "Enable update for authenticated users only" on public.transactions for update to authenticated using (true) with check (true);

-- audit_logs (service_role only, no anon/authenticated access)
create policy "Service role has full access to audit logs" on public.audit_logs for all to service_role using (true) with check (true);

-- member_invites (service_role only)
create policy "Service role has full access to member invites" on public.member_invites for all to service_role using (true) with check (true);

-- member_waitlist
create policy "Service role has full access to member waitlist" on public.member_waitlist for all to service_role using (true) with check (true);
create policy "Allow superadmin read waitlist" on public.member_waitlist for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'SUPERADMIN'::user_role));

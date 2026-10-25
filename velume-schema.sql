-- ============================================================
-- VELUME — base de données Supabase (à exécuter UNE SEULE FOIS)
-- Supabase > SQL Editor > New query > coller tout > Run
-- ============================================================

-- 1) Profils : un par compte (le mot de passe est géré par Supabase Auth, jamais stocké ici)
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  name       text,
  role       text not null default 'user'
             check (role in ('admin','manager','cashier','barista','waiter','kitchen','photo','sound','studio','user','portal')),
  is_owner   boolean not null default false,
  approved   boolean not null default false,
  created_at timestamptz not null default now()
);

-- 2) Données de l'entreprise : une ligne par enregistrement (produit, vente, employé...)
create table if not exists public.records (
  model      text   not null,
  id         bigint not null,
  data       jsonb  not null,
  deleted    boolean not null default false,
  updated_at timestamptz not null default clock_timestamp(),
  updated_by uuid,
  primary key (model, id)
);
create index if not exists records_updated_idx on public.records(updated_at);

-- 3) Réglages de l'entreprise (société, applications installées, droits par rôle...)
create table if not exists public.settings (
  key        text primary key,
  data       jsonb not null,
  updated_at timestamptz not null default clock_timestamp(),
  updated_by uuid
);

-- 4) Compteurs de numéros (pour que deux appareils ne créent jamais le même numéro)
create table if not exists public.id_counters (
  model text primary key,
  last  bigint not null default 0
);

-- 5) Codes d'invitation créés par l'administrateur
create table if not exists public.invites (
  code       text primary key,
  role       text not null check (role in ('manager','cashier','barista','waiter','kitchen','photo','sound','studio','user')),
  used       boolean not null default false,
  used_by    uuid,
  created_by uuid,
  created_at timestamptz not null default now()
);

-- ---------- fonctions de contrôle ----------
create or replace function public.is_member() returns boolean
language sql stable security definer set search_path = public as
$$ select exists (select 1 from public.profiles where id = auth.uid() and approved) $$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as
$$ select exists (select 1 from public.profiles where id = auth.uid() and approved and role = 'admin') $$;

create or replace function public.is_owner() returns boolean
language sql stable security definer set search_path = public as
$$ select exists (select 1 from public.profiles where id = auth.uid() and approved and is_owner) $$;

-- ---------- création automatique du profil à l'inscription ----------
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email,
          coalesce(nullif(new.raw_user_meta_data->>'name',''), nullif(new.raw_user_meta_data->>'full_name',''), split_part(new.email,'@',1)));
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- horodatage serveur ----------
create or replace function public.touch_row() returns trigger
language plpgsql as $$
begin
  new.updated_at := clock_timestamp();
  new.updated_by := auth.uid();
  return new;
end $$;
drop trigger if exists records_touch on public.records;
create trigger records_touch before insert or update on public.records
  for each row execute function public.touch_row();
drop trigger if exists settings_touch on public.settings;
create trigger settings_touch before insert or update on public.settings
  for each row execute function public.touch_row();

-- ---------- premier compte = administrateur principal ----------
create or replace function public.bootstrap_owner() returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not_signed_in'; end if;
  perform pg_advisory_xact_lock(424242);
  if exists (select 1 from public.profiles where is_owner) then
    raise exception 'already_initialized';
  end if;
  update public.profiles set is_owner = true, role = 'admin', approved = true where id = auth.uid();
end $$;

-- ---------- gestion des comptes (administrateur) ----------
create or replace function public.admin_set_user(target uuid, new_role text, new_approved boolean) returns void
language plpgsql security definer set search_path = public as $$
declare t public.profiles;
begin
  if not public.is_admin() then raise exception 'admin_only'; end if;
  select * into t from public.profiles where id = target;
  if not found then raise exception 'unknown_user'; end if;
  if t.is_owner then raise exception 'owner_protected'; end if;
  if target = auth.uid() then raise exception 'not_yourself'; end if;
  if new_role not in ('admin','manager','cashier','barista','waiter','kitchen','photo','sound','studio','user','portal') then raise exception 'bad_role'; end if;
  if (new_role = 'admin' or t.role = 'admin') and not public.is_owner() then raise exception 'owner_only'; end if;
  update public.profiles set role = new_role, approved = new_approved where id = target;
end $$;

create or replace function public.admin_remove_user(target uuid) returns void
language plpgsql security definer set search_path = public as $$
declare t public.profiles;
begin
  if not public.is_admin() then raise exception 'admin_only'; end if;
  select * into t from public.profiles where id = target;
  if not found then return; end if;
  if t.is_owner then raise exception 'owner_protected'; end if;
  if target = auth.uid() then raise exception 'not_yourself'; end if;
  if t.role = 'admin' and not public.is_owner() then raise exception 'owner_only'; end if;
  delete from auth.users where id = target;
end $$;

-- ---------- invitations ----------
create or replace function public.create_invite(r text) returns text
language plpgsql security definer set search_path = public as $$
declare c text;
begin
  if not public.is_admin() then raise exception 'admin_only'; end if;
  if r not in ('manager','cashier','barista','waiter','kitchen','photo','sound','studio','user') then raise exception 'bad_role'; end if;
  c := 'VLM-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 5));
  insert into public.invites (code, role, created_by) values (c, r, auth.uid());
  return c;
end $$;

create or replace function public.redeem_invite(c text) returns text
language plpgsql security definer set search_path = public as $$
declare i public.invites;
begin
  if auth.uid() is null then raise exception 'not_signed_in'; end if;
  select * into i from public.invites where code = upper(trim(c)) and not used for update;
  if not found then raise exception 'bad_code'; end if;
  update public.invites set used = true, used_by = auth.uid() where code = i.code;
  update public.profiles set role = i.role, approved = true
   where id = auth.uid() and not is_owner;
  return i.role;
end $$;

create or replace function public.delete_invite(c text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'admin_only'; end if;
  delete from public.invites where code = upper(trim(c)) and not used;
end $$;

-- ---------- numéros uniques ----------
create or replace function public.reserve_ids(m text, n int) returns bigint
language plpgsql security definer set search_path = public as $$
declare v bigint;
begin
  if not public.is_member() then raise exception 'members_only'; end if;
  if n < 1 or n > 1000 then raise exception 'bad_count'; end if;
  insert into public.id_counters (model, last) values (m, n)
    on conflict (model) do update set last = public.id_counters.last + n
    returning last into v;
  return v - n + 1;
end $$;

create or replace function public.seed_counter(m text, v bigint) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'admin_only'; end if;
  insert into public.id_counters (model, last) values (m, v)
    on conflict (model) do update set last = greatest(public.id_counters.last, excluded.last);
end $$;

-- ---------- sécurité des lignes (RLS) ----------
alter table public.profiles    enable row level security;
alter table public.records     enable row level security;
alter table public.settings    enable row level security;
alter table public.id_counters enable row level security;
alter table public.invites     enable row level security;

drop policy if exists p_read on public.profiles;
create policy p_read on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_member());

drop policy if exists r_read on public.records;
create policy r_read on public.records for select to authenticated using (public.is_member());
drop policy if exists r_ins on public.records;
create policy r_ins on public.records for insert to authenticated with check (public.is_member());
drop policy if exists r_upd on public.records;
create policy r_upd on public.records for update to authenticated
  using (public.is_member()) with check (public.is_member());

drop policy if exists s_read on public.settings;
create policy s_read on public.settings for select to authenticated using (public.is_member());
drop policy if exists s_ins on public.settings;
create policy s_ins on public.settings for insert to authenticated with check (public.is_admin());
drop policy if exists s_upd on public.settings;
create policy s_upd on public.settings for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists i_all on public.invites;
create policy i_all on public.invites for select to authenticated using (public.is_admin());

-- ---------- droits d'accès ----------
revoke all on public.profiles, public.records, public.settings, public.id_counters, public.invites from anon, authenticated;
grant select on public.profiles, public.settings, public.invites to authenticated;
grant select, insert, update on public.records to authenticated;
grant insert, update on public.settings to authenticated;

revoke all on function
  public.bootstrap_owner(), public.admin_set_user(uuid,text,boolean), public.admin_remove_user(uuid),
  public.create_invite(text), public.redeem_invite(text), public.delete_invite(text), public.reserve_ids(text,int), public.seed_counter(text,bigint)
  from public, anon;
grant execute on function
  public.bootstrap_owner(), public.admin_set_user(uuid,text,boolean), public.admin_remove_user(uuid),
  public.create_invite(text), public.redeem_invite(text), public.delete_invite(text), public.reserve_ids(text,int), public.seed_counter(text,bigint)
  to authenticated;
grant execute on function public.is_member(), public.is_admin(), public.is_owner() to authenticated;

-- ---------- supprimer son propre compte (hors administrateur principal) ----------
create or replace function public.delete_my_account() returns void
language plpgsql security definer set search_path = public as $$
declare t public.profiles;
begin
  select * into t from public.profiles where id = auth.uid();
  if not found then return; end if;
  if t.is_owner then raise exception 'owner_protected'; end if;
  delete from auth.users where id = auth.uid();
end $$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- ---------- transférer le rôle d'administrateur principal ----------
create or replace function public.transfer_owner(target uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_owner() then raise exception 'owner_only'; end if;
  if target = auth.uid() then return; end if;
  if not exists (select 1 from public.profiles where id = target and approved) then raise exception 'not_approved'; end if;
  update public.profiles set is_owner = false where id = auth.uid();
  update public.profiles set is_owner = true, role = 'admin' where id = target;
end $$;
revoke all on function public.transfer_owner(uuid) from public, anon;
grant execute on function public.transfer_owner(uuid) to authenticated;

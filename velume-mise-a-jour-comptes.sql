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

-- ---------- nouveaux rôles : Barista, Serveur/Serveuse, Photographe, Technicien son ----------
do $$ declare c record; begin
  for c in select conname from pg_constraint where conrelid = 'public.profiles'::regclass and contype = 'c' and pg_get_constraintdef(oid) like '%role%' loop
    execute format('alter table public.profiles drop constraint %I', c.conname);
  end loop;
  for c in select conname from pg_constraint where conrelid = 'public.invites'::regclass and contype = 'c' and pg_get_constraintdef(oid) like '%role%' loop
    execute format('alter table public.invites drop constraint %I', c.conname);
  end loop;
end $$;
alter table public.profiles add constraint profiles_role_check
  check (role in ('admin','manager','cashier','barista','waiter','kitchen','photo','sound','studio','user','portal'));
alter table public.invites add constraint invites_role_check
  check (role in ('manager','cashier','barista','waiter','kitchen','photo','sound','studio','user'));

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

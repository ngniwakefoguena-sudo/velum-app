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

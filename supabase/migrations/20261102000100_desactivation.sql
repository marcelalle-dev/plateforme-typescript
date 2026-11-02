-- Un compte peut être désactivé par son utilisateur, mais plus supprimé depuis le site.
drop function public.supprimer_mon_compte();

alter table public.profils add column desactive_le timestamptz;

create function public.desactiver_mon_compte() returns void
language sql security definer set search_path = '' as $$
  update public.profils set desactive_le = now() where id = auth.uid();
$$;

create function public.reactiver_mon_compte() returns void
language sql security definer set search_path = '' as $$
  update public.profils set desactive_le = null where id = auth.uid();
$$;

revoke all on function public.desactiver_mon_compte() from public, anon;
revoke all on function public.reactiver_mon_compte() from public, anon;
grant execute on function public.desactiver_mon_compte() to authenticated;
grant execute on function public.reactiver_mon_compte() to authenticated;

-- Un compte désactivé ne peut plus modifier sa progression. Le test passe par une fonction,
-- car l'utilisateur ne doit lire que le strict nécessaire de sa propre fiche.
create function public.compte_actif() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profils where id = auth.uid() and desactive_le is null);
$$;
revoke all on function public.compte_actif() from public, anon;
grant execute on function public.compte_actif() to authenticated;

drop policy "créer sa progression" on public.progressions;
drop policy "modifier sa progression" on public.progressions;

create policy "créer sa progression" on public.progressions
  for insert to authenticated
  with check ((select auth.uid()) = id_utilisateur and (select public.compte_actif()));
create policy "modifier sa progression" on public.progressions
  for update to authenticated
  using ((select auth.uid()) = id_utilisateur and (select public.compte_actif()))
  with check ((select auth.uid()) = id_utilisateur and (select public.compte_actif()));

-- Le suivi indique aussi les comptes désactivés.
create or replace view public.suivi as
select
  p.prenom,
  p.email,
  p.cree_le,
  p.derniere_visite,
  coalesce((
    select count(*) from jsonb_each(g.donnees -> 'exercices') e
    where e.value ->> 'valide' = 'true'
  ), 0) as exercices_valides,
  coalesce((
    select round(avg((e.value ->> 'meilleur')::numeric), 1) from jsonb_each(g.donnees -> 'exercices') e
    where jsonb_typeof(e.value -> 'meilleur') = 'number'
  ), null) as moyenne_quiz,
  g.modifie_le as derniere_activite,
  p.desactive_le
from public.profils p
left join public.progressions g on g.id_utilisateur = p.id;

revoke all on public.suivi from public, anon, authenticated;

-- Comptes et progression de la plateforme.
-- Appliqué par `npx supabase db push`, ou à coller une seule fois dans SQL Editor.

-- Fiche de chaque utilisateur, créée automatiquement à l'inscription.
create table public.profils (
  id uuid primary key references auth.users (id) on delete cascade,
  prenom text not null default '' check (char_length(prenom) <= 60),
  email text not null default '',
  cree_le timestamptz not null default now(),
  derniere_visite timestamptz not null default now()
);

-- Progression de chaque utilisateur, au même format que dans le navigateur.
create table public.progressions (
  id_utilisateur uuid primary key references auth.users (id) on delete cascade,
  donnees jsonb not null default '{}'::jsonb check (pg_column_size(donnees) <= 500000),
  modifie_le timestamptz not null default now()
);

-- Chacun n'accède qu'à ses propres lignes.
alter table public.profils enable row level security;
alter table public.progressions enable row level security;

create policy "lire son profil" on public.profils
  for select to authenticated using ((select auth.uid()) = id);

create policy "lire sa progression" on public.progressions
  for select to authenticated using ((select auth.uid()) = id_utilisateur);
create policy "créer sa progression" on public.progressions
  for insert to authenticated with check ((select auth.uid()) = id_utilisateur);
create policy "modifier sa progression" on public.progressions
  for update to authenticated
  using ((select auth.uid()) = id_utilisateur)
  with check ((select auth.uid()) = id_utilisateur);

-- Les comptes visiteurs n'ont droit qu'à ce qui leur est utile.
revoke all on public.profils from anon, authenticated;
revoke all on public.progressions from anon, authenticated;
grant select on public.profils to authenticated;
grant select, insert, update on public.progressions to authenticated;

create function public.creer_profil() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profils (id, prenom, email)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data ->> 'prenom', ''), 60),
    coalesce(new.email, '')
  );
  return new;
end;
$$;

create trigger a_l_inscription
  after insert on auth.users
  for each row execute function public.creer_profil();

create function public.noter_visite() returns void
language sql security definer set search_path = '' as $$
  update public.profils set derniere_visite = now() where id = auth.uid();
$$;

-- Supprime le compte de la personne connectée, et toutes ses données par cascade.
create function public.supprimer_mon_compte() returns void
language sql security definer set search_path = '' as $$
  delete from auth.users where id = auth.uid();
$$;

revoke all on function public.creer_profil() from public, anon, authenticated;
revoke all on function public.noter_visite() from public, anon;
revoke all on function public.supprimer_mon_compte() from public, anon;
grant execute on function public.noter_visite() to authenticated;
grant execute on function public.supprimer_mon_compte() to authenticated;

-- Votre tableau de suivi : visible dans le tableau de bord Supabase, jamais depuis le site.
create view public.suivi as
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
  g.modifie_le as derniere_activite
from public.profils p
left join public.progressions g on g.id_utilisateur = p.id;

revoke all on public.suivi from public, anon, authenticated;

-- Avis sur la plateforme : un par compte, modifiable, lisible seulement par son auteur et le responsable.
create table public.avis (
  id_utilisateur uuid primary key references auth.users (id) on delete cascade,
  note smallint not null check (note between 1 and 5),
  commentaire text not null default '' check (char_length(commentaire) <= 1000),
  modifie_le timestamptz not null default now()
);

alter table public.avis enable row level security;

create policy "lire son avis" on public.avis
  for select to authenticated using ((select auth.uid()) = id_utilisateur);
create policy "créer son avis" on public.avis
  for insert to authenticated
  with check ((select auth.uid()) = id_utilisateur and (select public.compte_actif()));
create policy "modifier son avis" on public.avis
  for update to authenticated
  using ((select auth.uid()) = id_utilisateur and (select public.compte_actif()))
  with check ((select auth.uid()) = id_utilisateur and (select public.compte_actif()));

revoke all on public.avis from anon, authenticated;
grant select, insert, update on public.avis to authenticated;

-- Les avis du responsable : visibles dans le tableau de bord Supabase, jamais depuis le site.
create view public.avis_recus as
select p.prenom, p.email, a.note, a.commentaire, a.modifie_le
from public.avis a
join public.profils p on p.id = a.id_utilisateur
order by a.modifie_le desc;

revoke all on public.avis_recus from public, anon, authenticated;

# Activer les comptes

Tant que `js/config.js` est vide, les comptes restent invisibles sur le site.

Quand ils sont activés, un compte devient obligatoire 5 minutes après la première visite. Si le service est en pause ou injoignable, l'accès reste ouvert, car personne ne pourrait s'inscrire.

## 1. Créer le projet

1. Créez un compte gratuit sur https://supabase.com, puis un projet. Gardez le mot de passe de la base pour vous.
2. Choisissez une région proche de vos utilisateurs.

## 2. Créer les tables

1. Ouvrez **SQL Editor**, puis **New query**.
2. Collez tout le contenu de `supabase/migrations/20261102000000_comptes.sql`, puis cliquez sur **Run**.

## 3. Indiquer l'adresse du site

Dans **Authentication**, puis **URL Configuration** :

- **Site URL** : `https://marcelalle-dev.github.io/typescript-50-exercices/`
- **Redirect URLs** : ajoutez la même adresse, ainsi que `http://localhost:5173/`.

## 4. Copier les valeurs

Dans **Project Settings**, puis **API** (ou **API Keys**), copiez :

- l'adresse du projet (`https://....supabase.co`) ;
- la clé publique (`anon` ou `sb_publishable_...`).

Ne copiez jamais la clé `service_role` ou `sb_secret_...`.

## 5. E-mails de confirmation

Le service d'e-mails inclus envoie très peu de messages par heure. Pour quelques utilisateurs, cela suffit. Pour davantage, configurez votre propre service d'envoi (**Authentication**, puis **SMTP Settings**).

## Voir qui utilise la plateforme

Dans **Table Editor**, ouvrez la vue `suivi` : prénom, e-mail, date d'inscription, dernière visite, exercices validés et moyenne des quiz.

Pour lire les avis, ouvrez la vue `avis_recus` dans **Table Editor**.

Les utilisateurs peuvent désactiver leur compte, mais pas le supprimer. Pour effacer un compte, par exemple à la demande de son titulaire : **Authentication**, puis **Users**, puis supprimez l'utilisateur. Ses données sont effacées avec lui.

Le projet gratuit se met en pause après une semaine d'inactivité. Réactivez-le depuis le tableau de bord : le site et les cours restent accessibles entre-temps.

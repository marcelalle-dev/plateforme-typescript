# Plateforme interactive TypeScript personnalisée

Plateforme interactive pour comprendre les exercices 01 à 100 : cours détaillé, quiz corrigé, code à écrire et suivi de progression. Aucune installation n'est nécessaire en dehors de Node.js, et tout fonctionne hors ligne.

**Version en ligne :** https://marcelalle-dev.github.io/plateforme-typescript/

## Lancer la plateforme

Sous Windows, double-cliquez sur `lancer.bat`. Ou, depuis ce dossier :

```bash
npm start
```

Ouvrez ensuite http://localhost:5173.

La page doit être servie par ce petit serveur : ouverte directement depuis le fichier `index.html`, elle ne peut pas lancer le compilateur.

### Sur un téléphone

Sur le même réseau Wi-Fi que l'ordinateur :

```bash
npm run start:reseau
```

Le terminal affiche l'adresse à ouvrir sur le téléphone. La progression est enregistrée séparément sur chaque appareil, dans le `localStorage` du navigateur.

## Exercices qui utilisent une bibliothèque

Les exercices 73 à 79, 86 à 89 et 100 utilisent zod, React ou Express. L'éditeur du site ne peut pas charger ces bibliothèques : leur cours, leur pas à pas réel et leur quiz sont complets, mais il n'y a pas de bouton « Essayer ce code », et leur pratique s'écrit sans bibliothèque. Chaque cours indique la commande pour lancer le code sur un ordinateur.

## Ce que contient chaque exercice

1. **Cours** : objectif, explication simple, code original modifiable, mots nouveaux, explication ligne par ligne, exécution pas à pas, résultat attendu, erreurs fréquentes, points à retenir et liens avec les autres exercices.
2. **Quiz** : 6 questions dans plusieurs formats, un score sur 10 et une explication pour chaque correction. L'exercice est validé à partir de 8/10.
3. **Pratique** : un éditeur intégré, avec une vraie compilation TypeScript stricte et des tests automatiques. Les erreurs sont expliquées en français. La correction devient disponible après un premier essai.

La plateforme propose aussi une page sur les bases de JavaScript, un résumé et un quiz par module, la reprise des questions ratées, et des révisions espacées.

## D'où viennent les contenus

- `data/sources.js` est généré par un script, sans recopie manuelle : le TypeScript vient de `../src/exerciceNN.ts`, le JavaScript, les titres et les niveaux viennent de `../docs/*.docx`, et les résultats viennent de l'exécution réelle de chaque exercice en UTC.
- `data/module1.js` à `data/module10.js` contiennent le contenu pédagogique rédigé : explications, quiz et exercices pratiques.
- `data/glossaire.js` explique chaque mot du code, et `data/mots.js`, généré par `node outils/generer-mots.mjs`, indique où chacun apparaît pour la première fois. `data/traces.js`, généré par `TZ=UTC node outils/generer-traces.mjs`, contient l'exécution réelle de chaque exercice, étape par étape.

Ce dépôt contient le fichier `data/sources.js` déjà généré. Pour le régénérer avec `npm run sources`, le dossier du projet doit se trouver à côté des dossiers `src/` et `docs/` d'origine.

## Vérifier les contenus

```bash
npm run verifier
```

Ce contrôle confirme que chaque ligne et chaque mot du code sont expliqués, exécute les questions de prédiction, compile les questions d'erreur avec le code annoncé, et s'assure que chaque solution pratique réussit et que chaque code de départ échoue.

## Sans connexion

Après une première visite avec Internet, un service (`sw.js`) garde le site sur l'appareil : cours, quiz, éditeur et compilateur fonctionnent sans connexion, et la plateforme s'installe comme une application. La progression est envoyée au compte au retour de la connexion. Après toute modification du site, relancez `npm run hors-ligne`, sinon les visiteurs garderont l'ancienne version.

## Comptes

Les comptes s'activent avec Supabase : voir [supabase/GUIDE.md](supabase/GUIDE.md). Un compte devient obligatoire 5 minutes après la première visite. Sans configuration, ou si le service est indisponible, tout fonctionne dans le navigateur.

Ce blocage s'exécute dans le navigateur : il arrête un visiteur ordinaire, mais une personne technique peut le contourner, car les fichiers du site sont publics.

## Organisation

| Dossier ou fichier | Rôle |
| --- | --- |
| `js/app.js` | navigation et cadre des pages |
| `js/vues-generales.js` | tableau de bord, modules, liste, progression |
| `js/vues-exercice.js` | cours, quiz, pratique |
| `js/quiz-core.js` | calcul des scores |
| `js/notions.js` | détection des notions fragiles |
| `js/store.js` | sauvegarde dans `localStorage` |
| `js/editeur.js` | éditeur de code |
| `js/ts-core.js`, `js/ts-worker.js`, `js/verificateur.js` | compilation et exécution du code de l'apprenant |
| `vendor/` | TypeScript 5.9 et polices, pour fonctionner hors ligne |
| `outils/` | génération des sources et vérification des contenus |

# La Bibliothèque de Swann’Oa

Application Next.js (TypeScript, Tailwind) connectée à ton backend PocketBase
existant (« Acme ») : bibliothèque de livres, personnages, arcs narratifs,
statuts, classements et statistiques de lecture.

## Prérequis

- Node.js 20+
- Le serveur PocketBase accessible depuis la machine qui lance l'app

## Configuration

1. Installe les dépendances :

   ```bash
   npm install
   ```

2. Renseigne l'URL de ton PocketBase dans `.env.local` :

   ```
   NEXT_PUBLIC_POCKETBASE_URL=/pb
   POCKETBASE_UPSTREAM_URL=http://86.215.21.247:4242
   ```

   Le navigateur ne parle qu'à `/pb` (même origine) ; Next.js redirige ça
   côté serveur vers `POCKETBASE_UPSTREAM_URL` (voir `next.config.ts`). Ça
   évite qu'un navigateur bloque un PocketBase en HTTP comme contenu mixte
   sur une page servie en HTTPS, sans avoir à mettre du TLS sur PocketBase
   lui-même. `POCKETBASE_UPSTREAM_URL` ne doit **jamais** avoir le préfixe
   `NEXT_PUBLIC_` — sinon il finirait dans le bundle envoyé au navigateur.

3. Lance le serveur de développement :

   ```bash
   npm run dev
   ```

   L'app est disponible sur http://localhost:3000. Connecte-toi avec un des
   deux comptes existants dans PocketBase (Erwann / Charlène).

## Déploiement (ex. Vercel)

- Ajoute les deux variables d'environnement dans les réglages du projet
  Vercel : `NEXT_PUBLIC_POCKETBASE_URL=/pb` et `POCKETBASE_UPSTREAM_URL`
  pointant vers l'URL **publique** de ton PocketBase (indispensable :
  Vercel ne peut pas atteindre une IP locale comme `192.168.x.x`).
- Après tout changement de variable d'environnement, redéploie **sans**
  réutiliser le build cache — `NEXT_PUBLIC_*` est figé dans le JS au moment
  du build, pas lu au runtime.
- `npm run build` doit passer sans erreur (déjà vérifié).

## Ce qui a été configuré côté PocketBase

Les règles d'API de chaque collection ont été mises à jour pour fonctionner
avec une connexion utilisateur normale (au lieu d'un accès superuser) :

- `books`, `books_characters`, `books_storylines` : accès limité au
  propriétaire (`user = @request.auth.id`, ou via la relation `book.user`).
- `authors`, `series`, `genres`, `characters`, `storylines`, `status`,
  `rankings` : lecture/écriture pour tout utilisateur connecté (données de
  référence partagées entre les deux comptes).
- `users` : règles par défaut de PocketBase (chacun ne voit que son propre
  profil).

## Structure du projet

- `src/lib/pocketbase.ts` — client PocketBase (singleton côté navigateur).
- `src/lib/data.ts` — toutes les fonctions d'accès aux données (CRUD).
- `src/contexts/AuthContext.tsx` — état de connexion (basé sur le store
  d'authentification de PocketBase).
- `src/app/login` — page de connexion.
- `src/app/(app)` — zone protégée : bibliothèque, fiche livre, formulaires
  d'ajout/édition, statistiques.

## Accessibilité

L'interface suit quelques principes volontairement stricts : navigation au
clavier avec focus visible partout, libellés explicites sur tous les champs,
zones d'erreur en `role="alert"`/`aria-live`, lien d'évitement vers le
contenu principal, contrastes vérifiés en mode clair et sombre.

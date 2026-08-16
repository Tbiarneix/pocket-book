# Journal de lecture

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
   NEXT_PUBLIC_POCKETBASE_URL=http://192.168.3.12:4242
   ```

   Remplace cette valeur par l'URL publique une fois que tu auras exposé
   PocketBase (tunnel, reverse proxy, port forwarding + domaine).

3. Lance le serveur de développement :

   ```bash
   npm run dev
   ```

   L'app est disponible sur http://localhost:3000. Connecte-toi avec un des
   deux comptes existants dans PocketBase (Erwann / Charlène).

## Déploiement (ex. Vercel)

- Ajoute la variable d'environnement `NEXT_PUBLIC_POCKETBASE_URL` dans les
  réglages du projet Vercel, pointant vers l'URL **publique** de ton
  PocketBase (indispensable : Vercel ne peut pas atteindre une IP locale
  comme `192.168.x.x`).
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

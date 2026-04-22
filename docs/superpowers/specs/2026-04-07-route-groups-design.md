# Route Groups Restructuration — Zynth App

**Date:** 2026-04-07
**Statut:** Approuvé

## Objectif

Séparer le site vitrine marketing de la Web App ERP en utilisant les Route Groups de Next.js, sans modifier les URLs publiques ni casser le design existant. Mettre en place la protection NextAuth v5 sur la zone applicative.

## Arborescence cible

```
src/
├── app/
│   ├── layout.tsx                          ← ROOT LAYOUT (minimal)
│   ├── globals.css
│   ├── favicon.ico
│   │
│   ├── (marketing)/
│   │   ├── layout.tsx                      ← Navbar + Footer marketing
│   │   ├── page.tsx                        ← / (Home)
│   │   ├── produit/page.tsx
│   │   ├── pricing/page.tsx
│   │   └── contact/page.tsx
│   │
│   ├── (app)/
│   │   ├── layout.tsx                      ← Sidebar basique + auth check server-side
│   │   └── dashboard/
│   │       └── page.tsx                    ← Placeholder dashboard
│   │
│   └── (auth)/
│       └── login/
│           └── page.tsx                    ← Page login placeholder
│
├── components/
│   └── Navbar.tsx                          ← Bouton "Connexion" → Link /auth/login
│
├── middleware.ts                           ← Protège /dashboard/* à l'Edge
└── src/lib/auth.ts                         ← Config NextAuth v5 + PrismaAdapter
    src/app/api/auth/[...nextauth]/route.ts ← Handler NextAuth
```

## Contraintes techniques

- **Next.js 16.2.2** — Route Groups supportés, un seul root layout requis avec `<html>` et `<body>`
- **next-auth v5 beta.30** — API `auth()` importée depuis `@/lib/auth`, pas depuis `next-auth`
- **Prisma v6 + SQLite** — PrismaAdapter déjà compatible, schéma déjà migré
- **React 19** — Server Components par défaut, `"use client"` explicite où nécessaire

## Root Layout (minimal)

`app/layout.tsx` ne contient QUE :
- Les balises `<html lang="fr">` et `<body>`
- L'import de `globals.css`
- Les métadonnées globales (`Metadata`)
- Aucune navigation, aucun footer

## Layout marketing

`app/(marketing)/layout.tsx` reprend exactement le contenu actuel de `app/layout.tsx` SANS les balises `<html>` et `<body>` — uniquement le `<Navbar />`, le `<div className="flex-grow pt-20">` et le `<footer>`.

## Layout app

`app/(app)/layout.tsx` :
- Server Component
- Appelle `auth()` depuis `@/lib/auth` — redirige vers `/auth/login` si pas de session
- Rend une sidebar basique (liens : Dashboard, etc.)
- Pas de `<html>/<body>` (géré par le root layout)

## Stratégie auth (Approche C — Middleware + Layout)

### Middleware (`src/middleware.ts`)
- Intercepte toutes requêtes vers `/dashboard` et sous-routes
- Vérifie la session NextAuth v5 à l'Edge
- Redirige vers `/auth/login` si non authentifié
- Matcher : `['/dashboard/:path*']`

### Layout server-side (`(app)/layout.tsx`)
- Deuxième couche de vérification avec `auth()`
- Accès aux données de session pour les passer aux enfants
- Protège contre les edge cases du middleware

### Config NextAuth (`src/lib/auth.ts`)
- Provider : `Credentials` (email + bcrypt password)
- Adapter : `PrismaAdapter` depuis `@auth/prisma-adapter`
- Session strategy : `jwt` (compatible Edge middleware)
- Callbacks : `session` et `jwt` pour exposer `userId`

### Handler API (`src/app/api/auth/[...nextauth]/route.ts`)
- Exporte `GET` et `POST` depuis `handlers` de la config auth

## Composant Navbar

Le bouton "Connexion" est converti de `<button>` en `<Link href="/auth/login">` de Next.js, en conservant le style Tailwind existant.

## URLs — aucun changement

| Route Group | URL finale | Inchangée ? |
|-------------|------------|-------------|
| `(marketing)/page.tsx` | `/` | ✅ |
| `(marketing)/produit/page.tsx` | `/produit` | ✅ |
| `(marketing)/pricing/page.tsx` | `/pricing` | ✅ |
| `(marketing)/contact/page.tsx` | `/contact` | ✅ |
| `(app)/dashboard/page.tsx` | `/dashboard` | Nouveau |
| `(auth)/login/page.tsx` | `/auth/login` | Nouveau |

## Ce qui n'est PAS dans ce spec

- Design du dashboard (sidebar complète, widgets)
- Formulaire de login fonctionnel complet
- Page register / forgot-password
- Logique métier ERP

Ces éléments font partie des phases suivantes du projet.

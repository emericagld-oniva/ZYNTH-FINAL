# Route Groups Restructuration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganize `src/app/` into `(marketing)`, `(app)`, and `(auth)` route groups while wiring up NextAuth v5 middleware protection on the app zone.

**Architecture:** A minimal root layout owns `<html>/<body>` and global CSS. Each route group gets its own nested layout — `(marketing)` adds Navbar + Footer, `(app)` adds a sidebar and server-side auth guard, `(auth)` is bare. A Next.js Edge middleware provides fast redirect for unauthenticated requests to `/dashboard`.

**Tech Stack:** Next.js 16.2.2 App Router, next-auth v5 beta.30, @auth/prisma-adapter v2, Prisma v6, bcryptjs, TypeScript, Tailwind CSS 4

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `src/app/layout.tsx` | Minimal root: `<html>`, `<body>`, globals.css, metadata |
| Create | `src/app/(marketing)/layout.tsx` | Navbar + Footer wrapper for public pages |
| Move | `src/app/page.tsx` → `src/app/(marketing)/page.tsx` | Home page |
| Move | `src/app/produit/page.tsx` → `src/app/(marketing)/produit/page.tsx` | Produit page |
| Move | `src/app/pricing/page.tsx` → `src/app/(marketing)/pricing/page.tsx` | Pricing page |
| Move | `src/app/contact/page.tsx` → `src/app/(marketing)/contact/page.tsx` | Contact page |
| Modify | `src/components/Navbar.tsx` | Convert `<button>` → `<Link href="/auth/login">` |
| Create | `src/lib/prisma.ts` | Prisma client singleton |
| Create | `src/lib/auth.ts` | NextAuth v5 config (Credentials + PrismaAdapter + JWT) |
| Create | `src/app/api/auth/[...nextauth]/route.ts` | NextAuth GET/POST handler |
| Create | `src/middleware.ts` | Edge middleware: redirect `/dashboard/*` if no session |
| Create | `src/app/(app)/layout.tsx` | App shell: sidebar + server-side auth check |
| Create | `src/app/(app)/dashboard/page.tsx` | Dashboard placeholder |
| Create | `src/app/(auth)/login/page.tsx` | Login page placeholder |

---

### Task 1: Slim down the root layout

**Files:**
- Modify: `src/app/layout.tsx`

The root layout must keep `<html>` and `<body>` (Next.js requirement) but shed the Navbar/Footer — those move to `(marketing)/layout.tsx`.

- [ ] **Step 1: Replace root layout content**

```tsx
// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zynth App | Le moteur de gestion nouvelle génération",
  description: "CRM, Finances, Projets et Automatisation dans une seule interface élégante.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="bg-[#050505] text-white selection:bg-orange-500/30 overflow-x-hidden font-sans">
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors related to `layout.tsx`

---

### Task 2: Create (marketing) folder and its layout

**Files:**
- Create: `src/app/(marketing)/layout.tsx`

This layout wraps all public pages with the existing Navbar and Footer. It is NOT a root layout (no `<html>/<body>`).

- [ ] **Step 1: Create the marketing layout**

```tsx
// src/app/(marketing)/layout.tsx
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="flex-grow pt-20">
        {children}
      </div>

      <footer className="border-t border-white/5 bg-[#020202] pt-20 pb-12 px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <Link href="/">
            <img src="/ZYNTH-APP.svg" alt="Logo Zynth" className="h-6 w-auto opacity-70 hover:opacity-100 transition-opacity" />
          </Link>

          <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-500">
            <Link href="/produit" className="hover:text-white transition-colors">Produit</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Tarifs</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
            <a href="https://instagram.com/zynth.app" target="_blank" className="font-medium hover:text-orange-500 transition-colors">@zynth.app</a>
          </div>
        </div>
        <div className="text-center text-xs text-gray-700 mt-12">
          © 2026 Zynth App. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}
```

---

### Task 3: Move marketing pages into (marketing)/

**Files:**
- Create: `src/app/(marketing)/page.tsx` (content from `src/app/page.tsx`)
- Create: `src/app/(marketing)/produit/page.tsx` (content from `src/app/produit/page.tsx`)
- Create: `src/app/(marketing)/pricing/page.tsx` (content from `src/app/pricing/page.tsx`)
- Create: `src/app/(marketing)/contact/page.tsx` (content from `src/app/contact/page.tsx`)
- Delete: `src/app/page.tsx`
- Delete: `src/app/produit/page.tsx`
- Delete: `src/app/pricing/page.tsx`
- Delete: `src/app/contact/page.tsx`

Route groups are transparent to URLs: `(marketing)/page.tsx` still serves `/`, `(marketing)/produit/page.tsx` still serves `/produit`, etc.

- [ ] **Step 1: Copy Home page**

Create `src/app/(marketing)/page.tsx` with the exact same content as the current `src/app/page.tsx` (the full file starting with `"use client";` and all imports from framer-motion, lucide-react, next/link).

- [ ] **Step 2: Copy Produit page**

Create `src/app/(marketing)/produit/page.tsx` with the exact same content as `src/app/produit/page.tsx`.

- [ ] **Step 3: Copy Pricing page**

Create `src/app/(marketing)/pricing/page.tsx` with the exact same content as `src/app/pricing/page.tsx`.

- [ ] **Step 4: Copy Contact page**

Create `src/app/(marketing)/contact/page.tsx` with the exact same content as `src/app/contact/page.tsx`.

- [ ] **Step 5: Delete the old page files**

```bash
rm src/app/page.tsx
rm src/app/produit/page.tsx
rmdir src/app/produit
rm src/app/pricing/page.tsx
rmdir src/app/pricing
rm src/app/contact/page.tsx
rmdir src/app/contact
```

- [ ] **Step 6: Start dev server and verify all routes load**

Run: `npm run dev`
Check in browser:
- `http://localhost:3000/` → Home page renders with Navbar + Footer
- `http://localhost:3000/produit` → Produit page renders
- `http://localhost:3000/pricing` → Pricing page renders
- `http://localhost:3000/contact` → Contact page renders

- [ ] **Step 7: Commit**

```bash
git add src/app/layout.tsx src/app/(marketing)/
git rm src/app/page.tsx src/app/produit/page.tsx src/app/pricing/page.tsx src/app/contact/page.tsx
git commit -m "refactor(routing): introduce (marketing) route group, slim root layout"
```

---

### Task 4: Update Navbar — button → Link

**Files:**
- Modify: `src/components/Navbar.tsx`

The "Connexion" `<button>` becomes a `<Link href="/auth/login">` while keeping the exact same Tailwind classes.

- [ ] **Step 1: Replace the button with a Link**

In `src/components/Navbar.tsx`, replace:
```tsx
<button className="px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/5 text-sm font-semibold transition-all">
    Connexion
</button>
```

With:
```tsx
<Link href="/auth/login" className="px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/5 text-sm font-semibold transition-all">
    Connexion
</Link>
```

`Link` is already imported at the top of `Navbar.tsx`.

- [ ] **Step 2: Verify Navbar renders and button navigates**

In the running dev server, click "Connexion" in the Navbar. Browser should navigate to `/auth/login` (404 for now, that's expected — page comes in Task 7).

- [ ] **Step 3: Commit**

```bash
git add src/components/Navbar.tsx
git commit -m "feat(navbar): convert Connexion button to Link /auth/login"
```

---

### Task 5: Create Prisma client singleton

**Files:**
- Create: `src/lib/prisma.ts`

Prevents multiple Prisma client instances in development (Next.js hot-reload creates new module instances on each reload).

- [ ] **Step 1: Create the singleton**

```ts
// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors

---

### Task 6: Configure NextAuth v5

**Files:**
- Create: `src/lib/auth.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`

next-auth v5 centralises config in one file and exports `{ handlers, auth, signIn, signOut }`. The `auth()` function is used both server-side (in layouts/pages) and as middleware.

**Important for this version:** `session: { strategy: "jwt" }` is required when using middleware at the Edge — the database adapter cannot run at the Edge, but JWT tokens can.

- [ ] **Step 1: Create the auth config**

```ts
// src/lib/auth.ts
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.hashedPassword) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.hashedPassword
        );

        if (!isValid) return null;

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
```

- [ ] **Step 2: Create the API route handler**

```ts
// src/app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors. If you see "Module not found: @/lib/prisma", confirm `src/lib/prisma.ts` exists from Task 5.

- [ ] **Step 4: Commit**

```bash
git add src/lib/auth.ts src/lib/prisma.ts src/app/api/
git commit -m "feat(auth): configure NextAuth v5 with Credentials provider and PrismaAdapter"
```

---

### Task 7: Create Edge middleware

**Files:**
- Create: `src/middleware.ts`

Must live at `src/middleware.ts` (project root of `src/`). The `auth()` function from next-auth v5 can act directly as middleware — when called with a callback, it runs that callback only for matched routes.

- [ ] **Step 1: Create the middleware**

```ts
// src/middleware.ts
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  if (!req.auth) {
    const loginUrl = new URL("/auth/login", req.url);
    return NextResponse.redirect(loginUrl);
  }
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
```

- [ ] **Step 2: Verify middleware is picked up**

Restart dev server (`npm run dev`). Navigate to `http://localhost:3000/dashboard`. You should be redirected to `/auth/login` (404 until Task 8 — redirection itself is what we're testing here).

- [ ] **Step 3: Commit**

```bash
git add src/middleware.ts
git commit -m "feat(auth): add Edge middleware to protect /dashboard routes"
```

---

### Task 8: Create (auth) group and login placeholder

**Files:**
- Create: `src/app/(auth)/login/page.tsx`

The `(auth)` group has no layout file — it inherits the minimal root layout directly. The login page is a placeholder for now.

- [ ] **Step 1: Create the login placeholder**

```tsx
// src/app/(auth)/login/page.tsx
export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="p-10 rounded-3xl bg-[#0a0a0a] border border-white/10 text-center max-w-md w-full mx-4">
        <h1 className="text-3xl font-bold mb-2">Connexion</h1>
        <p className="text-gray-400 text-sm">Le formulaire de connexion sera implémenté prochainement.</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify the page renders**

Navigate to `http://localhost:3000/auth/login`. Should show the placeholder card. Clicking "Connexion" in the Navbar should now reach this page.

- [ ] **Step 3: Commit**

```bash
git add src/app/(auth)/
git commit -m "feat(auth): add /auth/login placeholder page"
```

---

### Task 9: Create (app) group — sidebar layout + dashboard

**Files:**
- Create: `src/app/(app)/layout.tsx`
- Create: `src/app/(app)/dashboard/page.tsx`

The layout is a Server Component: it calls `auth()` and redirects if there's no session (second layer of protection after middleware). It also renders a basic sidebar.

- [ ] **Step 1: Create the app layout with sidebar and auth guard**

```tsx
// src/app/(app)/layout.tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, LogOut } from "lucide-react";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0a0a0a] border-r border-white/5 flex flex-col p-6 shrink-0">
        <Link href="/" className="mb-10 block">
          <img src="/ZYNTH-APP.svg" alt="Logo Zynth" className="h-7 w-auto" />
        </Link>

        <nav className="flex flex-col gap-1 flex-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
        </nav>

        <div className="border-t border-white/5 pt-6">
          <p className="text-xs text-gray-600 mb-3 px-4">{session.user?.email}</p>
          <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-500 hover:text-red-400 hover:bg-red-500/5 transition-all w-full">
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Create the dashboard placeholder**

```tsx
// src/app/(app)/dashboard/page.tsx
export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
      <p className="text-gray-400">Votre espace de travail Zynth. À construire.</p>
    </div>
  );
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/(app)/
git commit -m "feat(app): add (app) route group with sidebar layout and dashboard placeholder"
```

---

### Task 10: Final verification

- [ ] **Step 1: Run a full build**

Run: `npm run build`
Expected: Build completes with no errors. You'll see routes listed including `/(marketing)` group pages serving `/`, `/produit`, `/pricing`, `/contact`.

- [ ] **Step 2: Smoke-test all routes in dev**

Run: `npm run dev` and verify:

| URL | Expected result |
|-----|-----------------|
| `http://localhost:3000/` | Home page with Navbar + Footer |
| `http://localhost:3000/produit` | Produit page with Navbar + Footer |
| `http://localhost:3000/pricing` | Pricing page with Navbar + Footer |
| `http://localhost:3000/contact` | Contact page with Navbar + Footer |
| `http://localhost:3000/auth/login` | Login placeholder, no Navbar/Footer |
| `http://localhost:3000/dashboard` | Redirected to `/auth/login` (not authenticated) |
| Navbar "Connexion" click | Navigates to `/auth/login` |

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "chore: complete route groups restructuration — marketing/app/auth separation"
```

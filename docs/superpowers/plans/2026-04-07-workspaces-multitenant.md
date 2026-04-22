# Multi-Tenant Workspaces Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor ZYNTH-APP into a multi-tenant B2B SaaS: users select a Company workspace after login, and all CRM data is scoped to the active company.

**Architecture:** After login, users land on `/workspaces` (company selector). Clicking a company enters `/[companyId]/dashboard` with a company-aware sidebar. The `(app)` layout becomes a pure auth guard; company-scoped layout lives at `(app)/[companyId]/layout.tsx` with membership verification. `Client` records are linked to `Company`, not `User`.

**Tech Stack:** Next.js 16.2.2 App Router (params as Promise), Prisma v6 SQLite, NextAuth v5 beta, framer-motion, Tailwind CSS 4.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `prisma/schema.prisma` | Remove CO_FOUNDER + Company.slug, pivot Client from User to Company |
| Modify | `src/lib/actions/auth.ts` | redirectTo `/workspaces` instead of `/dashboard` |
| Modify | `src/app/(app)/layout.tsx` | Auth guard only — no sidebar |
| Modify | `src/app/(app)/dashboard/page.tsx` | Redirect to `/workspaces` |
| Modify | `src/components/app-sidebar.tsx` | Accept companyId + companyName, company-relative links |
| Modify | `src/lib/actions/crm.ts` | Use companyId (hidden input) instead of userId |
| Modify | `src/app/(app)/clients/shell.tsx` | Accept companyId prop |
| Modify | `src/app/(app)/clients/client-modal.tsx` | Pass companyId as hidden input |
| Create | `src/lib/actions/company.ts` | createCompanyAction (creates Company + FOUNDER membership) |
| Create | `src/app/(app)/workspaces/page.tsx` | Server Component: fetch user's companies |
| Create | `src/app/(app)/workspaces/workspaces-shell.tsx` | Client Component: cards grid + create modal |
| Create | `src/app/(app)/[companyId]/layout.tsx` | Verify membership, render sidebar with company info |
| Create | `src/app/(app)/[companyId]/dashboard/page.tsx` | Company dashboard (real client count) |
| Create | `src/app/(app)/[companyId]/clients/page.tsx` | Fetch clients by companyId, render shell |

---

### Task 1: Update Prisma Schema

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Update the Role enum** — remove CO_FOUNDER

```prisma
enum Role {
  FOUNDER
  MANAGER
  EMPLOYEE
  INTERN
  GUEST
}
```

- [ ] **Step 2: Update the Company model** — remove `slug`, keep id/name/logoUrl/createdAt/updatedAt

```prisma
model Company {
  id        String   @id @default(cuid())
  name      String
  logoUrl   String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  members CompanyMember[]
  clients Client[]
}
```

- [ ] **Step 3: Update the Client model** — swap userId→companyId, update relation

Replace the entire Client model:
```prisma
model Client {
  id        String       @id @default(cuid())
  name      String
  email     String?
  company   String?
  status    ClientStatus @default(LEAD)

  companyId String
  workspace Company      @relation(fields: [companyId], references: [id], onDelete: Cascade)

  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt

  @@index([companyId])
}
```

Note: `company` (String?) is the client's company name (CRM field). `workspace` is the Zynth Company relation — different concepts.

- [ ] **Step 4: Update User model** — remove `clients Client[]` relation (now on Company)

```prisma
model User {
  id             String    @id @default(cuid())
  name           String?
  email          String    @unique
  emailVerified  DateTime?
  image          String?
  hashedPassword String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  accounts    Account[]
  sessions    Session[]
  memberships CompanyMember[]
}
```

- [ ] **Step 5: Push schema and regenerate client** (drop all data — dev only)

Kill dev server first if running:
```bash
powershell -Command "Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force"
```

Then:
```bash
npx prisma db push --force-reset
npx prisma generate
```

Expected: `✔ Generated Prisma Client (v6.x.x)`

- [ ] **Step 6: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat(schema): pivot Client to Company, remove CO_FOUNDER and Company.slug"
```

---

### Task 2: Update Auth Redirect + App Layout

**Files:**
- Modify: `src/lib/actions/auth.ts` line 28
- Modify: `src/app/(app)/layout.tsx`
- Modify: `src/app/(app)/dashboard/page.tsx`

- [ ] **Step 1: Change login redirectTo**

In `src/lib/actions/auth.ts`, change:
```ts
redirectTo: "/dashboard",
```
to:
```ts
redirectTo: "/workspaces",
```

- [ ] **Step 2: Strip sidebar from (app) layout**

Replace entire `src/app/(app)/layout.tsx`:
```tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");
  return <>{children}</>;
}
```

- [ ] **Step 3: Redirect old /dashboard to /workspaces**

Replace entire `src/app/(app)/dashboard/page.tsx`:
```tsx
import { redirect } from "next/navigation";
export default function DashboardPage() {
  redirect("/workspaces");
}
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/actions/auth.ts src/app/(app)/layout.tsx src/app/(app)/dashboard/page.tsx
git commit -m "feat(routing): redirect post-login to /workspaces, strip sidebar from app layout"
```

---

### Task 3: Company Server Action

**Files:**
- Create: `src/lib/actions/company.ts`

- [ ] **Step 1: Create the action file**

```ts
"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export type CompanyState = { error?: string } | null;

export async function createCompanyAction(
  _prevState: CompanyState,
  formData: FormData
): Promise<CompanyState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Non autorisé." };

  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "Le nom de l'entreprise est requis." };

  const company = await prisma.company.create({
    data: {
      name,
      members: {
        create: {
          userId: session.user.id,
          role: "FOUNDER",
        },
      },
    },
  });

  redirect(`/${company.id}/dashboard`);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/actions/company.ts
git commit -m "feat(company): add createCompanyAction with FOUNDER membership"
```

---

### Task 4: Workspaces Page

**Files:**
- Create: `src/app/(app)/workspaces/page.tsx`
- Create: `src/app/(app)/workspaces/workspaces-shell.tsx`

- [ ] **Step 1: Create the Server Component**

```tsx
// src/app/(app)/workspaces/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import WorkspacesShell from "./workspaces-shell";

export default async function WorkspacesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const memberships = await prisma.companyMember.findMany({
    where: { userId: session.user.id },
    include: { company: true },
    orderBy: { joinedAt: "asc" },
  });

  return (
    <WorkspacesShell
      memberships={memberships.map((m) => ({
        companyId: m.companyId,
        companyName: m.company.name,
        role: m.role,
        joinedAt: m.joinedAt,
      }))}
      userName={session.user.name ?? session.user.email ?? ""}
    />
  );
}
```

- [ ] **Step 2: Create the Client Component shell**

```tsx
// src/app/(app)/workspaces/workspaces-shell.tsx
"use client";

import { useState, useActionState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { createCompanyAction, type CompanyState } from "@/lib/actions/company";
import { Plus, Building2, ArrowRight, Loader2, AlertCircle, X, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

const ROLE_LABELS: Record<string, string> = {
  FOUNDER:  "Fondateur",
  MANAGER:  "Manager",
  EMPLOYEE: "Employé",
  INTERN:   "Stagiaire",
  GUEST:    "Invité",
};

const ROLE_COLORS: Record<string, string> = {
  FOUNDER:  "text-orange-400 bg-orange-400/10 border-orange-400/20",
  MANAGER:  "text-sky-400    bg-sky-400/10    border-sky-400/20",
  EMPLOYEE: "text-gray-400   bg-gray-400/10   border-gray-400/20",
  INTERN:   "text-gray-500   bg-gray-500/10   border-gray-500/20",
  GUEST:    "text-gray-600   bg-gray-600/10   border-gray-600/20",
};

interface Membership {
  companyId: string;
  companyName: string;
  role: string;
  joinedAt: Date;
}

function CreateModal({ onClose }: { onClose: () => void }) {
  const [state, action, pending] = useActionState<CompanyState, FormData>(
    createCompanyAction,
    null
  );

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center px-4"
        onClick={onClose}
      >
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.97, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 8 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-[#0c0c0c]/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/60"
        >
          <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-white/[0.06]">
            <div>
              <h2 className="text-base font-semibold text-white">Créer un espace de travail</h2>
              <p className="text-xs text-gray-500 mt-0.5">Vous en serez le Fondateur.</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/[0.07] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form action={action} className="px-6 py-6 space-y-4">
            {state?.error && (
              <div className="flex items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-500/[0.07] px-4 py-3 text-sm text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {state.error}
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">
                Nom de l'entreprise <span className="text-orange-400">*</span>
              </label>
              <input
                name="name"
                type="text"
                placeholder="Acme Inc."
                required
                autoFocus
                disabled={pending}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder-gray-600 outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all disabled:opacity-50"
              />
            </div>
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                disabled={pending}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-500 border border-white/[0.07] hover:text-white hover:bg-white/[0.05] transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={pending}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-sm font-semibold text-white transition-colors disabled:opacity-60"
              >
                {pending ? <><Loader2 className="w-4 h-4 animate-spin" />Création…</> : "Créer"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function WorkspacesShell({
  memberships,
  userName,
}: {
  memberships: Membership[];
  userName: string;
}) {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="min-h-screen bg-[#050505] relative overflow-hidden">
      {/* Ambient */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(249,115,22,0.06) 0%, transparent 60%)" }} />

      {/* Top bar */}
      <div className="flex items-center justify-between px-8 pt-6">
        <Link href="/">
          <Image src="/ZYNTH-APP.svg" alt="Zynth" width={80} height={20} className="h-5 w-auto opacity-75 hover:opacity-100 transition-opacity" />
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-gray-600 hover:text-red-400 hover:bg-red-500/[0.06] transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Déconnexion
        </button>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 pt-20 pb-16">
        <div className="mb-10">
          <p className="text-xs font-medium uppercase tracking-widest text-gray-600 mb-2">
            Bonjour, {userName}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Vos espaces de travail
          </h1>
          <p className="mt-1.5 text-sm text-gray-500">
            {memberships.length === 0
              ? "Créez votre premier espace pour commencer."
              : "Sélectionnez une entreprise pour continuer."}
          </p>
        </div>

        {/* Grid */}
        {memberships.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {memberships.map((m, i) => (
              <motion.div
                key={m.companyId}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.22 }}
              >
                <Link
                  href={`/${m.companyId}/dashboard`}
                  className="group block rounded-2xl border border-white/[0.07] bg-white/[0.025] backdrop-blur-sm p-6 hover:border-orange-500/30 hover:bg-white/[0.04] transition-all duration-200 shadow-lg shadow-black/10"
                >
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-lg font-bold text-orange-400">
                      {m.companyName.charAt(0).toUpperCase()}
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all duration-150" />
                  </div>
                  <p className="text-sm font-semibold text-white mb-2">{m.companyName}</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${ROLE_COLORS[m.role] ?? ROLE_COLORS.GUEST}`}>
                    {ROLE_LABELS[m.role] ?? m.role}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Create button */}
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl border border-dashed border-white/[0.12] text-sm font-medium text-gray-500 hover:text-white hover:border-orange-500/30 hover:bg-orange-500/[0.04] transition-all duration-150 w-full justify-center"
        >
          <Plus className="w-4 h-4" />
          Créer une entreprise
        </button>
      </div>

      {/* Create modal */}
      {showCreate && <CreateModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
```

- [ ] **Step 3: Verify build passes**

```bash
npm run build
```
Expected: `/workspaces` shows as `ƒ Dynamic` in route list.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(app)/workspaces/"
git commit -m "feat(workspaces): add workspace selector page with company cards and create modal"
```

---

### Task 5: Company-Scoped Layout + Sidebar

**Files:**
- Create: `src/app/(app)/[companyId]/layout.tsx`
- Modify: `src/components/app-sidebar.tsx`

- [ ] **Step 1: Update AppSidebar to accept companyId + companyName**

Replace `src/components/app-sidebar.tsx`:

```tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Settings, UsersRound, LogOut, Building2 } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface AppSidebarProps {
  companyId: string;
  companyName: string;
  userEmail?: string | null;
}

export function AppSidebar({ companyId, companyName, userEmail }: AppSidebarProps) {
  const pathname = usePathname();

  const NAV_ITEMS = [
    { href: `/${companyId}/dashboard`, label: "Dashboard",   icon: LayoutDashboard },
    { href: `/${companyId}/clients`,   label: "Clients",     icon: UsersRound },
    { href: `/${companyId}/settings`,  label: "Paramètres",  icon: Settings },
  ];

  return (
    <aside className="w-60 h-screen sticky top-0 flex flex-col shrink-0 bg-[#080808] border-r border-white/[0.05]">

      {/* Company header */}
      <div className="px-4 pt-5 pb-4 border-b border-white/[0.04]">
        <Link
          href="/workspaces"
          className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-white/[0.04] transition-colors group"
          title="Changer d'espace"
        >
          <div className="w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0 text-xs font-bold text-orange-400">
            {companyName.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium text-gray-300 truncate group-hover:text-white transition-colors">
            {companyName}
          </span>
          <Building2 className="w-3.5 h-3.5 text-gray-700 shrink-0 ml-auto group-hover:text-gray-500 transition-colors" />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <motion.div
              key={item.href}
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <Link
                href={item.href}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 ${
                  isActive
                    ? "text-orange-300 bg-orange-500/[0.08] border border-orange-500/[0.18]"
                    : "text-gray-500 hover:text-gray-200 hover:bg-white/[0.04] border border-transparent"
                }`}
              >
                <item.icon className={`w-4 h-4 shrink-0 ${isActive ? "text-orange-400" : ""}`} />
                {item.label}
                <AnimatePresence>
                  {isActive && (
                    <motion.span
                      key="dot"
                      layoutId="sidebar-active-dot"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-400"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      transition={{ duration: 0.15 }}
                    />
                  )}
                </AnimatePresence>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-3 pb-5 pt-3 border-t border-white/[0.04]">
        {userEmail && (
          <p className="px-3 mb-2 text-xs text-gray-600 truncate" title={userEmail}>
            {userEmail}
          </p>
        )}
        <motion.button
          whileHover={{ x: 3 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 border border-transparent hover:text-red-400 hover:bg-red-500/[0.06] hover:border-red-500/[0.12] transition-colors duration-150"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Déconnexion
        </motion.button>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Create the company-scoped layout**

Create `src/app/(app)/[companyId]/layout.tsx`:

```tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";

export default async function CompanyLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ companyId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { companyId } = await params;

  const membership = await prisma.companyMember.findUnique({
    where: {
      userId_companyId: {
        userId: session.user.id,
        companyId,
      },
    },
    include: { company: true },
  });

  if (!membership) redirect("/workspaces");

  return (
    <div className="flex min-h-screen bg-[#050505]">
      <AppSidebar
        companyId={companyId}
        companyName={membership.company.name}
        userEmail={session.user.email}
      />
      <main className="flex-1 overflow-auto min-w-0">
        {children}
      </main>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/app-sidebar.tsx "src/app/(app)/[companyId]/layout.tsx"
git commit -m "feat(layout): company-scoped layout with sidebar company header and membership guard"
```

---

### Task 6: Company Dashboard

**Files:**
- Create: `src/app/(app)/[companyId]/dashboard/page.tsx`

- [ ] **Step 1: Create the company dashboard**

```tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
  TrendingUp, TrendingDown, Users, DollarSign,
  FolderKanban, CheckCircle2
} from "lucide-react";

const ACCENT_CLASSES = {
  orange:  { icon: "text-orange-400",  glow: "bg-orange-500/[0.08]",  border: "border-orange-500/[0.12]",  badge: "text-orange-400  bg-orange-400/10"  },
  emerald: { icon: "text-emerald-400", glow: "bg-emerald-500/[0.07]", border: "border-emerald-500/[0.12]", badge: "text-emerald-400 bg-emerald-400/10" },
  sky:     { icon: "text-sky-400",     glow: "bg-sky-500/[0.07]",     border: "border-sky-500/[0.12]",     badge: "text-sky-400     bg-sky-400/10"     },
  violet:  { icon: "text-violet-400",  glow: "bg-violet-500/[0.07]",  border: "border-violet-500/[0.12]",  badge: "text-violet-400  bg-violet-400/10"  },
} as const;

export default async function CompanyDashboardPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { companyId } = await params;

  const [clientCount, company] = await Promise.all([
    prisma.client.count({ where: { companyId } }),
    prisma.company.findUnique({ where: { id: companyId }, select: { name: true } }),
  ]);

  if (!company) redirect("/workspaces");

  const now = new Date();
  const dateLabel = now.toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const STATS = [
    { label: "Clients",          value: clientCount.toString(), delta: "CRM",    trend: "up"   as const, icon: Users,         accent: "orange"  as const, sub: "dans ce workspace" },
    { label: "Revenus du mois",  value: "€0",                   delta: "+0%",    trend: "up"   as const, icon: DollarSign,    accent: "emerald" as const, sub: "à configurer"      },
    { label: "Projets en cours", value: "0",                    delta: "–",      trend: "down" as const, icon: FolderKanban,  accent: "sky"     as const, sub: "à configurer"      },
    { label: "Taux résolution",  value: "–",                    delta: "–",      trend: "up"   as const, icon: CheckCircle2,  accent: "violet"  as const, sub: "à configurer"      },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-10">
        <p className="text-xs font-medium uppercase tracking-widest text-gray-600 mb-2">{dateLabel}</p>
        <h1 className="text-3xl font-semibold tracking-tight text-white">Tableau de bord</h1>
        <p className="mt-1 text-sm text-gray-500">
          Bienvenue dans <span className="text-gray-300 font-medium">{company.name}</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map((stat) => {
          const colors = ACCENT_CLASSES[stat.accent];
          const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown;
          return (
            <div key={stat.label} className={`relative overflow-hidden rounded-2xl border ${colors.border} bg-white/[0.025] backdrop-blur-sm p-5 flex flex-col gap-4`}>
              <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl ${colors.glow} pointer-events-none`} />
              <div className="flex items-start justify-between">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colors.glow} border ${colors.border}`}>
                  <stat.icon className={`w-4 h-4 ${colors.icon}`} />
                </div>
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${colors.badge}`}>
                  <TrendIcon className="w-3 h-3" />{stat.delta}
                </span>
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight text-white tabular-nums">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
              </div>
              <p className="text-[11px] text-gray-700 border-t border-white/[0.04] pt-3 -mb-1">{stat.sub}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-2xl border border-white/[0.05] bg-white/[0.015] backdrop-blur-sm p-8 flex items-center justify-center min-h-48">
        <div className="text-center">
          <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center mx-auto mb-3">
            <FolderKanban className="w-5 h-5 text-gray-600" />
          </div>
          <p className="text-sm font-medium text-gray-500">Zone de contenu</p>
          <p className="text-xs text-gray-700 mt-1">Graphiques à venir.</p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add "src/app/(app)/[companyId]/dashboard/"
git commit -m "feat(dashboard): company-scoped dashboard with real client count"
```

---

### Task 7: Migrate CRM to Company Scope

**Files:**
- Modify: `src/lib/actions/crm.ts`
- Modify: `src/app/(app)/clients/shell.tsx`
- Modify: `src/app/(app)/clients/client-modal.tsx`
- Create: `src/app/(app)/[companyId]/clients/page.tsx`

- [ ] **Step 1: Update createClientAction to use companyId**

Replace `src/lib/actions/crm.ts`:

```ts
"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ClientStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export type CrmState = { error?: string; success?: boolean } | null;

const VALID_STATUSES = Object.values(ClientStatus);

export async function createClientAction(
  _prevState: CrmState,
  formData: FormData
): Promise<CrmState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Non autorisé." };

  const companyId = (formData.get("companyId") as string)?.trim();
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim() || null;
  const company = (formData.get("company") as string)?.trim() || null;
  const rawStatus = formData.get("status") as string;
  const status = VALID_STATUSES.includes(rawStatus as ClientStatus)
    ? (rawStatus as ClientStatus)
    : ClientStatus.LEAD;

  if (!companyId) return { error: "Workspace manquant." };
  if (!name) return { error: "Le nom du client est requis." };

  // Verify membership
  const membership = await prisma.companyMember.findUnique({
    where: { userId_companyId: { userId: session.user.id, companyId } },
  });
  if (!membership) return { error: "Accès refusé à ce workspace." };

  await prisma.client.create({
    data: {
      name,
      email: email ?? undefined,
      company: company ?? undefined,
      status,
      companyId,
    },
  });

  revalidatePath(`/${companyId}/clients`);
  revalidatePath(`/${companyId}/dashboard`);
  return { success: true };
}
```

- [ ] **Step 2: Update ClientModal to accept and pass companyId**

In `src/app/(app)/clients/client-modal.tsx`, add `companyId` prop to `ClientModalProps` and `DrawerForm`:

```tsx
interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (name: string) => void;
  companyId: string;  // ADD
}

function DrawerForm({
  onClose,
  onSuccess,
  companyId,  // ADD
}: {
  onClose: () => void;
  onSuccess: (name: string) => void;
  companyId: string;  // ADD
}) {
  // ... existing state ...
  
  // Inside the <form>, add before the fields section:
  // <input type="hidden" name="companyId" value={companyId} />
}
```

In the `ClientModal` component:
```tsx
export function ClientModal({ isOpen, onClose, onSuccess, companyId }: ClientModalProps) {
  // ...
  <DrawerForm onClose={onClose} onSuccess={onSuccess} companyId={companyId} />
}
```

- [ ] **Step 3: Update ClientsShell to accept and forward companyId**

In `src/app/(app)/clients/shell.tsx`, add `companyId` to the props interface and pass it to `ClientModal`:

```tsx
export default function ClientsShell({ clients, companyId }: { clients: Client[]; companyId: string }) {
  // ...
  <ClientModal
    isOpen={isModalOpen}
    onClose={() => setIsModalOpen(false)}
    onSuccess={handleSuccess}
    companyId={companyId}  // ADD
  />
```

- [ ] **Step 4: Create company-scoped clients page**

Create `src/app/(app)/[companyId]/clients/page.tsx`:

```tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ClientsShell from "@/app/(app)/clients/shell";

export default async function CompanyClientsPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { companyId } = await params;

  const membership = await prisma.companyMember.findUnique({
    where: { userId_companyId: { userId: session.user.id, companyId } },
  });
  if (!membership) redirect("/workspaces");

  const clients = await prisma.client.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
  });

  return <ClientsShell clients={clients} companyId={companyId} />;
}
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/actions/crm.ts "src/app/(app)/clients/" "src/app/(app)/[companyId]/clients/"
git commit -m "feat(crm): pivot Client from User to Company scope, update modal and shell"
```

---

### Task 8: Final Build Verification

- [ ] **Step 1: Full build**

```bash
npm run build
```

Expected route table includes:
```
ƒ /[companyId]/clients
ƒ /[companyId]/dashboard
ƒ /workspaces
○ /login
○ /register
```

- [ ] **Step 2: Smoke-test flow**

Start dev server (`npm run dev`) and verify:

| Step | URL | Expected |
|------|-----|----------|
| 1 | `/login` | Login form |
| 2 | After login | Redirect to `/workspaces` |
| 3 | `/workspaces` | Empty state + "Créer une entreprise" |
| 4 | Click "Créer" | Modal opens, submit creates company |
| 5 | After create | Redirect to `/[companyId]/dashboard` |
| 6 | `/[companyId]/dashboard` | Sidebar with company name, client count = 0 |
| 7 | Sidebar "Clients" | `/[companyId]/clients`, empty state |
| 8 | Add a client | Modal opens, submit → toast, client in table |
| 9 | `/workspaces` | Company card shows with "Fondateur" badge |

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat(workspaces): complete multi-tenant B2B foundation"
```

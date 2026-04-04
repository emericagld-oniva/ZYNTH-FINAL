# Zynth — Foundation Design Spec (Phase 1 MVP)

**Date:** 2026-04-04  
**Status:** Approved  
**Scope:** Architectural foundation — auth, multi-tenant routing, dashboard shell

---

## 1. Overview

Zynth is a multi-tenant ERP/Dashboard SaaS. A user can belong to multiple companies ("workspaces") and switch between them. The active workspace is always reflected in the URL.

This spec covers Phase 1 only: project setup, database schema, authentication, company onboarding, and the dashboard shell layout. No business modules (CRM, Finance, etc.) are implemented in this phase — only the navigation placeholders.

---

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router) + TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | NextAuth.js v5 + Prisma Adapter + Credentials provider |
| Password hashing | bcrypt (never store plaintext) |
| Theme | next-themes (Dark/Light + CSS variable accent colors) |

---

## 3. Database Schema

### Enum: Role

```
FOUNDER | CO_FOUNDER | MANAGER | EMPLOYEE | INTERN | GUEST
```

### Model: User

| Field | Type | Notes |
|---|---|---|
| id | cuid | PK |
| name | String? | |
| email | String | unique |
| emailVerified | DateTime? | NextAuth |
| image | String? | avatar URL |
| hashedPassword | String? | bcrypt hash |
| createdAt | DateTime | |
| updatedAt | DateTime | |

Relations: `accounts[]`, `sessions[]`, `memberships[]`

### Model: Company

| Field | Type | Notes |
|---|---|---|
| id | cuid | PK |
| name | String | display name |
| slug | String | unique, URL-friendly |
| logoUrl | String? | |
| createdAt | DateTime | |
| updatedAt | DateTime | |

Relations: `members[]`

### Model: CompanyMember (join table)

| Field | Type | Notes |
|---|---|---|
| id | cuid | PK |
| userId | String | FK → User |
| companyId | String | FK → Company |
| role | Role | default: EMPLOYEE |
| joinedAt | DateTime | |

Constraints: `@@unique([userId, companyId])`, indexes on both FKs.

### NextAuth models

Standard NextAuth v5 required models: `Account`, `Session`, `VerificationToken`.

---

## 4. Authentication & Onboarding Flow

1. **Register** (`/register`): email + name + password → bcrypt hash → create User → auto-login → redirect to `/companies`
2. **Login** (`/login`): email + password → bcrypt compare → NextAuth session → redirect to `/companies`
3. **Companies page** (`/companies`): shows all workspaces the user belongs to as cards. Button to create a new company (modal: name + logo upload).
4. **Company creation**: creates `Company` + `CompanyMember` with role `FOUNDER` for the creator.
5. **Redirect to dashboard**: clicking a company card navigates to `/dashboard/[companyId]`.

---

## 5. Routing Architecture

```
/                         → redirect to /companies (if authed) or /login
/login                    → public
/register                 → public
/companies                → protected (session required)
/dashboard/[companyId]    → protected (session + membership required)
/dashboard/[companyId]/*  → all sub-routes inherit same guard
```

### Route Groups

- `(auth)` — login, register — no dashboard layout
- `(app)` — companies, dashboard — protected

### Middleware (`middleware.ts`)

Runs on every `/(app)/*` route:
1. Check for valid NextAuth session → redirect to `/login` if missing
2. For `/dashboard/[companyId]/*`: query DB to verify `CompanyMember` exists for `(userId, companyId)` → 403 or redirect to `/companies` if not a member

---

## 6. Dashboard Layout

### Sidebar (desktop)

- Fixed left sidebar, 240px wide
- Top: **CompanySwitcher** — dropdown showing all user's companies, active one highlighted
- Middle: **SidebarNav** — navigation items with icons
  - Coffre-fort (placeholder)
  - CRM (placeholder)
  - Projets (placeholder)
  - Chat (placeholder)
  - Finances (placeholder)
  - Paramètres (visible to FOUNDER, CO_FOUNDER, MANAGER only)
- Bottom: **UserMenu** — avatar, name, email, "Mon Profil" link, Dark/Light toggle, accent color picker

### Mobile (< md breakpoint)

- Sidebar collapses to a top navbar + hamburger menu → Sheet (shadcn drawer) opens full sidebar

### Theme system

- `next-themes` provider at root layout
- Dark/Light toggle stored in localStorage + `class` on `<html>`
- Accent color: 5 presets (Zinc default, Blue, Violet, Rose, Orange) applied as CSS custom properties (`--primary`, `--primary-foreground`)

---

## 7. API Routes

| Method | Path | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Create user account | Public |
| GET | `/api/companies` | List user's companies | Session |
| POST | `/api/companies` | Create company + FOUNDER membership | Session |
| GET | `/api/companies/[companyId]` | Get company details | Member |
| PATCH | `/api/companies/[companyId]` | Update name/logo | FOUNDER/CO_FOUNDER/MANAGER |

All NextAuth endpoints handled by `/api/auth/[...nextauth]/route.ts`.

---

## 8. Security Rules

- Passwords: always hashed with bcrypt (cost factor 12), never logged or returned in API responses
- Route protection: middleware guards + server-side membership check in `layout.tsx`
- API responses: never include `hashedPassword` field (use Prisma `omit` or explicit `select`)
- Password reset: magic link via email (VerificationToken model) — planned for Phase 2
- Admins cannot read user passwords — no UI or API exposes them

---

## 9. File Structure

```
ZYNTH-APP/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (app)/
│   │   │   ├── companies/page.tsx
│   │   │   └── dashboard/[companyId]/
│   │   │       ├── layout.tsx
│   │   │       └── page.tsx
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── companies/route.ts
│   │   │   └── companies/[companyId]/route.ts
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/               (shadcn generated)
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   ├── companies/
│   │   │   ├── CompanyCard.tsx
│   │   │   └── CreateCompanyModal.tsx
│   │   └── dashboard/
│   │       ├── Sidebar.tsx
│   │       ├── SidebarNav.tsx
│   │       ├── CompanySwitcher.tsx
│   │       └── UserMenu.tsx
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts
│   │   └── utils.ts
│   ├── types/
│   │   ├── next-auth.d.ts
│   │   └── index.ts
│   └── middleware.ts
├── .env.example
├── components.json
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## 10. Out of Scope (Phase 1)

- Business modules: CRM, Finances, Projets, Chat, Coffre-fort
- Email sending / password reset flow
- File upload for company logos (Phase 1 accepts a URL string)
- Invitation system for adding members
- Billing / subscription management
- PWA / mobile app packaging

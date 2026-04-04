# Zynth Phase 1 — Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the complete Zynth Phase 1 — project init, auth, multi-tenant routing, company management, and dashboard shell.

**Architecture:** URL-based multi-tenancy at `/dashboard/[companyId]`; NextAuth v5 JWT sessions with Prisma Adapter; session-only Edge middleware + server-side membership guard in layout server component; responsive sidebar with shadcn/ui Sheet for mobile.

**Tech Stack:** Next.js 15 App Router, TypeScript (strict), Tailwind CSS v4, shadcn/ui, Prisma 6, SQLite (dev) / PostgreSQL (prod), NextAuth v5, bcryptjs, next-themes, react-hook-form, zod

---

## File Map

| File | Responsibility |
|---|---|
| `prisma/schema.prisma` | Full DB schema |
| `src/lib/prisma.ts` | PrismaClient singleton |
| `src/lib/auth.ts` | NextAuth v5 config |
| `src/lib/utils.ts` | `cn()` + `slugify()` |
| `src/types/next-auth.d.ts` | Session type augmentation |
| `src/types/index.ts` | `CompanyWithRole` type |
| `src/middleware.ts` | Session-only guard (Edge-safe) |
| `src/components/providers/Providers.tsx` | Client wrapper: SessionProvider + ThemeProvider |
| `src/app/layout.tsx` | Root layout |
| `src/app/globals.css` | CSS variables + accent themes |
| `src/app/(auth)/login/page.tsx` | Login page |
| `src/app/(auth)/register/page.tsx` | Register page |
| `src/components/auth/LoginForm.tsx` | Login form (client) |
| `src/components/auth/RegisterForm.tsx` | Register form (client) |
| `src/app/api/auth/[...nextauth]/route.ts` | NextAuth handlers |
| `src/app/api/auth/register/route.ts` | POST /api/auth/register |
| `src/app/api/companies/route.ts` | GET + POST /api/companies |
| `src/app/api/companies/[companyId]/route.ts` | GET + PATCH /api/companies/[companyId] |
| `src/app/(app)/companies/page.tsx` | Companies selection page |
| `src/components/companies/CompanyCard.tsx` | Company card |
| `src/components/companies/CreateCompanyModal.tsx` | Create company modal (client) |
| `src/app/(app)/dashboard/[companyId]/layout.tsx` | Dashboard layout + membership guard |
| `src/app/(app)/dashboard/[companyId]/page.tsx` | Dashboard home |
| `src/components/dashboard/Sidebar.tsx` | Sidebar shell (desktop + mobile) |
| `src/components/dashboard/SidebarNav.tsx` | Nav items list |
| `src/components/dashboard/CompanySwitcher.tsx` | Company dropdown (client) |
| `src/components/dashboard/UserMenu.tsx` | User menu + theme toggle (client) |
| `src/__tests__/lib/utils.test.ts` | slugify unit tests |
| `src/__tests__/api/register.test.ts` | Register API tests |

---

## Task 1: Initialize Next.js Project

**Files:**
- Create: entire project scaffold in current directory

- [ ] **Step 1: Run create-next-app**

```bash
cd "C:/Users/emeri/OneDrive/Bureau/ZYNTH-APP"
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-git
```

When prompted "The directory . contains files that could conflict", choose **Continue** (only `docs/` exists).

- [ ] **Step 2: Install additional dependencies**

```bash
npm install next-auth@beta @auth/prisma-adapter prisma @prisma/client bcryptjs next-themes react-hook-form @hookform/resolvers zod
npm install -D @types/bcryptjs jest @types/jest ts-jest jest-environment-node @testing-library/jest-dom
```

- [ ] **Step 3: Verify install**

```bash
npm run dev
```

Expected: Server starts at `http://localhost:3000` with no errors. Kill with Ctrl+C.

- [ ] **Step 4: Commit**

```bash
git init
git add .
git commit -m "chore: initialize Next.js 15 project with full dependency set"
```

---

## Task 2: Configure Prisma Schema + Database

**Files:**
- Create: `prisma/schema.prisma`
- Create: `.env`

- [ ] **Step 1: Initialize Prisma**

```bash
npx prisma init
```

Expected: Creates `prisma/schema.prisma` and `.env`.

- [ ] **Step 2: Write schema**

Replace `prisma/schema.prisma` entirely:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// ─── RBAC ──────────────────────────────────────────────

enum Role {
  FOUNDER
  CO_FOUNDER
  MANAGER
  EMPLOYEE
  INTERN
  GUEST
}

// ─── CORE MODELS ───────────────────────────────────────

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

model Company {
  id        String  @id @default(cuid())
  name      String
  slug      String  @unique
  logoUrl   String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  members CompanyMember[]
}

model CompanyMember {
  id        String   @id @default(cuid())
  userId    String
  companyId String
  role      Role     @default(EMPLOYEE)
  joinedAt  DateTime @default(now())

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  company Company @relation(fields: [companyId], references: [id], onDelete: Cascade)

  @@unique([userId, companyId])
  @@index([userId])
  @@index([companyId])
}

// ─── NEXTAUTH REQUIRED ─────────────────────────────────

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

- [ ] **Step 3: Configure .env**

Edit `.env`:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
```

Generate NEXTAUTH_SECRET with:

```bash
openssl rand -base64 32
```

The `dev.db` file will be created automatically by Prisma in the `prisma/` folder. It is already gitignored by default.

- [ ] **Step 4: Create .env.example**

```env
# Development (SQLite — no setup needed)
DATABASE_URL="file:./dev.db"

# Production: switch to PostgreSQL
# DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/zynth_prod?schema=public"

NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

- [ ] **Step 5: Add .env to .gitignore**

Verify `.gitignore` contains `.env` and `prisma/dev.db` and `prisma/*.db` (create-next-app adds `.env` by default). Confirm `.env.example` is NOT in `.gitignore`. Add to `.gitignore` if missing:

```
prisma/*.db
prisma/*.db-journal
```

- [ ] **Step 6: Run first migration**

```bash
npx prisma migrate dev --name init
```

Expected: Migration applied, `prisma/migrations/` folder created.

- [ ] **Step 7: Generate Prisma client**

```bash
npx prisma generate
```

- [ ] **Step 8: Commit**

```bash
git add prisma/ .env.example
git commit -m "feat(db): add Prisma schema with User, Company, CompanyMember, NextAuth models"
```

---

## Task 3: Core Library Files

**Files:**
- Create: `src/lib/prisma.ts`
- Create: `src/lib/utils.ts`
- Create: `src/types/next-auth.d.ts`
- Create: `src/types/index.ts`

- [ ] **Step 1: Write failing tests for slugify**

Create `src/__tests__/lib/utils.test.ts`:

```typescript
import { slugify } from "@/lib/utils"

describe("slugify", () => {
  it("lowercases and replaces spaces with hyphens", () => {
    expect(slugify("Hello World")).toBe("hello-world")
  })

  it("removes special characters", () => {
    expect(slugify("Acme Corp!")).toBe("acme-corp")
  })

  it("collapses multiple whitespace", () => {
    expect(slugify("foo   bar")).toBe("foo-bar")
  })

  it("trims leading and trailing hyphens", () => {
    expect(slugify("  --Zynth--  ")).toBe("zynth")
  })

  it("normalizes accented characters", () => {
    expect(slugify("Société Générale")).toBe("societe-generale")
  })
})
```

- [ ] **Step 2: Configure Jest**

Add `jest.config.ts` at project root:

```typescript
import type { Config } from "jest"
import nextJest from "next/jest.js"

const createJestConfig = nextJest({ dir: "./" })

const config: Config = {
  testEnvironment: "node",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  setupFilesAfterFramework: ["@testing-library/jest-dom"],
}

export default createJestConfig(config)
```

Add to `package.json` scripts:

```json
"test": "jest",
"test:watch": "jest --watch"
```

- [ ] **Step 3: Run test to confirm it fails**

```bash
npm test src/__tests__/lib/utils.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/utils'`

- [ ] **Step 4: Write src/lib/prisma.ts**

```typescript
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
```

- [ ] **Step 5: Write src/lib/utils.ts**

```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}
```

- [ ] **Step 6: Run tests — confirm they pass**

```bash
npm test src/__tests__/lib/utils.test.ts
```

Expected: PASS — 5 tests passing.

- [ ] **Step 7: Write src/types/next-auth.d.ts**

```typescript
import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
    } & DefaultSession["user"]
  }
}
```

- [ ] **Step 8: Write src/types/index.ts**

```typescript
import type { Company } from "@prisma/client"
import type { Role } from "@prisma/client"

export type CompanyWithRole = Company & {
  memberRole: Role
}

export type { Role }
```

- [ ] **Step 9: Commit**

```bash
git add src/lib/ src/types/ src/__tests__/ jest.config.ts
git commit -m "feat(lib): add PrismaClient singleton, utils (cn, slugify), type augmentations"
```

---

## Task 4: NextAuth v5 Configuration

**Files:**
- Create: `src/lib/auth.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`

- [ ] **Step 1: Write src/lib/auth.ts**

```typescript
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials)
        if (!parsed.success) return null

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            hashedPassword: true,
          },
        })

        if (!user?.hashedPassword) return null

        const isValid = await bcrypt.compare(
          parsed.data.password,
          user.hashedPassword
        )
        if (!isValid) return null

        return { id: user.id, email: user.email, name: user.name, image: user.image }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) token.id = user.id
      return token
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string
      return session
    },
  },
})
```

- [ ] **Step 2: Create NextAuth route handler**

Create `src/app/api/auth/[...nextauth]/route.ts`:

```typescript
import { handlers } from "@/lib/auth"

export const { GET, POST } = handlers
```

- [ ] **Step 3: Write src/middleware.ts**

```typescript
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl, auth: session } = req
  const { pathname } = nextUrl

  const isAuthPage = pathname === "/login" || pathname === "/register"
  const isProtected = !isAuthPage && !pathname.startsWith("/api/auth")

  if (!session && isProtected) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  if (session && isAuthPage) {
    return NextResponse.redirect(new URL("/companies", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
}
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/auth.ts src/app/api/auth/ src/middleware.ts
git commit -m "feat(auth): add NextAuth v5 config with Credentials provider and JWT sessions"
```

---

## Task 5: Register API Endpoint

**Files:**
- Create: `src/app/api/auth/register/route.ts`
- Create: `src/__tests__/api/register.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/__tests__/api/register.test.ts`:

```typescript
import { POST } from "@/app/api/auth/register/route"
import { prisma } from "@/lib/prisma"

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}))

const mockPrisma = prisma as jest.Mocked<typeof prisma>

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

describe("POST /api/auth/register", () => {
  beforeEach(() => jest.clearAllMocks())

  it("returns 400 when body is invalid", async () => {
    const res = await POST(makeRequest({ email: "bad", password: "short" }))
    expect(res.status).toBe(400)
  })

  it("returns 409 when email is already taken", async () => {
    ;(mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({ id: "1" })
    const res = await POST(
      makeRequest({ name: "Alice", email: "a@a.com", password: "password123" })
    )
    expect(res.status).toBe(409)
  })

  it("returns 201 and creates user on success", async () => {
    ;(mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null)
    ;(mockPrisma.user.create as jest.Mock).mockResolvedValue({
      id: "new-id",
      email: "a@a.com",
      name: "Alice",
    })
    const res = await POST(
      makeRequest({ name: "Alice", email: "a@a.com", password: "password123" })
    )
    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data).not.toHaveProperty("hashedPassword")
  })
})
```

- [ ] **Step 2: Run to confirm failure**

```bash
npm test src/__tests__/api/register.test.ts
```

Expected: FAIL — `Cannot find module '@/app/api/auth/register/route'`

- [ ] **Step 3: Write register route**

Create `src/app/api/auth/register/route.ts`:

```typescript
import { NextResponse } from "next/server"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

const registerSchema = z.object({
  name: z.string().min(2, "Nom trop court"),
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Minimum 8 caractères"),
})

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = registerSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { name, email, password } = parsed.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json(
      { error: "Un compte existe déjà avec cet email" },
      { status: 409 }
    )
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: { name, email, hashedPassword },
    select: { id: true, name: true, email: true, createdAt: true },
  })

  return NextResponse.json(user, { status: 201 })
}
```

- [ ] **Step 4: Run tests — confirm pass**

```bash
npm test src/__tests__/api/register.test.ts
```

Expected: PASS — 3 tests passing.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/auth/register/ src/__tests__/api/register.test.ts
git commit -m "feat(auth): add register API endpoint with bcrypt hashing and zod validation"
```

---

## Task 6: Companies API Endpoints

**Files:**
- Create: `src/app/api/companies/route.ts`
- Create: `src/app/api/companies/[companyId]/route.ts`

- [ ] **Step 1: Write src/app/api/companies/route.ts**

```typescript
import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { slugify } from "@/lib/utils"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const memberships = await prisma.companyMember.findMany({
    where: { userId: session.user.id },
    include: { company: true },
    orderBy: { joinedAt: "asc" },
  })

  const companies = memberships.map((m) => ({
    ...m.company,
    memberRole: m.role,
  }))

  return NextResponse.json(companies)
}

const createCompanySchema = z.object({
  name: z.string().min(2).max(100),
  logoUrl: z.string().url().optional().or(z.literal("")),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = createCompanySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { name, logoUrl } = parsed.data
  let slug = slugify(name)

  const existing = await prisma.company.findUnique({ where: { slug } })
  if (existing) {
    slug = `${slug}-${Math.random().toString(36).slice(2, 7)}`
  }

  const company = await prisma.$transaction(async (tx) => {
    const newCompany = await tx.company.create({
      data: {
        name,
        slug,
        logoUrl: logoUrl || null,
      },
    })
    await tx.companyMember.create({
      data: {
        userId: session.user.id,
        companyId: newCompany.id,
        role: "FOUNDER",
      },
    })
    return newCompany
  })

  return NextResponse.json(company, { status: 201 })
}
```

- [ ] **Step 2: Write src/app/api/companies/[companyId]/route.ts**

```typescript
import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

async function getMembership(userId: string, companyId: string) {
  return prisma.companyMember.findUnique({
    where: { userId_companyId: { userId, companyId } },
    include: { company: true },
  })
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { companyId } = await params
  const membership = await getMembership(session.user.id, companyId)

  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  return NextResponse.json({ ...membership.company, memberRole: membership.role })
}

const updateCompanySchema = z.object({
  name: z.string().min(2).max(100).optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
})

const canUpdate = ["FOUNDER", "CO_FOUNDER", "MANAGER"] as const

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ companyId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { companyId } = await params
  const membership = await getMembership(session.user.id, companyId)

  if (!membership) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  if (!canUpdate.includes(membership.role as (typeof canUpdate)[number])) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
  }

  const body = await req.json()
  const parsed = updateCompanySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const updated = await prisma.company.update({
    where: { id: companyId },
    data: {
      ...(parsed.data.name && { name: parsed.data.name }),
      ...(parsed.data.logoUrl !== undefined && {
        logoUrl: parsed.data.logoUrl || null,
      }),
    },
  })

  return NextResponse.json(updated)
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/companies/
git commit -m "feat(api): add companies endpoints (list, create, get, update) with RBAC"
```

---

## Task 7: Root Layout + Providers + Theme System

**Files:**
- Create: `src/components/providers/Providers.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Initialize shadcn/ui**

```bash
npx shadcn@latest init
```

When prompted:
- Style: **Default**
- Base color: **Zinc**
- CSS variables: **Yes**

This generates `components.json` and updates `src/app/globals.css` and `tailwind.config.ts`.

- [ ] **Step 2: Install shadcn components needed for Phase 1**

```bash
npx shadcn@latest add button input label card dialog dropdown-menu avatar sheet separator badge form
```

- [ ] **Step 3: Write src/components/providers/Providers.tsx**

```tsx
"use client"

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "next-themes"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </SessionProvider>
  )
}
```

- [ ] **Step 4: Rewrite src/app/layout.tsx**

```tsx
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Providers } from "@/components/providers/Providers"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Zynth",
  description: "ERP Dashboard",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

- [ ] **Step 5: Add accent color CSS variables to src/app/globals.css**

Append to the end of `globals.css` (after the shadcn-generated content):

```css
/* ── Accent color presets ── */
/* Default is Zinc (shadcn default). Override by setting data-accent on <html>. */

[data-accent="blue"] {
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --ring: 221.2 83.2% 53.3%;
}

[data-accent="violet"] {
  --primary: 263.4 70% 50.4%;
  --primary-foreground: 210 40% 98%;
  --ring: 263.4 70% 50.4%;
}

[data-accent="rose"] {
  --primary: 346.8 77.2% 49.8%;
  --primary-foreground: 355.7 100% 97.3%;
  --ring: 346.8 77.2% 49.8%;
}

[data-accent="orange"] {
  --primary: 24.6 95% 53.1%;
  --primary-foreground: 60 9.1% 97.8%;
  --ring: 24.6 95% 53.1%;
}
```

- [ ] **Step 6: Verify app builds**

```bash
npm run build
```

Expected: Build completes with no TypeScript or module errors.

- [ ] **Step 7: Commit**

```bash
git add src/components/providers/ src/app/layout.tsx src/app/globals.css components.json
git commit -m "feat(ui): add shadcn/ui, ThemeProvider, SessionProvider, accent color CSS variables"
```

---

## Task 8: Auth Pages (Login + Register)

**Files:**
- Create: `src/components/auth/LoginForm.tsx`
- Create: `src/components/auth/RegisterForm.tsx`
- Create: `src/app/(auth)/login/page.tsx`
- Create: `src/app/(auth)/register/page.tsx`

- [ ] **Step 1: Write src/components/auth/LoginForm.tsx**

```tsx
"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const schema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
})

type FormValues = z.infer<typeof schema>

export function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  })

  async function onSubmit(values: FormValues) {
    setError(null)
    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    })

    if (result?.error) {
      setError("Email ou mot de passe incorrect")
      return
    }

    router.push("/companies")
    router.refresh()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mot de passe</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Connexion..." : "Se connecter"}
        </Button>
      </form>
    </Form>
  )
}
```

- [ ] **Step 2: Write src/components/auth/RegisterForm.tsx**

```tsx
"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const schema = z.object({
  name: z.string().min(2, "Nom trop court"),
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Minimum 8 caractères"),
})

type FormValues = z.infer<typeof schema>

export function RegisterForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "" },
  })

  async function onSubmit(values: FormValues) {
    setError(null)

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    })

    if (res.status === 409) {
      setError("Un compte existe déjà avec cet email")
      return
    }

    if (!res.ok) {
      setError("Une erreur est survenue. Réessayez.")
      return
    }

    await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    })

    router.push("/companies")
    router.refresh()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom complet</FormLabel>
              <FormControl>
                <Input placeholder="Alice Martin" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mot de passe</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Création..." : "Créer mon compte"}
        </Button>
      </form>
    </Form>
  )
}
```

- [ ] **Step 3: Write src/app/(auth)/login/page.tsx**

```tsx
import Link from "next/link"
import { LoginForm } from "@/components/auth/LoginForm"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Zynth</h1>
          <p className="text-muted-foreground mt-1 text-sm">ERP Dashboard</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Connexion</CardTitle>
            <CardDescription>Accédez à votre workspace</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
          <CardFooter className="justify-center text-sm text-muted-foreground">
            Pas encore de compte ?&nbsp;
            <Link href="/register" className="text-primary underline-offset-4 hover:underline">
              Créer un compte
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Write src/app/(auth)/register/page.tsx**

```tsx
import Link from "next/link"
import { RegisterForm } from "@/components/auth/RegisterForm"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Zynth</h1>
          <p className="text-muted-foreground mt-1 text-sm">ERP Dashboard</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Créer un compte</CardTitle>
            <CardDescription>Commencez gratuitement</CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterForm />
          </CardContent>
          <CardFooter className="justify-center text-sm text-muted-foreground">
            Déjà un compte ?&nbsp;
            <Link href="/login" className="text-primary underline-offset-4 hover:underline">
              Se connecter
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/auth/ src/app/"(auth)"/
git commit -m "feat(auth): add Login and Register pages with react-hook-form + zod validation"
```

---

## Task 9: Companies Page

**Files:**
- Create: `src/components/companies/CompanyCard.tsx`
- Create: `src/components/companies/CreateCompanyModal.tsx`
- Create: `src/app/(app)/companies/page.tsx`

- [ ] **Step 1: Write src/components/companies/CompanyCard.tsx**

```tsx
"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { CompanyWithRole } from "@/types"

const ROLE_LABELS: Record<string, string> = {
  FOUNDER: "Fondateur",
  CO_FOUNDER: "Co-fondateur",
  MANAGER: "Manager",
  EMPLOYEE: "Employé",
  INTERN: "Alternant/Stagiaire",
  GUEST: "Invité",
}

interface Props {
  company: CompanyWithRole
}

export function CompanyCard({ company }: Props) {
  const router = useRouter()

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50 active:scale-[0.98]"
      onClick={() => router.push(`/dashboard/${company.id}`)}
    >
      <CardContent className="flex items-center gap-4 p-5">
        <Avatar className="h-12 w-12 rounded-lg">
          <AvatarImage src={company.logoUrl ?? undefined} alt={company.name} />
          <AvatarFallback className="rounded-lg text-lg font-semibold">
            {company.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate">{company.name}</p>
          <p className="text-sm text-muted-foreground">@{company.slug}</p>
        </div>
        <Badge variant="secondary">
          {ROLE_LABELS[company.memberRole] ?? company.memberRole}
        </Badge>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 2: Write src/components/companies/CreateCompanyModal.tsx**

```tsx
"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const schema = z.object({
  name: z.string().min(2, "Nom trop court").max(100),
  logoUrl: z.string().url("URL invalide").optional().or(z.literal("")),
})

type FormValues = z.infer<typeof schema>

export function CreateCompanyModal() {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", logoUrl: "" },
  })

  async function onSubmit(values: FormValues) {
    setError(null)
    const res = await fetch("/api/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    })

    if (!res.ok) {
      setError("Impossible de créer l'entreprise. Réessayez.")
      return
    }

    const company = await res.json()
    setOpen(false)
    form.reset()
    router.push(`/dashboard/${company.id}`)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle entreprise
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer une entreprise</DialogTitle>
          <DialogDescription>
            Vous en deviendrez le Fondateur.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de l'entreprise</FormLabel>
                  <FormControl>
                    <Input placeholder="Acme Corp" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="logoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo (URL, optionnel)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/logo.png"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && <p className="text-sm text-destructive">{error}</p>}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Création..." : "Créer"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 3: Write src/app/(app)/companies/page.tsx**

```tsx
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { CompanyCard } from "@/components/companies/CompanyCard"
import { CreateCompanyModal } from "@/components/companies/CreateCompanyModal"
import type { CompanyWithRole } from "@/types"

export default async function CompaniesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const memberships = await prisma.companyMember.findMany({
    where: { userId: session.user.id },
    include: { company: true },
    orderBy: { joinedAt: "asc" },
  })

  const companies: CompanyWithRole[] = memberships.map((m) => ({
    ...m.company,
    memberRole: m.role,
  }))

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Bonjour, {session.user.name?.split(" ")[0]} 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Sélectionnez un workspace ou créez-en un nouveau.
            </p>
          </div>
          <CreateCompanyModal />
        </div>

        {companies.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg font-medium">Aucun workspace pour l'instant</p>
            <p className="text-sm mt-1">Créez votre première entreprise pour commencer.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {companies.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/companies/ src/app/"(app)"/companies/
git commit -m "feat(companies): add companies selection page with cards and create modal"
```

---

## Task 10: Dashboard Sidebar Components

**Files:**
- Create: `src/components/dashboard/SidebarNav.tsx`
- Create: `src/components/dashboard/CompanySwitcher.tsx`
- Create: `src/components/dashboard/UserMenu.tsx`
- Create: `src/components/dashboard/Sidebar.tsx`

- [ ] **Step 1: Write src/components/dashboard/SidebarNav.tsx**

```tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Vault,
  Users2,
  FolderKanban,
  MessageSquare,
  BarChart3,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Role } from "@/types"

const NAV_ITEMS = [
  { label: "Coffre-fort", href: "vault", icon: Vault },
  { label: "CRM", href: "crm", icon: Users2 },
  { label: "Projets", href: "projects", icon: FolderKanban },
  { label: "Chat", href: "chat", icon: MessageSquare },
  { label: "Finances", href: "finances", icon: BarChart3 },
] as const

const ADMIN_ROLES: Role[] = ["FOUNDER", "CO_FOUNDER", "MANAGER"]

interface Props {
  companyId: string
  userRole: Role
}

export function SidebarNav({ companyId, userRole }: Props) {
  const pathname = usePathname()
  const base = `/dashboard/${companyId}`

  const isAdmin = ADMIN_ROLES.includes(userRole)

  return (
    <nav className="space-y-1">
      {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
        const fullHref = `${base}/${href}`
        const isActive = pathname.startsWith(fullHref)
        return (
          <Link
            key={href}
            href={fullHref}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        )
      })}

      {isAdmin && (
        <>
          <div className="my-2 h-px bg-border" />
          <Link
            href={`${base}/settings`}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              pathname.startsWith(`${base}/settings`)
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Settings className="h-4 w-4 shrink-0" />
            Paramètres
          </Link>
        </>
      )}
    </nav>
  )
}
```

- [ ] **Step 2: Write src/components/dashboard/CompanySwitcher.tsx**

```tsx
"use client"

import { useRouter } from "next/navigation"
import { ChevronsUpDown, Plus } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import type { CompanyWithRole } from "@/types"

interface Props {
  activeCompany: CompanyWithRole
  companies: CompanyWithRole[]
}

export function CompanySwitcher({ activeCompany, companies }: Props) {
  const router = useRouter()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between px-2 h-auto py-2"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Avatar className="h-7 w-7 rounded-md">
              <AvatarImage
                src={activeCompany.logoUrl ?? undefined}
                alt={activeCompany.name}
              />
              <AvatarFallback className="rounded-md text-xs font-bold">
                {activeCompany.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="font-semibold text-sm truncate">
              {activeCompany.name}
            </span>
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          Workspaces
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {companies.map((company) => (
          <DropdownMenuItem
            key={company.id}
            onClick={() => router.push(`/dashboard/${company.id}`)}
            className="gap-2 cursor-pointer"
          >
            <Avatar className="h-5 w-5 rounded-sm">
              <AvatarImage src={company.logoUrl ?? undefined} />
              <AvatarFallback className="rounded-sm text-xs">
                {company.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="truncate">{company.name}</span>
            {company.id === activeCompany.id && (
              <span className="ml-auto text-primary text-xs">✓</span>
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => router.push("/companies")}
          className="gap-2 cursor-pointer text-muted-foreground"
        >
          <Plus className="h-4 w-4" />
          Gérer les workspaces
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

- [ ] **Step 3: Write src/components/dashboard/UserMenu.tsx**

```tsx
"use client"

import { signOut } from "next-auth/react"
import { useTheme } from "next-themes"
import { LogOut, User, Sun, Moon, Monitor } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

const ACCENT_COLORS = [
  { key: "zinc", label: "Zinc", color: "#18181b" },
  { key: "blue", label: "Blue", color: "#3b82f6" },
  { key: "violet", label: "Violet", color: "#7c3aed" },
  { key: "rose", label: "Rose", color: "#e11d48" },
  { key: "orange", label: "Orange", color: "#f97316" },
] as const

interface Props {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export function UserMenu({ user }: Props) {
  const { theme, setTheme } = useTheme()

  function setAccent(accent: string) {
    document.documentElement.setAttribute("data-accent", accent)
    localStorage.setItem("zynth-accent", accent)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full justify-start gap-3 px-2 h-auto py-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image ?? undefined} />
            <AvatarFallback className="text-xs font-semibold">
              {user.name?.slice(0, 2).toUpperCase() ?? "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" side="top" align="start">
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          Mon compte
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="gap-2 cursor-pointer">
            <User className="h-4 w-4" />
            Mon profil
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          Thème
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          {(["light", "dark", "system"] as const).map((t) => (
            <DropdownMenuItem
              key={t}
              onClick={() => setTheme(t)}
              className="gap-2 cursor-pointer"
            >
              {t === "light" && <Sun className="h-4 w-4" />}
              {t === "dark" && <Moon className="h-4 w-4" />}
              {t === "system" && <Monitor className="h-4 w-4" />}
              {{ light: "Clair", dark: "Sombre", system: "Système" }[t]}
              {theme === t && <span className="ml-auto text-primary text-xs">✓</span>}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          Couleur d'accent
        </DropdownMenuLabel>
        <div className="flex gap-2 px-2 py-2">
          {ACCENT_COLORS.map(({ key, label, color }) => (
            <button
              key={key}
              title={label}
              onClick={() => setAccent(key)}
              className="h-5 w-5 rounded-full ring-offset-background transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="gap-2 cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Se déconnecter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

- [ ] **Step 4: Write src/components/dashboard/Sidebar.tsx**

```tsx
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { CompanySwitcher } from "./CompanySwitcher"
import { SidebarNav } from "./SidebarNav"
import { UserMenu } from "./UserMenu"
import type { CompanyWithRole, Role } from "@/types"

interface SidebarProps {
  user: {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
  }
  activeCompany: CompanyWithRole
  companies: CompanyWithRole[]
  userRole: Role
}

function SidebarContent({
  user,
  activeCompany,
  companies,
  userRole,
}: SidebarProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="p-3 border-b">
        <CompanySwitcher activeCompany={activeCompany} companies={companies} />
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <SidebarNav companyId={activeCompany.id} userRole={userRole} />
      </div>
      <div className="p-3 border-t">
        <UserMenu user={user} />
      </div>
    </div>
  )
}

export function Sidebar(props: SidebarProps) {
  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:flex h-screen w-60 flex-col border-r bg-card shrink-0">
        <SidebarContent {...props} />
      </aside>

      {/* Mobile top bar + drawer */}
      <div className="flex md:hidden items-center justify-between px-4 h-14 border-b bg-card fixed top-0 left-0 right-0 z-40">
        <span className="font-bold text-lg">Zynth</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground truncate max-w-[150px]">
            {props.activeCompany.name}
          </span>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-60 p-0">
              <SidebarContent {...props} />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/
git commit -m "feat(ui): add Sidebar, SidebarNav, CompanySwitcher, UserMenu components"
```

---

## Task 11: Dashboard Layout + Page

**Files:**
- Create: `src/app/(app)/dashboard/[companyId]/layout.tsx`
- Create: `src/app/(app)/dashboard/[companyId]/page.tsx`

- [ ] **Step 1: Write dashboard layout**

Create `src/app/(app)/dashboard/[companyId]/layout.tsx`:

```tsx
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Sidebar } from "@/components/dashboard/Sidebar"
import type { CompanyWithRole } from "@/types"

interface Props {
  children: React.ReactNode
  params: Promise<{ companyId: string }>
}

export default async function DashboardLayout({ children, params }: Props) {
  const { companyId } = await params
  const session = await auth()

  if (!session?.user?.id) redirect("/login")

  const membership = await prisma.companyMember.findUnique({
    where: {
      userId_companyId: {
        userId: session.user.id,
        companyId,
      },
    },
    include: { company: true },
  })

  if (!membership) redirect("/companies")

  const allMemberships = await prisma.companyMember.findMany({
    where: { userId: session.user.id },
    include: { company: true },
    orderBy: { joinedAt: "asc" },
  })

  const companies: CompanyWithRole[] = allMemberships.map((m) => ({
    ...m.company,
    memberRole: m.role,
  }))

  const activeCompany: CompanyWithRole = {
    ...membership.company,
    memberRole: membership.role,
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        user={session.user}
        activeCompany={activeCompany}
        companies={companies}
        userRole={membership.role}
      />
      {/* Offset for mobile top bar */}
      <main className="flex-1 overflow-y-auto pt-14 md:pt-0">
        {children}
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Write dashboard home page**

Create `src/app/(app)/dashboard/[companyId]/page.tsx`:

```tsx
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

interface Props {
  params: Promise<{ companyId: string }>
}

export default async function DashboardPage({ params }: Props) {
  const { companyId } = await params
  const session = await auth()

  if (!session?.user?.id) redirect("/login")

  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { name: true },
  })

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Tableau de bord</h1>
      <p className="text-muted-foreground mt-1">
        Bienvenue dans {company?.name}. Les modules arrivent bientôt.
      </p>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {["Coffre-fort", "CRM", "Projets", "Chat", "Finances"].map((module) => (
          <div
            key={module}
            className="rounded-lg border border-dashed p-6 text-center text-muted-foreground"
          >
            <p className="font-medium">{module}</p>
            <p className="text-sm mt-1">Bientôt disponible</p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Add root redirect**

Create `src/app/page.tsx`:

```tsx
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"

export default async function RootPage() {
  const session = await auth()
  if (session) redirect("/companies")
  redirect("/login")
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/"(app)"/dashboard/ src/app/page.tsx
git commit -m "feat(dashboard): add dashboard layout with membership guard, home page, root redirect"
```

---

## Task 12: AccentColor Hydration + Final Checks

**Files:**
- Create: `src/components/providers/AccentColorInit.tsx`
- Modify: `src/components/providers/Providers.tsx`

- [ ] **Step 1: Write AccentColorInit**

The `data-accent` attribute must be restored on page load from `localStorage` to avoid a flash of unstyled accent color. Create `src/components/providers/AccentColorInit.tsx`:

```tsx
"use client"

import { useEffect } from "react"

export function AccentColorInit() {
  useEffect(() => {
    const saved = localStorage.getItem("zynth-accent")
    if (saved) {
      document.documentElement.setAttribute("data-accent", saved)
    }
  }, [])

  return null
}
```

- [ ] **Step 2: Add AccentColorInit to Providers**

Update `src/components/providers/Providers.tsx`:

```tsx
"use client"

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "next-themes"
import { AccentColorInit } from "./AccentColorInit"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AccentColorInit />
        {children}
      </ThemeProvider>
    </SessionProvider>
  )
}
```

- [ ] **Step 3: Run full test suite**

```bash
npm test
```

Expected: All tests pass (utils + register API).

- [ ] **Step 4: Run build check**

```bash
npm run build
```

Expected: Build succeeds. Investigate and fix any TypeScript errors.

- [ ] **Step 5: Verify app end-to-end (manual)**

```bash
npm run dev
```

Verify manually:
1. `http://localhost:3000` → redirects to `/login`
2. Register a new account → redirects to `/companies`
3. Create a company → redirects to `/dashboard/[id]`
4. Sidebar visible on desktop, hamburger on mobile
5. Company switcher shows the new company
6. Theme toggle (Light/Dark) works
7. Accent color picker changes button color
8. Direct access to `/dashboard/some-other-id` → redirects to `/companies`

- [ ] **Step 6: Final commit**

```bash
git add src/components/providers/AccentColorInit.tsx src/components/providers/Providers.tsx
git commit -m "feat(ui): add accent color hydration from localStorage on page load"
git tag v0.1.0
```

---

## Self-Review Checklist

- [x] Spec §3 (DB schema) → Task 2
- [x] Spec §4 (Auth onboarding: register, login, companies page, create company modal) → Tasks 5, 8, 9
- [x] Spec §5 (Routing: `/dashboard/[companyId]`) → Tasks 4, 11
- [x] Spec §6 (Sidebar: company switcher, nav items, settings guard, user menu, theme) → Tasks 10, 11
- [x] Spec §7 (API routes) → Tasks 5, 6
- [x] Spec §8 (Security: bcrypt, no plaintext, membership guard, no password in responses) → Tasks 4, 5, 6, 11
- [x] Mobile-first: Sidebar has mobile Sheet drawer — Task 10
- [x] NEXTAUTH_SECRET env var documented — Task 2
- [x] No placeholders or TBDs in task code
- [x] Types consistent: `CompanyWithRole` used in Tasks 9, 10, 11; `Role` from `@/types` throughout

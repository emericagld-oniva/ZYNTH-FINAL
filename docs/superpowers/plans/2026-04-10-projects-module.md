# Projects Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a company-scoped project management module at `/[companyId]/projects` with three switchable views (Grid / List / Kanban), task progression tracking, and an optional CRM client link.

**Architecture:** Server Component page fetches all projects (with task counts) and passes them to a `ProjectsShell` Client Component that owns `view` state (`grid | list | kanban`). Same pattern as the Vault module. Three separate view sub-components render from the same data — no re-fetch on view switch. A glassmorphism modal handles create/edit. Delete uses an inline confirm dialog.

**Tech Stack:** Next.js 16.2.2 App Router, Prisma v6 SQLite, NextAuth v5, framer-motion, Tailwind CSS 4, lucide-react.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Modify | `prisma/schema.prisma` | Add ProjectStatus, TaskStatus, Priority enums; Project + Task models; back-relations on Client + Company |
| Create | `src/lib/actions/projects.ts` | Server Actions: createProject, updateProject, deleteProject |
| Create | `src/app/(app)/[companyId]/projects/projects-config.ts` | Shared types (ProjectRow, ClientOption) + design token maps |
| Create | `src/app/(app)/[companyId]/projects/project-modal.tsx` | Glassmorphism create/edit modal |
| Create | `src/app/(app)/[companyId]/projects/projects-grid.tsx` | Grid view — cards with progress bars |
| Create | `src/app/(app)/[companyId]/projects/projects-list.tsx` | List view — compact table |
| Create | `src/app/(app)/[companyId]/projects/projects-kanban.tsx` | Kanban view — 4 status columns |
| Create | `src/app/(app)/[companyId]/projects/projects-shell.tsx` | Client Shell — view switcher, modal/delete state |
| Create | `src/app/(app)/[companyId]/projects/page.tsx` | Server Component — auth, fetch, shape data |
| Modify | `src/components/app-sidebar.tsx` | Add Projects nav item |
| Create | `prisma/seed.ts` | Sample projects + tasks for first company |
| Modify | `package.json` | Add prisma.seed script + install tsx |

---

## Task 1: Prisma Schema

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add the three new enums**

In `prisma/schema.prisma`, add after the `AccessLevel` enum block (before `// ─── CORE MODELS`):

```prisma
enum ProjectStatus {
  BACKLOG
  IN_PROGRESS
  REVIEW
  DONE
}

enum TaskStatus {
  TODO
  DOING
  DONE
}

enum Priority {
  LOW
  MEDIUM
  HIGH
}
```

- [ ] **Step 2: Add back-relation to Client**

In the `Client` model, add after `updatedAt DateTime @updatedAt`:

```prisma
  projects Project[]
```

- [ ] **Step 3: Add back-relation to Company**

In the `Company` model, after `vaultItems VaultItem[]`, add:

```prisma
  projects Project[]
```

- [ ] **Step 4: Add Project and Task models**

At the end of `prisma/schema.prisma`, after the VaultAccess model, add:

```prisma
// ─── PROJECTS ──────────────────────────────────────────

model Project {
  id          String        @id @default(cuid())
  title       String
  description String?
  status      ProjectStatus @default(BACKLOG)
  clientId    String?
  client      Client?       @relation(fields: [clientId], references: [id], onDelete: SetNull)
  companyId   String
  company     Company       @relation(fields: [companyId], references: [id], onDelete: Cascade)
  deadline    DateTime?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  tasks       Task[]

  @@index([companyId])
  @@index([clientId])
}

model Task {
  id        String     @id @default(cuid())
  title     String
  status    TaskStatus @default(TODO)
  priority  Priority   @default(MEDIUM)
  deadline  DateTime?
  projectId String
  project   Project    @relation(fields: [projectId], references: [id], onDelete: Cascade)
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  @@index([projectId])
}
```

- [ ] **Step 5: Push schema and regenerate client**

```bash
powershell -Command "Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force"
npx prisma db push
npx prisma generate
```

Expected output: `✔ Generated Prisma Client`

- [ ] **Step 6: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat(schema): add Project, Task models with ProjectStatus, TaskStatus, Priority enums"
```

---

## Task 2: Server Actions

**Files:**
- Create: `src/lib/actions/projects.ts`

- [ ] **Step 1: Create the actions file**

```ts
// src/lib/actions/projects.ts
"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type ProjectState = { error?: string; success?: boolean } | null;

// ─── helpers ────────────────────────────────────────────

async function getMembership(userId: string, companyId: string) {
  return prisma.companyMember.findUnique({
    where: { userId_companyId: { userId, companyId } },
  });
}

function parseDeadline(raw: FormDataEntryValue | null): Date | null {
  if (!raw || typeof raw !== "string" || !raw.trim()) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
}

// ─── Create ─────────────────────────────────────────────

export async function createProjectAction(
  _prev: ProjectState,
  formData: FormData
): Promise<ProjectState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Non autorisé." };

  const companyId   = (formData.get("companyId")   as string)?.trim();
  const title       = (formData.get("title")        as string)?.trim();
  const description = (formData.get("description")  as string)?.trim() || null;
  const status      = (formData.get("status")        as string)?.trim() || "BACKLOG";
  const clientId    = (formData.get("clientId")      as string)?.trim() || null;
  const deadline    = parseDeadline(formData.get("deadline"));

  if (!companyId) return { error: "Workspace manquant." };
  if (!title)     return { error: "Le titre est requis." };

  const membership = await getMembership(session.user.id, companyId);
  if (!membership) return { error: "Accès refusé." };

  await prisma.project.create({
    data: { title, description, status: status as any, clientId, companyId, deadline },
  });

  revalidatePath(`/${companyId}/projects`);
  return { success: true };
}

// ─── Update ─────────────────────────────────────────────

export async function updateProjectAction(
  _prev: ProjectState,
  formData: FormData
): Promise<ProjectState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Non autorisé." };

  const projectId   = (formData.get("projectId")    as string)?.trim();
  const companyId   = (formData.get("companyId")    as string)?.trim();
  const title       = (formData.get("title")        as string)?.trim();
  const description = (formData.get("description")  as string)?.trim() || null;
  const status      = (formData.get("status")        as string)?.trim() || "BACKLOG";
  const clientId    = (formData.get("clientId")      as string)?.trim() || null;
  const deadline    = parseDeadline(formData.get("deadline"));

  if (!projectId) return { error: "Projet introuvable." };
  if (!companyId) return { error: "Workspace manquant." };
  if (!title)     return { error: "Le titre est requis." };

  const membership = await getMembership(session.user.id, companyId);
  if (!membership) return { error: "Accès refusé." };

  const existing = await prisma.project.findUnique({ where: { id: projectId } });
  if (!existing || existing.companyId !== companyId) return { error: "Projet introuvable." };

  await prisma.project.update({
    where: { id: projectId },
    data: { title, description, status: status as any, clientId, deadline },
  });

  revalidatePath(`/${companyId}/projects`);
  return { success: true };
}

// ─── Delete ─────────────────────────────────────────────

export async function deleteProjectAction(
  projectId: string,
  companyId: string
): Promise<ProjectState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Non autorisé." };

  const membership = await getMembership(session.user.id, companyId);
  if (!membership) return { error: "Accès refusé." };

  const existing = await prisma.project.findUnique({ where: { id: projectId } });
  if (!existing || existing.companyId !== companyId) return { error: "Projet introuvable." };

  await prisma.project.delete({ where: { id: projectId } });

  revalidatePath(`/${companyId}/projects`);
  return { success: true };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/actions/projects.ts
git commit -m "feat(projects): add createProject, updateProject, deleteProject server actions"
```

---

## Task 3: Shared Config + Types

**Files:**
- Create: `src/app/(app)/[companyId]/projects/projects-config.ts`

- [ ] **Step 1: Create the config file**

```ts
// src/app/(app)/[companyId]/projects/projects-config.ts

export interface ProjectRow {
  id: string;
  title: string;
  description: string | null;
  status: "BACKLOG" | "IN_PROGRESS" | "REVIEW" | "DONE";
  clientId: string | null;
  clientName: string | null;
  deadline: Date | string | null;
  totalTasks: number;
  doneTasks: number;
  createdAt: Date | string;
}

export interface ClientOption {
  id: string;
  name: string;
}

export interface ProjectToEdit {
  id: string;
  title: string;
  description: string | null;
  status: string;
  clientId: string | null;
  deadline: Date | string | null;
}

export const STATUS_CONFIG = {
  BACKLOG:     { label: "Backlog",   textColor: "text-orange-400", bg: "bg-orange-500/10",  border: "border-orange-500/20",  bar: "bg-orange-400"   },
  IN_PROGRESS: { label: "En cours",  textColor: "text-sky-400",    bg: "bg-sky-500/10",     border: "border-sky-500/20",     bar: "bg-sky-400"      },
  REVIEW:      { label: "Review",    textColor: "text-violet-400", bg: "bg-violet-500/10",  border: "border-violet-500/20",  bar: "bg-violet-400"   },
  DONE:        { label: "Terminé",   textColor: "text-emerald-400",bg: "bg-emerald-500/10", border: "border-emerald-500/20", bar: "bg-emerald-400"  },
} as const;

export const PRIORITY_DOT: Record<string, string> = {
  HIGH:   "bg-red-400",
  MEDIUM: "bg-amber-400",
  LOW:    "bg-gray-500",
};

export function formatDeadline(deadline: Date | string | null): string | null {
  if (!deadline) return null;
  const d = new Date(deadline);
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export function isOverdue(deadline: Date | string | null): boolean {
  if (!deadline) return false;
  return new Date(deadline) < new Date();
}

/** Format a Date|string for <input type="date"> (YYYY-MM-DD) */
export function toDateInputValue(deadline: Date | string | null): string {
  if (!deadline) return "";
  const d = new Date(deadline);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export function progressPct(total: number, done: number): number {
  if (total === 0) return 0;
  return Math.round((done / total) * 100);
}
```

- [ ] **Step 2: Commit**

```bash
git add "src/app/(app)/[companyId]/projects/projects-config.ts"
git commit -m "feat(projects): add shared types and design token config"
```

---

## Task 4: Project Modal (Create / Edit)

**Files:**
- Create: `src/app/(app)/[companyId]/projects/project-modal.tsx`

- [ ] **Step 1: Create the modal component**

```tsx
// src/app/(app)/[companyId]/projects/project-modal.tsx
"use client";

import { useActionState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, AlertCircle } from "lucide-react";
import {
  createProjectAction,
  updateProjectAction,
  type ProjectState,
} from "@/lib/actions/projects";
import type { ClientOption, ProjectToEdit } from "./projects-config";
import { toDateInputValue } from "./projects-config";

const FIELD =
  "w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder-gray-600 outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all duration-150";

const LABEL = "block text-xs font-medium text-gray-400 mb-2";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (title: string) => void;
  companyId: string;
  clients: ClientOption[];
  projectToEdit?: ProjectToEdit | null;
}

function ModalForm({
  onClose,
  onSuccess,
  companyId,
  clients,
  projectToEdit,
}: Omit<ProjectModalProps, "isOpen">) {
  const isEdit = !!projectToEdit;
  const [state, action, pending] = useActionState<ProjectState, FormData>(
    isEdit ? updateProjectAction : createProjectAction,
    null
  );
  const titleRef = useRef<HTMLInputElement>(null);
  const formRef  = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      const title = titleRef.current?.value ?? "Projet";
      formRef.current?.reset();
      onSuccess(title);
      onClose();
    }
  }, [state?.success, onClose, onSuccess]);

  return (
    <form ref={formRef} action={action} className="flex flex-col h-full">
      <input type="hidden" name="companyId" value={companyId} />
      {isEdit && <input type="hidden" name="projectId" value={projectToEdit.id} />}

      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-white/[0.06]">
        <div>
          <h2 className="text-base font-semibold text-white">
            {isEdit ? "Modifier le projet" : "Nouveau projet"}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Lié au workspace · visible par tous les membres
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/[0.07] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Fields */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
        {state?.error && (
          <div className="flex items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-500/[0.07] px-4 py-3 text-sm text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {state.error}
          </div>
        )}

        {/* Title */}
        <div>
          <label className={LABEL}>Titre <span className="text-orange-400">*</span></label>
          <input
            ref={titleRef}
            name="title"
            type="text"
            placeholder="Ex: Refonte site web, API v2…"
            required
            disabled={pending}
            autoFocus
            defaultValue={projectToEdit?.title ?? ""}
            className={FIELD}
          />
        </div>

        {/* Description */}
        <div>
          <label className={LABEL}>Description</label>
          <textarea
            name="description"
            rows={3}
            placeholder="Objectifs, contexte…"
            disabled={pending}
            defaultValue={projectToEdit?.description ?? ""}
            className={`${FIELD} resize-none`}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Status */}
          <div>
            <label className={LABEL}>Statut</label>
            <select
              name="status"
              disabled={pending}
              defaultValue={projectToEdit?.status ?? "BACKLOG"}
              className={`${FIELD} appearance-none bg-zinc-950`}
            >
              <option value="BACKLOG">Backlog</option>
              <option value="IN_PROGRESS">En cours</option>
              <option value="REVIEW">Review</option>
              <option value="DONE">Terminé</option>
            </select>
          </div>

          {/* Deadline */}
          <div>
            <label className={LABEL}>Deadline</label>
            <input
              name="deadline"
              type="date"
              disabled={pending}
              defaultValue={toDateInputValue(projectToEdit?.deadline ?? null)}
              className={`${FIELD} [color-scheme:dark]`}
            />
          </div>
        </div>

        {/* Client */}
        <div>
          <label className={LABEL}>Client (optionnel)</label>
          <select
            name="clientId"
            disabled={pending}
            defaultValue={projectToEdit?.clientId ?? ""}
            className={`${FIELD} appearance-none bg-zinc-950`}
          >
            <option value="">Sans client</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-5 border-t border-white/[0.06] flex gap-3">
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
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-sm font-semibold text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {pending ? (
            <><Loader2 className="w-4 h-4 animate-spin" />{isEdit ? "Mise à jour…" : "Création…"}</>
          ) : isEdit ? "Enregistrer" : "Créer le projet"}
        </button>
      </div>
    </form>
  );
}

export function ProjectModal(props: ProjectModalProps) {
  const { isOpen, onClose, onSuccess, companyId, clients, projectToEdit } = props;
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              key={projectToEdit?.id ?? "new-project"}
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="pointer-events-auto w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl bg-[#0c0c0c]/95 backdrop-blur-xl border border-white/[0.08] shadow-2xl shadow-black/70"
            >
              <ModalForm
                key={projectToEdit?.id ?? "new"}
                onClose={onClose}
                onSuccess={onSuccess}
                companyId={companyId}
                clients={clients}
                projectToEdit={projectToEdit}
              />
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add "src/app/(app)/[companyId]/projects/project-modal.tsx"
git commit -m "feat(projects): add project create/edit glassmorphism modal"
```

---

## Task 5: Grid View

**Files:**
- Create: `src/app/(app)/[companyId]/projects/projects-grid.tsx`

- [ ] **Step 1: Create the grid component**

```tsx
// src/app/(app)/[companyId]/projects/projects-grid.tsx
"use client";

import { motion } from "framer-motion";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import {
  STATUS_CONFIG,
  formatDeadline,
  isOverdue,
  progressPct,
  type ProjectRow,
  type ProjectToEdit,
} from "./projects-config";

function CardMenu({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  return (
    <div ref={ref} className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 hover:text-white hover:bg-white/[0.06] transition-colors"
      >
        <MoreHorizontal className="w-3.5 h-3.5" />
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-20 w-36 rounded-xl bg-[#111]/95 backdrop-blur-xl border border-white/[0.08] shadow-xl overflow-hidden">
          <button
            type="button"
            onClick={() => { setOpen(false); onEdit(); }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium text-gray-300 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" /> Modifier
          </button>
          <div className="h-px bg-white/[0.06]" />
          <button
            type="button"
            onClick={() => { setOpen(false); onDelete(); }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/[0.08] transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Supprimer
          </button>
        </div>
      )}
    </div>
  );
}

interface Props {
  projects: ProjectRow[];
  onEdit: (p: ProjectToEdit) => void;
  onDelete: (p: ProjectRow) => void;
  onAdd: () => void;
}

export default function ProjectsGrid({ projects, onEdit, onDelete, onAdd }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {projects.map((p, i) => {
        const cfg = STATUS_CONFIG[p.status];
        const pct = progressPct(p.totalTasks, p.doneTasks);
        const dl  = formatDeadline(p.deadline);
        const overdue = isOverdue(p.deadline) && p.status !== "DONE";
        return (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="relative overflow-hidden bg-white/[0.025] border border-white/[0.06] rounded-2xl p-5 hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-200 cursor-default group"
          >
            {/* Ambient glow */}
            <div className={`absolute -top-5 -right-5 w-20 h-20 rounded-full blur-2xl opacity-[0.07] pointer-events-none ${cfg.bg}`} />

            <div className="flex items-start justify-between mb-3">
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${cfg.textColor} ${cfg.bg} ${cfg.border}`}>
                {cfg.label}
              </span>
              <CardMenu
                onEdit={() => onEdit({ id: p.id, title: p.title, description: p.description, status: p.status, clientId: p.clientId, deadline: p.deadline })}
                onDelete={() => onDelete(p)}
              />
            </div>

            <div className="mb-1">
              <h3 className="text-sm font-semibold text-white leading-snug">{p.title}</h3>
              {p.clientName && (
                <p className="text-xs text-gray-600 mt-0.5">{p.clientName}</p>
              )}
            </div>

            {p.description && (
              <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 mb-3">{p.description}</p>
            )}

            <div className="mt-4">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] text-gray-600">
                  {p.doneTasks}/{p.totalTasks} tâches
                </span>
                <span className="text-[10px] font-semibold text-gray-500">{pct}%</span>
              </div>
              <div className="h-[3px] bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${cfg.bar}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            {dl && (
              <p className={`text-[10px] mt-3 ${overdue ? "text-red-400" : "text-gray-600"}`}>
                {overdue ? "⏰" : "📅"} {dl}
              </p>
            )}
          </motion.div>
        );
      })}

      {/* Add card */}
      <button
        type="button"
        onClick={onAdd}
        className="min-h-[180px] rounded-2xl border border-dashed border-white/[0.08] flex flex-col items-center justify-center gap-2 text-gray-700 hover:text-orange-400 hover:border-orange-500/30 hover:bg-orange-500/[0.03] transition-all duration-200 cursor-pointer"
      >
        <svg className="w-5 h-5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M8 3v10M3 8h10"/></svg>
        <span className="text-xs font-medium">Nouveau projet</span>
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add "src/app/(app)/[companyId]/projects/projects-grid.tsx"
git commit -m "feat(projects): add grid view with progress cards"
```

---

## Task 6: List View

**Files:**
- Create: `src/app/(app)/[companyId]/projects/projects-list.tsx`

- [ ] **Step 1: Create the list component**

```tsx
// src/app/(app)/[companyId]/projects/projects-list.tsx
"use client";

import { motion } from "framer-motion";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  STATUS_CONFIG,
  formatDeadline,
  isOverdue,
  progressPct,
  type ProjectRow,
  type ProjectToEdit,
} from "./projects-config";

interface Props {
  projects: ProjectRow[];
  onEdit: (p: ProjectToEdit) => void;
  onDelete: (p: ProjectRow) => void;
  onAdd: () => void;
}

export default function ProjectsList({ projects, onEdit, onDelete, onAdd }: Props) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl overflow-hidden">
      {/* Table header */}
      <div className="grid grid-cols-[2fr_1fr_1fr_110px_100px_80px] gap-4 px-5 py-3 border-b border-white/[0.04] bg-white/[0.01]">
        {["Projet", "Client", "Progression", "Statut", "Deadline", ""].map((h) => (
          <span key={h} className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
            {h}
          </span>
        ))}
      </div>

      {/* Rows */}
      {projects.map((p, i) => {
        const cfg    = STATUS_CONFIG[p.status];
        const pct    = progressPct(p.totalTasks, p.doneTasks);
        const dl     = formatDeadline(p.deadline);
        const overdue = isOverdue(p.deadline) && p.status !== "DONE";
        return (
          <motion.div
            key={p.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.03 }}
            className="grid grid-cols-[2fr_1fr_1fr_110px_100px_80px] gap-4 px-5 py-4 items-center border-b border-white/[0.03] hover:bg-white/[0.025] transition-colors group"
          >
            {/* Title */}
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{p.title}</p>
              {p.description && (
                <p className="text-xs text-gray-600 truncate mt-0.5">{p.description}</p>
              )}
            </div>

            {/* Client */}
            <span className="text-xs text-gray-500 truncate">
              {p.clientName ?? <span className="text-gray-700">—</span>}
            </span>

            {/* Progression */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-[3px] bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${cfg.bar}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-[10px] text-gray-600 w-7 text-right tabular-nums">{pct}%</span>
            </div>

            {/* Status */}
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border w-fit ${cfg.textColor} ${cfg.bg} ${cfg.border}`}>
              {cfg.label}
            </span>

            {/* Deadline */}
            <span className={`text-xs ${overdue ? "text-red-400" : dl ? "text-gray-500" : "text-gray-700"}`}>
              {dl ? (overdue ? `⏰ ${dl}` : dl) : "—"}
            </span>

            {/* Actions */}
            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => onEdit({ id: p.id, title: p.title, description: p.description, status: p.status, clientId: p.clientId, deadline: p.deadline })}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                <Pencil className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(p)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-500/[0.08] transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        );
      })}

      {/* Add row */}
      <button
        type="button"
        onClick={onAdd}
        className="w-full flex items-center gap-2 px-5 py-3.5 text-xs text-gray-600 hover:text-orange-400 hover:bg-orange-500/[0.03] transition-colors"
      >
        <Plus className="w-3.5 h-3.5" /> Nouveau projet
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add "src/app/(app)/[companyId]/projects/projects-list.tsx"
git commit -m "feat(projects): add list view with hover actions"
```

---

## Task 7: Kanban View

**Files:**
- Create: `src/app/(app)/[companyId]/projects/projects-kanban.tsx`

- [ ] **Step 1: Create the kanban component**

```tsx
// src/app/(app)/[companyId]/projects/projects-kanban.tsx
"use client";

import { motion } from "framer-motion";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  STATUS_CONFIG,
  PRIORITY_DOT,
  formatDeadline,
  isOverdue,
  progressPct,
  type ProjectRow,
  type ProjectToEdit,
} from "./projects-config";

const COLUMNS = [
  { key: "BACKLOG",     label: "Backlog"   },
  { key: "IN_PROGRESS", label: "En cours"  },
  { key: "REVIEW",      label: "Review"    },
  { key: "DONE",        label: "Terminé"   },
] as const;

interface Props {
  projects: ProjectRow[];
  onEdit: (p: ProjectToEdit) => void;
  onDelete: (p: ProjectRow) => void;
  onAdd: () => void;
}

export default function ProjectsKanban({ projects, onEdit, onDelete, onAdd }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {COLUMNS.map(({ key, label }) => {
        const cfg   = STATUS_CONFIG[key];
        const cards = projects.filter((p) => p.status === key);
        return (
          <div
            key={key}
            className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-4 flex flex-col gap-3"
          >
            {/* Column header */}
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold uppercase tracking-wider ${cfg.textColor}`}>
                {label}
              </span>
              <span className="text-[10px] text-gray-600 bg-white/[0.05] px-2 py-0.5 rounded-full">
                {cards.length}
              </span>
            </div>

            {/* Cards */}
            {cards.map((p, i) => {
              const pct     = progressPct(p.totalTasks, p.doneTasks);
              const dl      = formatDeadline(p.deadline);
              const overdue = isOverdue(p.deadline) && p.status !== "DONE";
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 hover:bg-white/[0.06] hover:border-white/[0.1] transition-all group"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-xs font-semibold text-white leading-snug flex-1">{p.title}</p>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        type="button"
                        onClick={() => onEdit({ id: p.id, title: p.title, description: p.description, status: p.status, clientId: p.clientId, deadline: p.deadline })}
                        className="w-5 h-5 rounded flex items-center justify-center text-gray-600 hover:text-white hover:bg-white/[0.08] transition-colors"
                      >
                        <Pencil className="w-2.5 h-2.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(p)}
                        className="w-5 h-5 rounded flex items-center justify-center text-gray-600 hover:text-red-400 hover:bg-red-500/[0.08] transition-colors"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>

                  {p.clientName && (
                    <p className="text-[10px] text-gray-600 mb-2">{p.clientName}</p>
                  )}

                  {p.totalTasks > 0 && (
                    <div className="mb-2">
                      <div className="flex justify-between mb-1">
                        <span className="text-[10px] text-gray-600">{p.doneTasks}/{p.totalTasks}</span>
                        <span className="text-[10px] text-gray-600">{pct}%</span>
                      </div>
                      <div className="h-[2px] bg-white/[0.06] rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${cfg.bar}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-1">
                    <span className={`text-[10px] ${overdue ? "text-red-400" : dl ? "text-gray-600" : "text-gray-700"}`}>
                      {dl ? (overdue ? `⏰ ${dl}` : dl) : ""}
                    </span>
                  </div>
                </motion.div>
              );
            })}

            {/* Add button */}
            <button
              type="button"
              onClick={onAdd}
              className="flex items-center gap-1.5 px-2 py-2 rounded-xl text-[10px] text-gray-600 hover:text-orange-400 hover:bg-orange-500/[0.04] border border-dashed border-transparent hover:border-orange-500/20 transition-all"
            >
              <Plus className="w-3 h-3" /> Ajouter
            </button>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add "src/app/(app)/[companyId]/projects/projects-kanban.tsx"
git commit -m "feat(projects): add kanban view with 4 status columns"
```

---

## Task 8: ProjectsShell

**Files:**
- Create: `src/app/(app)/[companyId]/projects/projects-shell.tsx`

- [ ] **Step 1: Create the shell component**

```tsx
// src/app/(app)/[companyId]/projects/projects-shell.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, CheckCircle2, Loader2, Trash2 } from "lucide-react";
import { deleteProjectAction } from "@/lib/actions/projects";
import { ProjectModal } from "./project-modal";
import ProjectsGrid from "./projects-grid";
import ProjectsList from "./projects-list";
import ProjectsKanban from "./projects-kanban";
import type { ProjectRow, ClientOption, ProjectToEdit } from "./projects-config";

type View = "grid" | "list" | "kanban";

// ─── View Switcher ──────────────────────────────────────

const VIEW_BUTTONS: { id: View; label: string; icon: React.ReactNode }[] = [
  {
    id: "kanban",
    label: "Kanban",
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="1" y="2" width="4" height="12" rx="1"/><rect x="6" y="2" width="4" height="8" rx="1"/><rect x="11" y="2" width="4" height="10" rx="1"/>
      </svg>
    ),
  },
  {
    id: "list",
    label: "Liste",
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M2 4h12M2 8h12M2 12h8"/>
      </svg>
    ),
  },
  {
    id: "grid",
    label: "Grille",
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/><rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/>
      </svg>
    ),
  },
];

// ─── Toast ──────────────────────────────────────────────

function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  useEffect(() => {
    const id = setTimeout(onDismiss, 3000);
    return () => clearTimeout(id);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      onClick={onDismiss}
      className="fixed top-4 right-4 z-[60] flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#0d0d0d]/95 backdrop-blur-xl border border-emerald-500/25 shadow-xl shadow-black/50 cursor-pointer select-none"
    >
      <div className="w-7 h-7 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
      </div>
      <p className="text-sm font-semibold text-white">{message}</p>
    </motion.div>
  );
}

// ─── Delete Confirm Dialog ──────────────────────────────

function DeleteConfirmDialog({
  title,
  onCancel,
  onConfirm,
  isDeleting,
}: {
  title: string;
  onCancel: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <motion.div
        initial={{ scale: 0.95, y: 8 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 8 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="relative z-10 w-full max-w-sm rounded-2xl bg-[#0f0f0f]/95 backdrop-blur-xl border border-white/[0.08] shadow-2xl p-6"
      >
        <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
          <Trash2 className="w-5 h-5 text-red-400" />
        </div>
        <h3 className="text-sm font-semibold text-white mb-1">Supprimer ce projet ?</h3>
        <p className="text-xs text-gray-500 mb-6 leading-relaxed">
          <span className="text-gray-300 font-medium">«{title}»</span> et toutes ses tâches seront définitivement supprimés.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-500 border border-white/[0.07] hover:text-white hover:bg-white/[0.05] transition-colors"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500 hover:bg-red-400 text-sm font-semibold text-white transition-colors disabled:opacity-60"
          >
            {isDeleting
              ? <><Loader2 className="w-4 h-4 animate-spin" />Suppression…</>
              : "Supprimer"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Shell ──────────────────────────────────────────────

interface Props {
  companyId: string;
  projects: ProjectRow[];
  clients: ClientOption[];
}

export default function ProjectsShell({ companyId, projects, clients }: Props) {
  const [view, setView] = useState<View>("grid");
  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<ProjectToEdit | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProjectRow | null>(null);
  const [isDeleting, setIsDeleting]     = useState(false);
  const [toast, setToast]               = useState<string | null>(null);
  const dismissToast = useCallback(() => setToast(null), []);

  function handleOpenCreate() {
    setProjectToEdit(null);
    setIsModalOpen(true);
  }

  function handleOpenEdit(p: ProjectToEdit) {
    setProjectToEdit(p);
    setIsModalOpen(true);
  }

  function handleModalClose() {
    setIsModalOpen(false);
    setProjectToEdit(null);
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    await deleteProjectAction(deleteTarget.id, companyId);
    setIsDeleting(false);
    setToast(`"${deleteTarget.title}" supprimé`);
    setDeleteTarget(null);
  }

  const viewProps = {
    projects,
    onEdit: handleOpenEdit,
    onDelete: (p: ProjectRow) => setDeleteTarget(p),
    onAdd: handleOpenCreate,
  };

  return (
    <>
      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast message={toast} onDismiss={dismissToast} />}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteTarget && (
          <DeleteConfirmDialog
            title={deleteTarget.title}
            onCancel={() => setDeleteTarget(null)}
            onConfirm={handleConfirmDelete}
            isDeleting={isDeleting}
          />
        )}
      </AnimatePresence>

      {/* Create / Edit modal */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={(title) => setToast(`"${title}" ${projectToEdit ? "modifié" : "créé"}`)}
        companyId={companyId}
        clients={clients}
        projectToEdit={projectToEdit}
      />

      {/* Page content */}
      <div className="p-6">
        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Projets</h1>
            <p className="text-sm text-gray-500 mt-1">{projects.length} projet{projects.length !== 1 ? "s" : ""}</p>
          </div>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-xs font-semibold text-white transition-colors shadow-lg shadow-orange-500/20"
          >
            <Plus className="w-3.5 h-3.5" />
            Nouveau projet
          </button>
        </div>

        {/* View switcher + stats */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex gap-0.5 bg-white/[0.04] border border-white/[0.07] rounded-xl p-1">
            {VIEW_BUTTONS.map(({ id, label, icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setView(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  view === id
                    ? "bg-orange-500/12 text-orange-400 border border-orange-500/20"
                    : "text-gray-500 hover:text-gray-300 hover:bg-white/[0.04]"
                }`}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>
          <div className="flex gap-4 text-xs text-gray-600">
            <span><span className="text-sky-400 font-semibold">{projects.filter(p => p.status === "IN_PROGRESS").length}</span> en cours</span>
            <span><span className="text-orange-400 font-semibold">{projects.filter(p => p.status === "BACKLOG").length}</span> backlog</span>
            <span><span className="text-emerald-400 font-semibold">{projects.filter(p => p.status === "DONE").length}</span> terminés</span>
          </div>
        </div>

        {/* Empty state */}
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">Aucun projet</p>
            <p className="text-xs text-gray-700 mb-4">Créez votre premier projet pour commencer.</p>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-xs font-medium text-orange-400 hover:bg-orange-500/15 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Créer un projet
            </button>
          </div>
        ) : (
          <>
            {view === "grid"   && <ProjectsGrid    {...viewProps} />}
            {view === "list"   && <ProjectsList    {...viewProps} />}
            {view === "kanban" && <ProjectsKanban  {...viewProps} />}
          </>
        )}
      </div>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add "src/app/(app)/[companyId]/projects/projects-shell.tsx"
git commit -m "feat(projects): add ProjectsShell with view switcher, modal, delete confirm"
```

---

## Task 9: Page + Sidebar + Seed

**Files:**
- Create: `src/app/(app)/[companyId]/projects/page.tsx`
- Modify: `src/components/app-sidebar.tsx`
- Create: `prisma/seed.ts`
- Modify: `package.json`

- [ ] **Step 1: Create the Server Component page**

```tsx
// src/app/(app)/[companyId]/projects/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProjectsShell from "./projects-shell";
import type { ProjectRow, ClientOption } from "./projects-config";

export default async function ProjectsPage({
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

  const [rawProjects, clients] = await Promise.all([
    prisma.project.findMany({
      where: { companyId },
      orderBy: { updatedAt: "desc" },
      include: {
        client: { select: { name: true } },
        tasks:  { select: { status: true } },
      },
    }),
    prisma.client.findMany({
      where: { companyId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const projects: ProjectRow[] = rawProjects.map((p) => ({
    id:          p.id,
    title:       p.title,
    description: p.description,
    status:      p.status as ProjectRow["status"],
    clientId:    p.clientId,
    clientName:  p.client?.name ?? null,
    deadline:    p.deadline,
    totalTasks:  p.tasks.length,
    doneTasks:   p.tasks.filter((t) => t.status === "DONE").length,
    createdAt:   p.createdAt,
  }));

  const clientOptions: ClientOption[] = clients;

  return <ProjectsShell companyId={companyId} projects={projects} clients={clientOptions} />;
}
```

- [ ] **Step 2: Add Projects to sidebar**

In `src/components/app-sidebar.tsx`, change the import line:

```tsx
import { LayoutDashboard, Settings, UsersRound, LogOut, Building2, Lock } from "lucide-react";
```

to:

```tsx
import { LayoutDashboard, Settings, UsersRound, LogOut, Building2, Lock, FolderKanban } from "lucide-react";
```

Then in the `NAV_ITEMS` array, add between Clients and Coffre-fort:

```tsx
const NAV_ITEMS = [
  { href: `/${companyId}/dashboard`, label: "Dashboard",   icon: LayoutDashboard },
  { href: `/${companyId}/clients`,   label: "Clients",     icon: UsersRound },
  { href: `/${companyId}/projects`,  label: "Projets",     icon: FolderKanban },
  { href: `/${companyId}/vault`,     label: "Coffre-fort", icon: Lock },
  { href: `/${companyId}/settings`,  label: "Paramètres",  icon: Settings },
];
```

- [ ] **Step 3: Install tsx for seed script**

```bash
npm install -D tsx
```

- [ ] **Step 4: Configure seed in package.json**

In `package.json`, add a `"prisma"` key at the top level (after `"private": true`):

```json
"prisma": {
  "seed": "npx tsx prisma/seed.ts"
},
```

- [ ] **Step 5: Create the seed file**

```ts
// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const company = await prisma.company.findFirst();
  if (!company) {
    console.log("No company found — log in and create a workspace first, then re-run the seed.");
    return;
  }

  // Clean up existing seed data
  await prisma.task.deleteMany({
    where: { project: { companyId: company.id } },
  });
  await prisma.project.deleteMany({ where: { companyId: company.id } });

  // Optional: find a client to link
  const client = await prisma.client.findFirst({ where: { companyId: company.id } });

  // Project 1 — In progress, linked to client
  const p1 = await prisma.project.create({
    data: {
      title: "Refonte site web",
      description: "Nouveau design + migration vers Next.js",
      status: "IN_PROGRESS",
      companyId: company.id,
      clientId: client?.id ?? null,
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    },
  });
  await prisma.task.createMany({
    data: [
      { title: "Brief client",        status: "DONE",  priority: "HIGH",   projectId: p1.id },
      { title: "Maquettes Figma",     status: "DONE",  priority: "HIGH",   projectId: p1.id },
      { title: "Intégration HTML/CSS",status: "DOING", priority: "MEDIUM", projectId: p1.id },
      { title: "Dev Next.js",         status: "TODO",  priority: "HIGH",   projectId: p1.id, deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
      { title: "Tests & mise en ligne",status: "TODO", priority: "MEDIUM", projectId: p1.id },
    ],
  });

  // Project 2 — In progress
  const p2 = await prisma.project.create({
    data: {
      title: "API v2 — Refactoring",
      description: "Migration vers architecture modulaire",
      status: "IN_PROGRESS",
      companyId: company.id,
    },
  });
  await prisma.task.createMany({
    data: [
      { title: "Audit du code existant", status: "DONE", priority: "HIGH",   projectId: p2.id },
      { title: "Refactor auth module",   status: "TODO", priority: "HIGH",   projectId: p2.id },
      { title: "Refactor CRM module",    status: "TODO", priority: "MEDIUM", projectId: p2.id },
      { title: "Tests end-to-end",       status: "TODO", priority: "LOW",    projectId: p2.id },
      { title: "Documentation API",      status: "TODO", priority: "LOW",    projectId: p2.id },
    ],
  });

  // Project 3 — Review
  const p3 = await prisma.project.create({
    data: {
      title: "Audit sécurité",
      status: "REVIEW",
      companyId: company.id,
      deadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
    },
  });
  await prisma.task.createMany({
    data: [
      { title: "Scan des dépendances", status: "DONE",  priority: "HIGH",   projectId: p3.id },
      { title: "Pentest API",          status: "DONE",  priority: "HIGH",   projectId: p3.id },
      { title: "Rapport de vulnérabilités", status: "DONE", priority: "MEDIUM", projectId: p3.id },
      { title: "Correctifs critiques", status: "DOING", priority: "HIGH",   projectId: p3.id },
      { title: "Validation finale",    status: "TODO",  priority: "MEDIUM", projectId: p3.id },
    ],
  });

  // Project 4 — Backlog
  const p4 = await prisma.project.create({
    data: {
      title: "App mobile v1",
      status: "BACKLOG",
      companyId: company.id,
      deadline: new Date(Date.now() + 52 * 24 * 60 * 60 * 1000),
    },
  });
  await prisma.task.createMany({
    data: [
      { title: "Définir le scope",     status: "TODO", priority: "HIGH",   projectId: p4.id },
      { title: "Choix techno (RN/Expo)", status: "TODO", priority: "MEDIUM", projectId: p4.id },
      { title: "Maquettes mobile",     status: "TODO", priority: "MEDIUM", projectId: p4.id },
      { title: "Dev MVP",              status: "TODO", priority: "HIGH",   projectId: p4.id },
    ],
  });

  // Project 5 — Done
  const p5 = await prisma.project.create({
    data: {
      title: "Onboarding client V2",
      description: "Refonte du flow d'inscription",
      status: "DONE",
      companyId: company.id,
    },
  });
  await prisma.task.createMany({
    data: [
      { title: "Wireframes onboarding", status: "DONE", priority: "HIGH",   projectId: p5.id },
      { title: "Intégration",          status: "DONE",  priority: "HIGH",   projectId: p5.id },
      { title: "Tests utilisateur",    status: "DONE",  priority: "MEDIUM", projectId: p5.id },
      { title: "Analytics events",     status: "DONE",  priority: "LOW",    projectId: p5.id },
      { title: "Email de bienvenue",   status: "DONE",  priority: "LOW",    projectId: p5.id },
      { title: "Déploiement prod",     status: "DONE",  priority: "HIGH",   projectId: p5.id },
    ],
  });

  console.log(`✓ Seeded 5 projects (${p1.id.slice(0, 6)}…) in company "${company.name}"`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
```

- [ ] **Step 6: Run the seed**

```bash
npx prisma db seed
```

Expected output: `✓ Seeded 5 projects (...) in company "..."`

- [ ] **Step 7: Commit**

```bash
git add "src/app/(app)/[companyId]/projects/page.tsx" src/components/app-sidebar.tsx prisma/seed.ts package.json package-lock.json
git commit -m "feat(projects): add page, sidebar link, and seed data"
```

---

## Task 10: Build Verification

- [ ] **Step 1: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no output (zero errors).

- [ ] **Step 2: Production build**

```bash
npm run build
```

Expected output includes:
```
├ ƒ /[companyId]/projects
```
And `✓ Compiled successfully`.

- [ ] **Step 3: Smoke test in dev**

```bash
npm run dev
```

Open `http://localhost:3000`, log in, navigate to `/{companyId}/projects`. Verify:
- [ ] Page loads with 5 seed projects
- [ ] Grid view shows cards with progress bars
- [ ] List / Kanban buttons switch views without reload
- [ ] "Nouveau projet" button opens the modal
- [ ] Create a project → toast "créé" appears, project appears in list
- [ ] Edit a project → form pre-fills, toast "modifié" appears
- [ ] Delete a project → confirm dialog appears, toast "supprimé" appears
- [ ] Sidebar shows "Projets" with FolderKanban icon, active state works

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat(projects): complete module — grid/list/kanban views, CRUD, seed data"
```

---

## Self-Review

**Spec coverage:**
| Requirement | Task |
|-------------|------|
| Project model with title, description, status, clientId, deadline | Task 1 |
| Task model with title, status (TODO/DOING/DONE), priority, deadline | Task 1 |
| Optional Client relation | Task 1 + Task 4 (clientId field) |
| Back-relations on Client + Company | Task 1 |
| createProject / updateProject / deleteProject server actions | Task 2 |
| Membership + ownership verification | Task 2 |
| Grid view with progress bars + status colors | Task 5 |
| List view compact table | Task 6 |
| Kanban view 4 columns | Task 7 |
| View switcher (grid default) | Task 8 |
| Glassmorphism modal create/edit | Task 4 |
| Delete confirm dialog | Task 8 |
| Toast notifications | Task 8 |
| Sidebar nav item (FolderKanban) | Task 9 |
| Seed data (5 projects + tasks) | Task 9 |
| Build verification | Task 10 |

**Placeholder scan:** None found.

**Type consistency:**
- `ProjectRow` defined in `projects-config.ts`, imported in shell + all 3 views ✓
- `ProjectToEdit` defined in `projects-config.ts`, used in modal props + view onEdit callbacks ✓
- `ClientOption` defined in `projects-config.ts`, threaded from page → shell → modal ✓
- `ProjectState` defined in `projects.ts`, used in `useActionState` calls in modal ✓
- `STATUS_CONFIG` keys (`BACKLOG`, `IN_PROGRESS`, `REVIEW`, `DONE`) match `ProjectStatus` enum values ✓
- `progressPct`, `formatDeadline`, `isOverdue`, `toDateInputValue` defined in config, used consistently ✓

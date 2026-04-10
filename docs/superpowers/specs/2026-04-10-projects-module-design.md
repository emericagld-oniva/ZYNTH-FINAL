# Module Projets — Design Spec

**Date:** 2026-04-10
**Status:** Approved

---

## Goal

Build a company-scoped project management module at `/[companyId]/projects` with three switchable views (Grid, List, Kanban), task tracking, and an optional link to the CRM client.

---

## Architecture

### Pattern
Identical to the Vault module: a Server Component page fetches all data, passes it to a `ProjectsShell` Client Component that owns the `view` state (`grid | list | kanban`). No re-fetch on view switch — all views share the same data in memory.

### Routes
- `/[companyId]/projects` — projects list (3 views)
- `/[companyId]/projects/[projectId]` — project detail with task list (future)

---

## Data Model

### Project
```prisma
model Project {
  id          String        @id @default(cuid())
  title       String
  description String?
  status      ProjectStatus @default(BACKLOG)
  clientId    String?                                      // optional CRM link
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

enum ProjectStatus {
  BACKLOG
  IN_PROGRESS
  REVIEW
  DONE
}
```

### Task
```prisma
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

### Schema changes to existing models
- `Client` model: add `projects Project[]` back-relation
- `Company` model: add `projects Project[]` back-relation

---

## UI Components

### File map

| File | Role |
|------|------|
| `prisma/schema.prisma` | Add Project, Task, enums, back-relations |
| `src/app/(app)/[companyId]/projects/page.tsx` | Server Component — fetch projects with task counts + client name |
| `src/app/(app)/[companyId]/projects/projects-shell.tsx` | Client Component — view switcher + renders one of 3 view sub-components |
| `src/app/(app)/[companyId]/projects/views/projects-grid.tsx` | Grid view — cards with progress bars |
| `src/app/(app)/[companyId]/projects/views/projects-list.tsx` | List view — compact table |
| `src/app/(app)/[companyId]/projects/views/projects-kanban.tsx` | Kanban view — 4 status columns |
| `src/app/(app)/[companyId]/projects/project-modal.tsx` | Create/Edit project modal (glassmorphism, same pattern as VaultItemDrawer) |
| `src/lib/actions/projects.ts` | Server Actions: createProject, updateProject, deleteProject |
| `src/components/app-sidebar.tsx` | Add Projects nav item (FolderKanban icon) |

### View switcher
Three icon buttons (Kanban / Liste / Grille) in a pill container, orange accent on active. Default: `grid`. State lives in `ProjectsShell` — `useState<'grid'|'list'|'kanban'>('grid')`.

### Design tokens (approved)

| Element | Color |
|---------|-------|
| Status BACKLOG | `#f97316` orange |
| Status IN_PROGRESS | `#38bdf8` sky |
| Status REVIEW | `#a78bfa` violet |
| Status DONE | `#4ade80` green |
| Priority HIGH dot | `#f87171` red |
| Priority MEDIUM dot | `#fbbf24` amber |
| Priority LOW dot | `#6b7280` gray |
| Progress bar | Matches status color |
| Overdue deadline | `#f87171` red |

### Progression calculation
`progress = tasks.filter(t => t.status === 'DONE').length / tasks.length` (0 if no tasks).
Computed server-side via `_count` and a `doneCount` aggregation, passed as props.

### Project modal (create / edit)
- Fields: Title*, Description, Status (select), Client (select from company clients), Deadline (date input)
- Same centered modal pattern as VaultItemDrawer: backdrop blur, spring animation, glassmorphism container
- `useActionState` with `createProjectAction` / `updateProjectAction`

---

## Server Actions

```ts
// src/lib/actions/projects.ts
createProjectAction(_prev, formData)   // title, description, status, clientId, deadline, companyId
updateProjectAction(_prev, formData)   // + projectId
deleteProjectAction(projectId, companyId)
```

All actions: verify session → verify CompanyMember → act → revalidatePath.

---

## Seed data

A `prisma/seed.ts` (or inline SQL via `prisma db seed`) inserts 5 sample projects with tasks into the first company found, so the UI renders immediately with real data.

---

## Out of scope (v1)

- Project detail page (`/projects/[projectId]`) — task CRUD within a project
- Drag & drop between kanban columns
- Task assignees
- File attachments

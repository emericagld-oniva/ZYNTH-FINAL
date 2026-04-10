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

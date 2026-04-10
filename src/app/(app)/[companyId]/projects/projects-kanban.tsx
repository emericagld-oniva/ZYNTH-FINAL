// src/app/(app)/[companyId]/projects/projects-kanban.tsx
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

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

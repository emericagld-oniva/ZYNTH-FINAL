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

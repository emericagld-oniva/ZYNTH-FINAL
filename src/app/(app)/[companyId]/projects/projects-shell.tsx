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

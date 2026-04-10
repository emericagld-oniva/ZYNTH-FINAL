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

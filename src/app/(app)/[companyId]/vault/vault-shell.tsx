// src/app/(app)/[companyId]/vault/vault-shell.tsx
"use client";

import { useState, useCallback, useEffect, useRef, useActionState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, FolderOpen, Key, Globe, Copy, Check,
  Loader2, CheckCircle2, X, Lock,
  MoreHorizontal, Pencil, Trash2,
} from "lucide-react";
import {
  decryptPasswordAction,
  createFolderAction,
  deleteVaultItemAction,
  type VaultState,
} from "@/lib/actions/vault";
import { VaultItemDrawer, type ItemToEdit } from "./vault-item-drawer";

// ─── Types ──────────────────────────────────────────────

interface VaultFolderRow {
  id: string;
  name: string;
  _count: { items: number };
}

interface VaultItemRow {
  id: string;
  title: string;
  username: string | null;
  url: string | null;
  notes: string | null;
  folderId: string | null;
  createdAt: Date | string;
}

// ─── New Folder Inline Form ──────────────────────────────

function NewFolderForm({ companyId, onDone }: { companyId: string; onDone: () => void }) {
  const [state, action, pending] = useActionState<VaultState, FormData>(createFolderAction, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) { formRef.current?.reset(); onDone(); }
  }, [state?.success, onDone]);

  return (
    <form ref={formRef} action={action} className="px-2 pb-2">
      <input type="hidden" name="companyId" value={companyId} />
      <div className="flex items-center gap-1">
        <input
          name="name" type="text" placeholder="Nom du dossier"
          autoFocus required disabled={pending}
          className="flex-1 px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.1] text-xs text-white placeholder-gray-600 outline-none focus:border-orange-500/40 transition-all"
        />
        <button type="submit" disabled={pending}
          className="w-6 h-6 rounded-lg flex items-center justify-center bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-colors shrink-0"
        >
          {pending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
        </button>
        <button type="button" onClick={onDone}
          className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-600 hover:text-white transition-colors shrink-0"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
      {state?.error && <p className="text-[11px] text-red-400 mt-1 px-1">{state.error}</p>}
    </form>
  );
}

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

// ─── Row Actions Dropdown ────────────────────────────────

function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
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
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 hover:text-white hover:bg-white/[0.06] transition-colors"
        title="Actions"
      >
        <MoreHorizontal className="w-3.5 h-3.5" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-8 z-30 w-36 rounded-xl bg-[#111]/95 backdrop-blur-xl border border-white/[0.08] shadow-xl shadow-black/50 overflow-hidden"
          >
            <button
              type="button"
              onClick={() => { setOpen(false); onEdit(); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium text-gray-300 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              Modifier
            </button>
            <div className="h-px bg-white/[0.06]" />
            <button
              type="button"
              onClick={() => { setOpen(false); onDelete(); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/[0.08] transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Supprimer
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Delete Confirm Dialog ───────────────────────────────

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
      key="delete-dialog"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      {/* Modal */}
      <motion.div
        initial={{ scale: 0.95, y: 8 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 8 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="relative z-10 w-full max-w-sm rounded-2xl bg-[#0f0f0f]/95 backdrop-blur-xl border border-white/[0.08] shadow-2xl shadow-black/60 p-6"
      >
        <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
          <Trash2 className="w-5 h-5 text-red-400" />
        </div>
        <h3 className="text-sm font-semibold text-white mb-1">
          Supprimer cette entrée ?
        </h3>
        <p className="text-xs text-gray-500 mb-6 leading-relaxed">
          <span className="text-gray-300 font-medium">«{title}»</span> sera
          définitivement supprimé. Cette action est irréversible.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-500 border border-white/[0.07] hover:text-white hover:bg-white/[0.05] transition-colors disabled:opacity-50"
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

// ─── Item Row ────────────────────────────────────────────

function ItemRow({
  item,
  onEdit,
  onDelete,
}: {
  item: VaultItemRow;
  onEdit: (item: VaultItemRow) => void;
  onDelete: (item: VaultItemRow) => void;
}) {
  const [copying, setCopying] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    setCopying(true);
    const result = await decryptPasswordAction(item.id);
    setCopying(false);
    if (result.password) {
      await navigator.clipboard.writeText(result.password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const domain = item.url
    ? (() => { try { return new URL(item.url).hostname; } catch { return item.url; } })()
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-[2fr_2fr_2fr_130px] gap-4 px-5 py-4 items-center group hover:bg-white/[0.03] transition-colors duration-100 cursor-default"
    >
      {/* Title */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0 group-hover:border-orange-500/25 group-hover:bg-orange-500/[0.06] transition-all duration-150">
          {item.url
            ? <Globe className="w-3.5 h-3.5 text-gray-500 group-hover:text-orange-400 transition-colors" />
            : <Key className="w-3.5 h-3.5 text-gray-500 group-hover:text-orange-400 transition-colors" />}
        </div>
        <span className="text-sm font-medium text-white truncate">{item.title}</span>
      </div>

      {/* Username */}
      <span className="text-sm text-gray-500 truncate">
        {item.username ?? <span className="text-gray-700">—</span>}
      </span>

      {/* URL */}
      <span className="text-xs text-gray-600 truncate">
        {domain ?? <span className="text-gray-700">—</span>}
      </span>

      {/* Actions */}
      <div className="flex items-center justify-end gap-1">
        <button
          type="button"
          onClick={handleCopy}
          disabled={copying}
          title="Copier le mot de passe"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
            copied
              ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
              : "text-gray-600 border border-transparent hover:text-white hover:bg-white/[0.05] hover:border-white/[0.07]"
          }`}
        >
          {copying
            ? <Loader2 className="w-3 h-3 animate-spin" />
            : copied
            ? <><Check className="w-3 h-3" />Copié</>
            : <><Copy className="w-3 h-3" />Copier</>}
        </button>
        <RowActions
          onEdit={() => onEdit(item)}
          onDelete={() => onDelete(item)}
        />
      </div>
    </motion.div>
  );
}

// ─── Shell ──────────────────────────────────────────────

export default function VaultShell({
  companyId,
  folders,
  items,
}: {
  companyId: string;
  folders: VaultFolderRow[];
  items: VaultItemRow[];
}) {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<ItemToEdit | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<VaultItemRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const dismissToast = useCallback(() => setToast(null), []);

  const visibleItems =
    selectedFolderId === null
      ? items
      : items.filter((i) => i.folderId === selectedFolderId);

  const selectedFolderName =
    selectedFolderId === null
      ? "Tous les mots de passe"
      : (folders.find((f) => f.id === selectedFolderId)?.name ?? "Dossier");

  function handleOpenCreate() {
    setItemToEdit(null);
    setIsDrawerOpen(true);
  }

  function handleOpenEdit(item: VaultItemRow) {
    setItemToEdit({
      id: item.id,
      title: item.title,
      username: item.username,
      url: item.url,
      notes: item.notes,
      folderId: item.folderId,
    });
    setIsDrawerOpen(true);
  }

  function handleDrawerClose() {
    setIsDrawerOpen(false);
    setItemToEdit(null);
  }

  async function handleConfirmDelete() {
    if (!deleteConfirmItem) return;
    setIsDeleting(true);
    await deleteVaultItemAction(deleteConfirmItem.id, companyId);
    setIsDeleting(false);
    setToast(`"${deleteConfirmItem.title}" supprimé`);
    setDeleteConfirmItem(null);
  }

  return (
    <>
      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast message={toast} onDismiss={dismissToast} />}
      </AnimatePresence>

      {/* Delete confirmation */}
      <AnimatePresence>
        {deleteConfirmItem && (
          <DeleteConfirmDialog
            title={deleteConfirmItem.title}
            onCancel={() => setDeleteConfirmItem(null)}
            onConfirm={handleConfirmDelete}
            isDeleting={isDeleting}
          />
        )}
      </AnimatePresence>

      {/* Create / Edit modal */}
      <VaultItemDrawer
        isOpen={isDrawerOpen}
        onClose={handleDrawerClose}
        onSuccess={(title) =>
          setToast(`"${title}" ${itemToEdit ? "modifié" : "enregistré"}`)
        }
        companyId={companyId}
        folders={folders}
        itemToEdit={itemToEdit}
      />

      {/* 2-column vault layout */}
      <div className="flex h-full">

        {/* ── Folder sidebar ────────────────────── */}
        <div className="w-56 shrink-0 border-r border-white/[0.05] bg-white/[0.02] flex flex-col">
          <div className="flex items-center justify-between px-4 pt-5 pb-3">
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Coffre-fort
              </span>
            </div>
            <button
              onClick={() => setShowNewFolder((v) => !v)}
              title="Nouveau dossier"
              className="w-5 h-5 rounded-md flex items-center justify-center text-gray-600 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <AnimatePresence>
            {showNewFolder && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <NewFolderForm companyId={companyId} onDone={() => setShowNewFolder(false)} />
              </motion.div>
            )}
          </AnimatePresence>

          <nav className="flex-1 px-2 py-1 space-y-0.5 overflow-y-auto">
            <button
              onClick={() => setSelectedFolderId(null)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors duration-100 ${
                selectedFolderId === null
                  ? "text-orange-300 bg-orange-500/[0.08] border border-orange-500/[0.15]"
                  : "text-gray-500 hover:text-gray-200 hover:bg-white/[0.03] border border-transparent"
              }`}
            >
              <Key className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Tous</span>
              <span className="ml-auto text-[10px] tabular-nums text-gray-700">{items.length}</span>
            </button>

            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => setSelectedFolderId(folder.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors duration-100 ${
                  selectedFolderId === folder.id
                    ? "text-orange-300 bg-orange-500/[0.08] border border-orange-500/[0.15]"
                    : "text-gray-500 hover:text-gray-200 hover:bg-white/[0.03] border border-transparent"
                }`}
              >
                <FolderOpen className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{folder.name}</span>
                <span className="ml-auto text-[10px] tabular-nums text-gray-700">{folder._count.items}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* ── Item panel ────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.04]">
            <div>
              <h1 className="text-base font-semibold text-white">{selectedFolderName}</h1>
              <p className="text-xs text-gray-600 mt-0.5">
                {visibleItems.length} entrée{visibleItems.length !== 1 ? "s" : ""}
              </p>
            </div>
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 active:bg-orange-600 text-xs font-semibold text-white transition-colors shadow-lg shadow-orange-500/20"
            >
              <Plus className="w-3.5 h-3.5" />
              Ajouter
            </button>
          </div>

          {visibleItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-gray-700" />
              </div>
              <p className="text-sm font-medium text-gray-500 mb-1">Aucune entrée</p>
              <p className="text-xs text-gray-700 max-w-xs leading-relaxed">
                Cliquez sur{" "}
                <span
                  className="text-orange-400 cursor-pointer hover:underline"
                  onClick={handleOpenCreate}
                >
                  Ajouter
                </span>{" "}
                pour stocker votre premier identifiant.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-[2fr_2fr_2fr_130px] gap-4 px-5 py-3 border-b border-white/[0.04] bg-white/[0.01]">
                {["Titre", "Identifiant", "URL", ""].map((h) => (
                  <span key={h} className="text-[11px] font-semibold uppercase tracking-widest text-gray-600">
                    {h}
                  </span>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-white/[0.03]">
                {visibleItems.map((item) => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    onEdit={handleOpenEdit}
                    onDelete={(item) => setDeleteConfirmItem(item)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

// src/app/(app)/[companyId]/vault/vault-shell.tsx
"use client";

import { useState, useCallback, useEffect, useRef, useActionState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, FolderOpen, Key, Globe, Copy, Check,
  Loader2, CheckCircle2, X, Lock,
} from "lucide-react";
import {
  decryptPasswordAction,
  createFolderAction,
  type VaultState,
} from "@/lib/actions/vault";
import { VaultItemDrawer } from "./vault-item-drawer";

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

function NewFolderForm({
  companyId,
  onDone,
}: {
  companyId: string;
  onDone: () => void;
}) {
  const [state, action, pending] = useActionState<VaultState, FormData>(
    createFolderAction,
    null
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
      onDone();
    }
  }, [state?.success, onDone]);

  return (
    <form ref={formRef} action={action} className="px-2 pb-2">
      <input type="hidden" name="companyId" value={companyId} />
      <div className="flex items-center gap-1">
        <input
          name="name"
          type="text"
          placeholder="Nom du dossier"
          autoFocus
          required
          disabled={pending}
          className="flex-1 px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.1] text-xs text-white placeholder-gray-600 outline-none focus:border-orange-500/40 transition-all"
        />
        <button
          type="submit"
          disabled={pending}
          className="w-6 h-6 rounded-lg flex items-center justify-center bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-colors shrink-0"
        >
          {pending
            ? <Loader2 className="w-3 h-3 animate-spin" />
            : <Check className="w-3 h-3" />}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-600 hover:text-white transition-colors shrink-0"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
      {state?.error && (
        <p className="text-[11px] text-red-400 mt-1 px-1">{state.error}</p>
      )}
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

// ─── Item Row ────────────────────────────────────────────

function ItemRow({ item }: { item: VaultItemRow }) {
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
      className="grid grid-cols-[2fr_2fr_2fr_80px] gap-4 px-5 py-4 items-center group hover:bg-white/[0.03] transition-colors duration-100 cursor-default"
    >
      {/* Title + avatar */}
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

      {/* Copy button */}
      <div className="flex justify-end">
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
          {copying ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : copied ? (
            <><Check className="w-3 h-3" />Copié</>
          ) : (
            <><Copy className="w-3 h-3" />Copier</>
          )}
        </button>
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

  return (
    <>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Toast message={`"${toast}" enregistré`} onDismiss={dismissToast} />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <VaultItemDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSuccess={(title) => setToast(title)}
        companyId={companyId}
        folders={folders}
      />

      {/* 2-column vault layout */}
      <div className="flex h-full">

        {/* ── Folder sidebar ────────────────────── */}
        <div className="w-56 shrink-0 border-r border-white/[0.05] bg-white/[0.02] flex flex-col">

          {/* Header */}
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

          {/* New folder form */}
          <AnimatePresence>
            {showNewFolder && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <NewFolderForm
                  companyId={companyId}
                  onDone={() => setShowNewFolder(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* "All items" entry */}
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
              <span className="ml-auto text-[10px] tabular-nums text-gray-700">
                {items.length}
              </span>
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
                <span className="ml-auto text-[10px] tabular-nums text-gray-700">
                  {folder._count.items}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* ── Item panel ────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Panel header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.04]">
            <div>
              <h1 className="text-base font-semibold text-white">{selectedFolderName}</h1>
              <p className="text-xs text-gray-600 mt-0.5">
                {visibleItems.length} entrée{visibleItems.length !== 1 ? "s" : ""}
              </p>
            </div>
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 active:bg-orange-600 text-xs font-semibold text-white transition-colors shadow-lg shadow-orange-500/20"
            >
              <Plus className="w-3.5 h-3.5" />
              Ajouter
            </button>
          </div>

          {/* Empty state */}
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
                  onClick={() => setIsDrawerOpen(true)}
                >
                  Ajouter
                </span>{" "}
                pour stocker votre premier identifiant.
              </p>
            </div>
          ) : (
            <>
              {/* Table header */}
              <div className="grid grid-cols-[2fr_2fr_2fr_80px] gap-4 px-5 py-3 border-b border-white/[0.04] bg-white/[0.01]">
                {["Titre", "Identifiant", "URL", ""].map((h) => (
                  <span key={h} className="text-[11px] font-semibold uppercase tracking-widest text-gray-600">
                    {h}
                  </span>
                ))}
              </div>

              {/* Item rows */}
              <div className="flex-1 overflow-y-auto divide-y divide-white/[0.03]">
                {visibleItems.map((item) => (
                  <ItemRow key={item.id} item={item} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

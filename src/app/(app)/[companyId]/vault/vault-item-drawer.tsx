// src/app/(app)/[companyId]/vault/vault-item-drawer.tsx
"use client";

import { useState, useActionState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  createVaultItemAction,
  updateVaultItemAction,
  type VaultState,
} from "@/lib/actions/vault";
import { Loader2, AlertCircle, X, Eye, EyeOff } from "lucide-react";
import PasswordGenerator from "./password-generator";

const FIELD =
  "w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder-gray-600 outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all duration-150";

const LABEL = "block text-xs font-medium text-gray-400 mb-2";

// ─── Types ──────────────────────────────────────────────

export interface ItemToEdit {
  id: string;
  title: string;
  username: string | null;
  url: string | null;
  notes: string | null;
  folderId: string | null;
}

export interface VaultItemDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (title: string) => void;
  companyId: string;
  folders: { id: string; name: string }[];
  itemToEdit?: ItemToEdit | null;
}

// ─── Form ───────────────────────────────────────────────

function DrawerForm({
  onClose,
  onSuccess,
  companyId,
  folders,
  itemToEdit,
}: Omit<VaultItemDrawerProps, "isOpen">) {
  const isEdit = !!itemToEdit;
  const [state, action, pending] = useActionState<VaultState, FormData>(
    isEdit ? updateVaultItemAction : createVaultItemAction,
    null
  );
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      const title = titleRef.current?.value ?? "Entrée";
      formRef.current?.reset();
      setPassword("");
      onSuccess(title);
      onClose();
    }
  }, [state?.success, onClose, onSuccess]);

  // In create mode the password field must be filled; in edit mode it's optional
  const submitDisabled = pending || (!isEdit && password.trim() === "");

  return (
    <form ref={formRef} action={action} className="flex flex-col h-full">
      <input type="hidden" name="companyId" value={companyId} />
      <input type="hidden" name="password" value={password} />
      {isEdit && <input type="hidden" name="itemId" value={itemToEdit.id} />}

      {/* ── Header ─────────────────────────────── */}
      <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-white/[0.06]">
        <div>
          <h2 className="text-base font-semibold text-white">
            {isEdit ? "Modifier l'entrée" : "Nouvelle entrée"}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {isEdit
              ? "Le mot de passe vide conserve l'existant."
              : "Chiffré avec AES-256-GCM avant stockage."}
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

      {/* ── Fields ─────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-6 py-6 max-h-[85vh]">
        {state?.error && (
          <div className="flex items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-500/[0.07] px-4 py-3 text-sm text-red-400 mb-5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {state.error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* ── Colonne gauche ── */}
          <div className="space-y-5">
            <div>
              <label className={LABEL}>
                Titre <span className="text-orange-400">*</span>
              </label>
              <input
                ref={titleRef}
                name="title"
                type="text"
                placeholder="Ex: GitHub, Gmail, Serveur SSH…"
                required
                disabled={pending}
                autoFocus
                defaultValue={itemToEdit?.title ?? ""}
                className={FIELD}
              />
            </div>

            <div>
              <label className={LABEL}>Identifiant / Email</label>
              <input
                name="username"
                type="text"
                placeholder="user@example.com"
                disabled={pending}
                defaultValue={itemToEdit?.username ?? ""}
                className={FIELD}
              />
            </div>

            <div>
              <label className={LABEL}>URL</label>
              <input
                name="url"
                type="url"
                placeholder="https://github.com"
                disabled={pending}
                defaultValue={itemToEdit?.url ?? ""}
                className={FIELD}
              />
            </div>

            <div>
              <label className={LABEL}>Dossier</label>
              <select
                name="folderId"
                disabled={pending}
                defaultValue={itemToEdit?.folderId ?? ""}
                className={`${FIELD} appearance-none bg-zinc-950`}
              >
                <option value="">Sans dossier</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={LABEL}>Notes</label>
              <textarea
                name="notes"
                rows={4}
                placeholder="Informations complémentaires…"
                disabled={pending}
                defaultValue={itemToEdit?.notes ?? ""}
                className={`${FIELD} resize-none`}
              />
            </div>
          </div>

          {/* ── Colonne droite ── */}
          <div className="space-y-3">
            <div>
              <label className={LABEL}>
                Mot de passe
                {!isEdit && <span className="text-orange-400"> *</span>}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isEdit ? "Laisser vide pour conserver" : "••••••••••••"}
                  disabled={pending}
                  className={`${FIELD} pr-12`}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    aria-pressed={showPassword}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 hover:text-gray-300 transition-colors"
                  >
                    {showPassword
                      ? <EyeOff className="w-3.5 h-3.5" />
                      : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <PasswordGenerator onUse={(pwd) => setPassword(pwd)} />
          </div>
        </div>
      </div>

      {/* ── Footer ─────────────────────────────── */}
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
          disabled={submitDisabled}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-sm font-semibold text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {pending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {isEdit ? "Mise à jour…" : "Chiffrement…"}
            </>
          ) : isEdit ? (
            "Enregistrer les modifications"
          ) : (
            "Enregistrer"
          )}
        </button>
      </div>
    </form>
  );
}

// ─── Modal wrapper ──────────────────────────────────────

export function VaultItemDrawer({
  isOpen,
  onClose,
  onSuccess,
  companyId,
  folders,
  itemToEdit,
}: VaultItemDrawerProps) {
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
              key="modal"
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="pointer-events-auto w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl bg-[#0c0c0c]/95 backdrop-blur-xl border border-white/[0.08] shadow-2xl shadow-black/70"
            >
              {/* key forces remount when switching between items */}
              <DrawerForm
                key={itemToEdit?.id ?? "new"}
                onClose={onClose}
                onSuccess={onSuccess}
                companyId={companyId}
                folders={folders}
                itemToEdit={itemToEdit}
              />
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

// src/app/(app)/[companyId]/vault/vault-item-drawer.tsx
"use client";

import { useState, useActionState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createVaultItemAction, type VaultState } from "@/lib/actions/vault";
import { Loader2, AlertCircle, X, Eye, EyeOff, Wand2 } from "lucide-react";
import PasswordGenerator from "./password-generator";

const FIELD =
  "w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder-gray-600 outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all duration-150";

const LABEL = "block text-xs font-medium text-gray-400 mb-2";

interface VaultItemDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (title: string) => void;
  companyId: string;
  folders: { id: string; name: string }[];
}

function DrawerForm({
  onClose,
  onSuccess,
  companyId,
  folders,
}: Omit<VaultItemDrawerProps, "isOpen">) {
  const [state, action, pending] = useActionState<VaultState, FormData>(
    createVaultItemAction,
    null
  );
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      const title = titleRef.current?.value ?? "Entrée";
      formRef.current?.reset();
      setPassword("");
      setShowGenerator(false);
      onSuccess(title);
      onClose();
    }
  }, [state?.success, onClose, onSuccess]);

  return (
    <form ref={formRef} action={action} className="flex flex-col h-full">
      {/* Hidden inputs: companyId and controlled password value */}
      <input type="hidden" name="companyId" value={companyId} />
      <input type="hidden" name="password" value={password} />

      {/* ── Header ─────────────────────────────── */}
      <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-white/[0.06]">
        <div>
          <h2 className="text-base font-semibold text-white">Nouvelle entrée</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Chiffré avec AES-256-GCM avant stockage.
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
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
        {state?.error && (
          <div className="flex items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-500/[0.07] px-4 py-3 text-sm text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {state.error}
          </div>
        )}

        {/* Title */}
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
            className={FIELD}
          />
        </div>

        {/* Username */}
        <div>
          <label className={LABEL}>Identifiant / Email</label>
          <input
            name="username"
            type="text"
            placeholder="user@example.com"
            disabled={pending}
            className={FIELD}
          />
        </div>

        {/* Password — controlled + generator toggle */}
        <div>
          <label className={LABEL}>
            Mot de passe <span className="text-orange-400">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              disabled={pending}
              className={`${FIELD} pr-20`}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
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
              <button
                type="button"
                onClick={() => setShowGenerator((v) => !v)}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                  showGenerator
                    ? "text-orange-400 bg-orange-500/10"
                    : "text-gray-600 hover:text-gray-300"
                }`}
                title="Générateur"
              >
                <Wand2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Collapsible generator */}
          <AnimatePresence>
            {showGenerator && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden mt-3"
              >
                <PasswordGenerator
                  onUse={(pwd) => {
                    setPassword(pwd);
                    setShowGenerator(false);
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* URL */}
        <div>
          <label className={LABEL}>URL</label>
          <input
            name="url"
            type="url"
            placeholder="https://github.com"
            disabled={pending}
            className={FIELD}
          />
        </div>

        {/* Folder */}
        <div>
          <label className={LABEL}>Dossier</label>
          <select
            name="folderId"
            disabled={pending}
            className={`${FIELD} appearance-none bg-white/[0.05]`}
          >
            <option value="">Sans dossier</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div>
          <label className={LABEL}>Notes</label>
          <textarea
            name="notes"
            rows={3}
            placeholder="Informations complémentaires…"
            disabled={pending}
            className={`${FIELD} resize-none`}
          />
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
          disabled={pending || password.trim() === ""}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-sm font-semibold text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {pending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Chiffrement…
            </>
          ) : (
            "Enregistrer"
          )}
        </button>
      </div>
    </form>
  );
}

export function VaultItemDrawer({
  isOpen,
  onClose,
  onSuccess,
  companyId,
  folders,
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
          <motion.div
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed right-0 top-0 h-full w-full max-w-md z-50 flex flex-col bg-[#0c0c0c]/90 backdrop-blur-xl border-l border-white/[0.08] shadow-2xl shadow-black/60"
          >
            <DrawerForm
              onClose={onClose}
              onSuccess={onSuccess}
              companyId={companyId}
              folders={folders}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

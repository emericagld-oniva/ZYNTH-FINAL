"use client";

import { useActionState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClientAction, type CrmState } from "@/lib/actions/crm";
import { Loader2, AlertCircle, X } from "lucide-react";

const FIELD =
  "w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder-gray-600 outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all duration-150";

const LABEL = "block text-xs font-medium text-gray-400 mb-2";

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (name: string) => void;
  companyId: string;
}

function DrawerForm({
  onClose,
  onSuccess,
  companyId,
}: {
  onClose: () => void;
  onSuccess: (name: string) => void;
  companyId: string;
}) {
  const [state, action, pending] = useActionState<CrmState, FormData>(
    createClientAction,
    null
  );
  const nameRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      const name = nameRef.current?.value ?? "Client";
      formRef.current?.reset();
      onSuccess(name);
      onClose();
    }
  }, [state?.success, onClose, onSuccess]);

  return (
    <form ref={formRef} action={action} className="flex flex-col h-full">
      <input type="hidden" name="companyId" value={companyId} />

      {/* ── Header ─────────────────────────────── */}
      <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-white/[0.06]">
        <div>
          <h2 className="text-base font-semibold text-white">Nouveau client</h2>
          <p className="text-xs text-gray-500 mt-0.5">Ajoutez un contact à votre CRM.</p>
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

        <div>
          <label className={LABEL}>
            Nom <span className="text-orange-400">*</span>
          </label>
          <input
            ref={nameRef}
            name="name"
            type="text"
            placeholder="Jean Dupont"
            required
            disabled={pending}
            autoFocus
            className={FIELD}
          />
        </div>

        <div>
          <label className={LABEL}>Adresse e-mail</label>
          <input
            name="email"
            type="email"
            placeholder="jean@exemple.com"
            disabled={pending}
            className={FIELD}
          />
        </div>

        <div>
          <label className={LABEL}>Entreprise</label>
          <input
            name="company"
            type="text"
            placeholder="Acme Inc."
            disabled={pending}
            className={FIELD}
          />
        </div>

        <div>
          <label className={LABEL}>Statut</label>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { value: "LEAD",    label: "Lead",   color: "peer-checked:border-sky-500/60     peer-checked:bg-sky-500/10     peer-checked:text-sky-300"    },
                { value: "ACTIF",   label: "Actif",  color: "peer-checked:border-emerald-500/60 peer-checked:bg-emerald-500/10 peer-checked:text-emerald-300" },
                { value: "INACTIF", label: "Inactif",color: "peer-checked:border-gray-500/60    peer-checked:bg-gray-500/10    peer-checked:text-gray-300"   },
              ] as const
            ).map(({ value, label, color }) => (
              <label key={value} className="cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value={value}
                  defaultChecked={value === "LEAD"}
                  disabled={pending}
                  className="peer sr-only"
                />
                <div
                  className={`flex items-center justify-center px-3 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] text-xs font-medium text-gray-500 transition-all duration-150 ${color} hover:bg-white/[0.06]`}
                >
                  {label}
                </div>
              </label>
            ))}
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
          disabled={pending}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-sm font-semibold text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {pending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Création…
            </>
          ) : (
            "Créer le client"
          )}
        </button>
      </div>
    </form>
  );
}

export function ClientModal({ isOpen, onClose, onSuccess, companyId }: ClientModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed right-0 top-0 h-full w-full max-w-md z-50 flex flex-col bg-[#0c0c0c]/90 backdrop-blur-xl border-l border-white/[0.08] shadow-2xl shadow-black/60"
          >
            <DrawerForm onClose={onClose} onSuccess={onSuccess} companyId={companyId} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

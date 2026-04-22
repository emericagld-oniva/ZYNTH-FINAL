"use client";

import { useActionState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClientAction, type CrmState } from "@/lib/actions/crm";
import { Loader2, AlertCircle, X } from "lucide-react";

const INPUT_CLS =
  "w-full px-3 py-2.5 rounded-xl border border-white/[0.07] bg-white/[0.03] text-sm text-white placeholder-gray-600 outline-none focus:border-orange-500/40 focus:ring-2 focus:ring-orange-500/10 transition-all duration-150";

interface NewClientFormProps {
  onClose: () => void;
}

export function NewClientForm({ onClose }: NewClientFormProps) {
  const [state, action, pending] = useActionState<CrmState, FormData>(
    createClientAction,
    null
  );

  useEffect(() => {
    if (state?.success) onClose();
  }, [state?.success, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.99 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="rounded-2xl border border-orange-500/[0.15] bg-orange-500/[0.04] backdrop-blur-sm p-6 mb-6"
    >
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-semibold text-white">Nouveau client</h2>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/[0.06] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {state?.error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.07] px-3 py-2.5 mb-4 text-xs text-red-400">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {state.error}
        </div>
      )}

      <form action={action}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Nom <span className="text-orange-400">*</span>
            </label>
            <input
              name="name"
              type="text"
              placeholder="Jean Dupont"
              required
              disabled={pending}
              className={INPUT_CLS}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Email
            </label>
            <input
              name="email"
              type="email"
              placeholder="jean@exemple.com"
              disabled={pending}
              className={INPUT_CLS}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Entreprise
            </label>
            <input
              name="company"
              type="text"
              placeholder="Acme Inc."
              disabled={pending}
              className={INPUT_CLS}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Statut
            </label>
            <select
              name="status"
              disabled={pending}
              defaultValue="LEAD"
              className={INPUT_CLS + " cursor-pointer"}
            >
              <option value="LEAD" className="bg-[#111]">Lead</option>
              <option value="ACTIF" className="bg-[#111]">Actif</option>
              <option value="INACTIF" className="bg-[#111]">Inactif</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-500 hover:text-white hover:bg-white/[0.05] transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={pending}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-sm font-semibold text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {pending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Création…
              </>
            ) : (
              "Créer le client"
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}

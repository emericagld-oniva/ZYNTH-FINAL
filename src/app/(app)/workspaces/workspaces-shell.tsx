"use client";

import { useState, useActionState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { createCompanyAction, type CompanyState } from "@/lib/actions/company";
import { Plus, Building2, ArrowRight, Loader2, AlertCircle, X, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

const ROLE_LABELS: Record<string, string> = {
  FOUNDER:  "Fondateur",
  MANAGER:  "Manager",
  EMPLOYEE: "Employé",
  INTERN:   "Stagiaire",
  GUEST:    "Invité",
};

const ROLE_COLORS: Record<string, string> = {
  FOUNDER:  "text-orange-400 bg-orange-400/10 border-orange-400/20",
  MANAGER:  "text-sky-400    bg-sky-400/10    border-sky-400/20",
  EMPLOYEE: "text-gray-400   bg-gray-400/10   border-gray-400/20",
  INTERN:   "text-gray-500   bg-gray-500/10   border-gray-500/20",
  GUEST:    "text-gray-600   bg-gray-600/10   border-gray-600/20",
};

interface Membership {
  companyId: string;
  companyName: string;
  role: string;
  joinedAt: Date;
}

function CreateModal({ onClose }: { onClose: () => void }) {
  const [state, action, pending] = useActionState<CompanyState, FormData>(
    createCompanyAction,
    null
  );

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center px-4"
        onClick={onClose}
      >
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.97, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 8 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-[#0c0c0c]/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/60"
        >
          <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-white/[0.06]">
            <div>
              <h2 className="text-base font-semibold text-white">Créer un espace de travail</h2>
              <p className="text-xs text-gray-500 mt-0.5">Vous en serez le Fondateur.</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/[0.07] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form action={action} className="px-6 py-6 space-y-4">
            {state?.error && (
              <div className="flex items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-500/[0.07] px-4 py-3 text-sm text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {state.error}
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">
                Nom de l&apos;entreprise <span className="text-orange-400">*</span>
              </label>
              <input
                name="name"
                type="text"
                placeholder="Acme Inc."
                required
                autoFocus
                disabled={pending}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder-gray-600 outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all disabled:opacity-50"
              />
            </div>
            <div className="flex gap-3 pt-1">
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
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-sm font-semibold text-white transition-colors disabled:opacity-60"
              >
                {pending ? <><Loader2 className="w-4 h-4 animate-spin" />Création…</> : "Créer"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function WorkspacesShell({
  memberships,
  userName,
}: {
  memberships: Membership[];
  userName: string;
}) {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="min-h-screen bg-[#050505] relative overflow-hidden">
      {/* Ambient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(249,115,22,0.06) 0%, transparent 60%)" }}
      />

      {/* Top bar */}
      <div className="flex items-center justify-between px-8 pt-6">
        <Link href="/">
          <Image
            src="/ZYNTH-APP.svg"
            alt="Zynth"
            width={80}
            height={20}
            className="h-5 w-auto opacity-75 hover:opacity-100 transition-opacity"
          />
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-gray-600 hover:text-red-400 hover:bg-red-500/[0.06] transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Déconnexion
        </button>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 pt-20 pb-16">
        <div className="mb-10">
          <p className="text-xs font-medium uppercase tracking-widest text-gray-600 mb-2">
            Bonjour, {userName}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Vos espaces de travail
          </h1>
          <p className="mt-1.5 text-sm text-gray-500">
            {memberships.length === 0
              ? "Créez votre premier espace pour commencer."
              : "Sélectionnez une entreprise pour continuer."}
          </p>
        </div>

        {/* Grid */}
        {memberships.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {memberships.map((m, i) => (
              <motion.div
                key={m.companyId}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.22 }}
              >
                <Link
                  href={`/${m.companyId}/dashboard`}
                  className="group block rounded-2xl border border-white/[0.07] bg-white/[0.025] backdrop-blur-sm p-6 hover:border-orange-500/30 hover:bg-white/[0.04] transition-all duration-200 shadow-lg shadow-black/10"
                >
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-lg font-bold text-orange-400">
                      {m.companyName.charAt(0).toUpperCase()}
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all duration-150" />
                  </div>
                  <p className="text-sm font-semibold text-white mb-2">{m.companyName}</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${ROLE_COLORS[m.role] ?? ROLE_COLORS.GUEST}`}>
                    {ROLE_LABELS[m.role] ?? m.role}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Create button */}
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl border border-dashed border-white/[0.12] text-sm font-medium text-gray-500 hover:text-white hover:border-orange-500/30 hover:bg-orange-500/[0.04] transition-all duration-150 w-full justify-center"
        >
          <Plus className="w-4 h-4" />
          Créer une entreprise
        </button>
      </div>

      {/* Create modal */}
      {showCreate && <CreateModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}

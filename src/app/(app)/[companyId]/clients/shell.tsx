"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Client, ClientStatus } from "@prisma/client";
import { ClientModal } from "./client-modal";
import {
  Plus,
  UserRound,
  Building2,
  Mail,
  CheckCircle2,
  Briefcase,
  ArrowUpDown,
  Search
} from "lucide-react";

// ─── Status config ──────────────────────────────────────

const STATUS_CONFIG: Record<
  ClientStatus,
  { label: string; dot: string; badge: string }
> = {
  LEAD: { label: "Lead", dot: "bg-sky-400", badge: "text-sky-400    bg-sky-500/10    border border-sky-500/20" },
  ACTIF: { label: "Actif", dot: "bg-emerald-400", badge: "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20" },
  INACTIF: { label: "Inactif", dot: "bg-gray-500", badge: "text-gray-500   bg-gray-500/10   border border-gray-500/20" },
};

function StatusBadge({ status }: { status: ClientStatus }) {
  const { label, dot, badge } = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── Toast ──────────────────────────────────────────────

function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  useEffect(() => {
    const id = setTimeout(onDismiss, 3500);
    return () => clearTimeout(id);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className="fixed top-4 right-4 z-[60] flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#0d0d0d]/95 backdrop-blur-xl border border-emerald-500/25 shadow-xl shadow-black/50 cursor-pointer select-none"
      onClick={onDismiss}
    >
      <div className="w-7 h-7 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
      </div>
      <div>
        <p className="text-sm font-semibold text-white">{message}</p>
        <p className="text-xs text-gray-500 mt-0.5">Données mises à jour.</p>
      </div>
    </motion.div>
  );
}

// ─── Shell ──────────────────────────────────────────────

export default function ClientsShell({ clients, companyId }: { clients: any[]; companyId: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // États pour le tri et le filtre
  const [searchProfession, setSearchProfession] = useState("");
  const [isSorted, setIsSorted] = useState(false);

  const handleSuccess = useCallback((name: string) => {
    setToast(name);
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  // Logique de tri et filtrage
  const filteredClients = useMemo(() => {
    let result = [...clients];

    // 1. Filtre par métier
    if (searchProfession) {
      result = result.filter(c =>
        c.profession?.toLowerCase().includes(searchProfession.toLowerCase())
      );
    }

    // 2. Tri par métier (A-Z)
    if (isSorted) {
      result.sort((a, b) => (a.profession || "").localeCompare(b.profession || ""));
    }

    return result;
  }, [clients, searchProfession, isSorted]);

  return (
    <>
      <AnimatePresence>
        {toast && <Toast message={`${toast} ajouté`} onDismiss={dismissToast} />}
      </AnimatePresence>

      <ClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
        companyId={companyId}
      />

      <div className="p-8 max-w-7xl mx-auto space-y-8">

        {/* ── Header ───────────────────────────── */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">CRM Clients</h1>
            <p className="mt-1 text-sm text-gray-500">
              Gérez vos contacts et triez-les par secteur d'activité.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 active:bg-orange-600 text-sm font-semibold text-white transition-colors duration-150 shrink-0 shadow-lg shadow-orange-500/20"
          >
            <Plus className="w-4 h-4" />
            Nouveau client
          </button>
        </div>

        {/* ── Filtres & Outils ─────────────────── */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white/[0.02] border border-white/[0.05] p-4 rounded-2xl backdrop-blur-sm">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Rechercher un métier..."
              value={searchProfession}
              onChange={(e) => setSearchProfession(e.target.value)}
              className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder:text-gray-600 focus:border-orange-500/50 outline-none transition-all"
            />
          </div>

          <button
            onClick={() => setIsSorted(!isSorted)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium border transition-all ${isSorted
                ? 'bg-orange-500/10 border-orange-500/50 text-orange-400'
                : 'bg-white/[0.05] border-white/[0.1] text-gray-400 hover:text-white'
              }`}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            Trier par métier {isSorted ? "(A-Z)" : ""}
          </button>
        </div>

        {/* ── Empty state ───────────────────────── */}
        {filteredClients.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.05] bg-white/[0.015] backdrop-blur-sm p-20 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center mb-5">
              <UserRound className="w-7 h-7 text-gray-600" />
            </div>
            <p className="text-sm font-semibold text-gray-300 mb-1.5">Aucun résultat</p>
            <p className="text-xs text-gray-600 max-w-xs leading-relaxed">
              Aucun client ne correspond à votre recherche actuelle.
            </p>
          </div>
        ) : (

          /* ── Data table ────────────────────── */
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] backdrop-blur-md overflow-hidden shadow-xl shadow-black/20">

            {/* Header row - Updated Grid for 6 cols */}
            <div className="grid grid-cols-[1.5fr_1.8fr_1.5fr_1.5fr_120px_100px] gap-4 px-6 py-3.5 border-b border-white/[0.05] bg-white/[0.02]">
              {["Nom", "Email", "Entreprise", "Métier", "Statut", "Ajouté le"].map((h) => (
                <span key={h} className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  {h}
                </span>
              ))}
            </div>

            {/* Data rows */}
            <div className="divide-y divide-white/[0.04]">
              {filteredClients.map((client, i) => (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.2 }}
                  className="grid grid-cols-[1.5fr_1.8fr_1.5fr_1.5fr_120px_100px] gap-4 px-6 py-4 items-center group hover:bg-white/[0.04] transition-colors duration-100 cursor-default"
                >
                  {/* Name */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.07] flex items-center justify-center shrink-0 text-xs font-bold text-gray-400 group-hover:border-orange-500/30 group-hover:text-orange-400 group-hover:bg-orange-500/[0.08] transition-all duration-150">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-white truncate">
                      {client.name}
                    </span>
                  </div>

                  {/* Email */}
                  <div className="flex items-center gap-2 min-w-0">
                    {client.email ? (
                      <>
                        <Mail className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                        <span className="text-sm text-gray-400 truncate">{client.email}</span>
                      </>
                    ) : (
                      <span className="text-sm text-gray-700">—</span>
                    )}
                  </div>

                  {/* Company */}
                  <div className="flex items-center gap-2 min-w-0">
                    {client.company ? (
                      <>
                        <Building2 className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                        <span className="text-sm text-gray-400 truncate">{client.company}</span>
                      </>
                    ) : (
                      <span className="text-sm text-gray-700">—</span>
                    )}
                  </div>

                  {/* Profession (MÉTIER) - NEW */}
                  <div className="flex items-center gap-2 min-w-0">
                    {client.profession ? (
                      <>
                        <Briefcase className="w-3.5 h-3.5 text-orange-500/40 shrink-0" />
                        <span className="text-sm text-gray-300 truncate">{client.profession}</span>
                      </>
                    ) : (
                      <span className="text-[10px] text-gray-700 uppercase italic">Non défini</span>
                    )}
                  </div>

                  {/* Status badge */}
                  <div className="flex justify-start">
                    <StatusBadge status={client.status} />
                  </div>

                  {/* Date */}
                  <span className="text-[11px] text-gray-600 tabular-nums text-right sm:text-left">
                    {formatDate(client.createdAt)}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
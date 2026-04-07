"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import type { Client, ClientStatus } from "@prisma/client";
import { NewClientForm } from "./new-client-form";
import { Plus, UserRound, Building2, Mail } from "lucide-react";

// ─── Status config ──────────────────────────────────────

const STATUS_CONFIG: Record<
  ClientStatus,
  { label: string; dot: string; badge: string }
> = {
  LEAD: {
    label: "Lead",
    dot: "bg-sky-400",
    badge: "text-sky-400 bg-sky-400/10 border-sky-400/20",
  },
  ACTIF: {
    label: "Actif",
    dot: "bg-emerald-400",
    badge: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  },
  INACTIF: {
    label: "Inactif",
    dot: "bg-gray-500",
    badge: "text-gray-500 bg-gray-500/10 border-gray-500/20",
  },
};

function StatusBadge({ status }: { status: ClientStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.badge}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
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

// ─── Main shell ─────────────────────────────────────────

export default function ClientsShell({ clients }: { clients: Client[] }) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="p-8 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Clients
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {clients.length === 0
              ? "Aucun client pour l'instant."
              : `${clients.length} client${clients.length > 1 ? "s" : ""} au total`}
          </p>
        </div>

        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 active:bg-orange-600 text-sm font-semibold text-white transition-colors duration-150 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Nouveau client
        </button>
      </div>

      {/* Slide-in form */}
      <AnimatePresence>
        {showForm && (
          <NewClientForm onClose={() => setShowForm(false)} />
        )}
      </AnimatePresence>

      {/* Empty state */}
      {clients.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.05] bg-white/[0.015] p-16 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center mb-4">
            <UserRound className="w-6 h-6 text-gray-600" />
          </div>
          <p className="text-sm font-medium text-gray-400 mb-1">
            Aucun client
          </p>
          <p className="text-xs text-gray-600 max-w-xs">
            Ajoutez votre premier client en cliquant sur{" "}
            <span className="text-gray-400">Nouveau client</span>.
          </p>
        </div>
      ) : (
        /* Table */
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_1fr_1fr_120px_110px] gap-4 px-5 py-3 border-b border-white/[0.05] text-xs font-medium uppercase tracking-wider text-gray-600">
            <span>Nom</span>
            <span>Email</span>
            <span>Entreprise</span>
            <span>Statut</span>
            <span>Ajouté le</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-white/[0.04]">
            {clients.map((client) => (
              <div
                key={client.id}
                className="grid grid-cols-[1fr_1fr_1fr_120px_110px] gap-4 px-5 py-3.5 items-center hover:bg-white/[0.025] transition-colors duration-100 group"
              >
                {/* Name */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-white/[0.05] border border-white/[0.07] flex items-center justify-center shrink-0 text-xs font-semibold text-gray-400 group-hover:border-orange-500/20 group-hover:text-orange-400 transition-colors">
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-white truncate">
                    {client.name}
                  </span>
                </div>

                {/* Email */}
                <div className="flex items-center gap-1.5 min-w-0">
                  {client.email ? (
                    <>
                      <Mail className="w-3 h-3 text-gray-600 shrink-0" />
                      <span className="text-sm text-gray-400 truncate">
                        {client.email}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-gray-700">—</span>
                  )}
                </div>

                {/* Company */}
                <div className="flex items-center gap-1.5 min-w-0">
                  {client.company ? (
                    <>
                      <Building2 className="w-3 h-3 text-gray-600 shrink-0" />
                      <span className="text-sm text-gray-400 truncate">
                        {client.company}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-gray-700">—</span>
                  )}
                </div>

                {/* Status */}
                <div>
                  <StatusBadge status={client.status} />
                </div>

                {/* Date */}
                <span className="text-xs text-gray-600">
                  {formatDate(client.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

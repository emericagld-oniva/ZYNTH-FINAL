"use client";

import { useActionState } from "react";
import Link from "next/link";
import Image from "next/image";
import { registerAction, type AuthState } from "@/lib/actions/auth";
import { Loader2, AlertCircle } from "lucide-react";

const INPUT_CLS =
  "w-full px-4 py-3 rounded-xl border border-white/[0.07] bg-white/[0.03] text-sm text-white placeholder-gray-600 outline-none focus:border-orange-500/40 focus:ring-2 focus:ring-orange-500/10 transition-all duration-150";

export default function RegisterPage() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    registerAction,
    null
  );

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4 relative overflow-hidden">

      {/* Ambient glow — légèrement différent de /login pour distinguer les pages */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 45% at 50% 100%, rgba(249,115,22,0.06) 0%, transparent 70%)",
        }}
      />
      {/* Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 w-full max-w-sm">

        {/* Logo */}
        <div className="flex justify-center mb-10">
          <Link href="/" aria-label="Retour à l'accueil">
            <Image
              src="/ZYNTH-APP.svg"
              alt="Zynth"
              width={96}
              height={24}
              className="h-6 w-auto opacity-90 hover:opacity-100 transition-opacity"
            />
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-sm px-8 py-10">

          <h1 className="text-2xl font-semibold tracking-tight text-white mb-1">
            Créer un compte
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            Rejoignez Zynth et prenez le contrôle de votre activité.
          </p>

          {/* Error banner */}
          {state?.error && (
            <div className="flex items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-500/[0.07] px-4 py-3 mb-6 text-sm text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {state.error}
            </div>
          )}

          <form action={action} className="space-y-3">
            <div>
              <label htmlFor="name" className="block text-xs font-medium text-gray-400 mb-1.5">
                Nom complet
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Jean Dupont"
                required
                disabled={pending}
                className={INPUT_CLS}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-medium text-gray-400 mb-1.5">
                Adresse e-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="vous@exemple.com"
                required
                disabled={pending}
                className={INPUT_CLS}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-gray-400 mb-1.5">
                Mot de passe
                <span className="ml-1.5 text-gray-600 font-normal">
                  (8 caractères min.)
                </span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                required
                minLength={8}
                disabled={pending}
                className={INPUT_CLS}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-400 mb-1.5">
                Confirmer le mot de passe
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                required
                disabled={pending}
                className={INPUT_CLS}
              />
            </div>

            <button
              type="submit"
              disabled={pending}
              className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-400 active:bg-orange-600 px-4 py-3 text-sm font-semibold text-white transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {pending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Création du compte…
                </>
              ) : (
                "Créer mon compte"
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-700 mt-6">
          Déjà inscrit ?{" "}
          <Link href="/login" className="text-gray-400 hover:text-white transition-colors">
            Se connecter
          </Link>
        </p>

      </div>
    </div>
  );
}

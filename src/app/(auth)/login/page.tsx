"use client";

import { useActionState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { loginAction, type AuthState } from "@/lib/actions/auth";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

const INPUT_CLS =
  "w-full px-4 py-3 rounded-xl border border-white/[0.07] bg-white/[0.03] text-sm text-white placeholder-gray-600 outline-none focus:border-orange-500/40 focus:ring-2 focus:ring-orange-500/10 transition-all duration-150";

// useSearchParams must be in its own Suspense-wrapped component
function SuccessBanner() {
  const searchParams = useSearchParams();
  if (searchParams.get("registered") !== "1") return null;
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.07] px-4 py-3 mb-6 text-sm text-emerald-400">
      <CheckCircle2 className="w-4 h-4 shrink-0" />
      Compte créé avec succès. Connectez-vous.
    </div>
  );
}

function LoginForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    loginAction,
    null
  );
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state?.error) emailRef.current?.focus();
  }, [state?.error]);

  return (
    <>
      <Suspense fallback={null}>
        <SuccessBanner />
      </Suspense>

      {state?.error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-500/[0.07] px-4 py-3 mb-6 text-sm text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {state.error}
        </div>
      )}

      <form action={action} className="space-y-3">
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-medium text-gray-400 mb-1.5"
          >
            Adresse e-mail
          </label>
          <input
            ref={emailRef}
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
          <label
            htmlFor="password"
            className="block text-xs font-medium text-gray-400 mb-1.5"
          >
            Mot de passe
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
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
              Connexion…
            </>
          ) : (
            "Se connecter"
          )}
        </button>
      </form>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4 relative overflow-hidden">

      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(249,115,22,0.07) 0%, transparent 70%)",
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
            Connexion
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            Accédez à votre espace de travail Zynth.
          </p>

          <LoginForm />
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-700 mt-6">
          Pas encore de compte ?{" "}
          <Link
            href="/register"
            className="text-gray-400 hover:text-white transition-colors"
          >
            Créer un compte
          </Link>
        </p>

      </div>
    </div>
  );
}

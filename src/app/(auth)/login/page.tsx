import Link from "next/link";
import Image from "next/image";

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

      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Card */}
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

        {/* Panel */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-sm px-8 py-10">

          <h1 className="text-2xl font-semibold tracking-tight text-white mb-1">
            Connexion
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            Accédez à votre espace de travail Zynth.
          </p>

          {/* Google button */}
          <button
            type="button"
            disabled
            className="w-full flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/8 px-4 py-3 text-sm font-medium text-white/80 transition-colors cursor-not-allowed opacity-60"
            title="Disponible prochainement"
          >
            {/* Google SVG */}
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path
                d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
                fill="#4285F4"
              />
              <path
                d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
                fill="#34A853"
              />
              <path
                d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
                fill="#FBBC05"
              />
              <path
                d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
                fill="#EA4335"
              />
            </svg>
            Se connecter avec Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-xs text-gray-600">ou</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          {/* Email / password placeholders */}
          <div className="space-y-3">
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3 text-sm text-gray-600 select-none">
              Adresse e-mail
            </div>
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3 text-sm text-gray-600 select-none">
              Mot de passe
            </div>
          </div>

          <button
            type="button"
            disabled
            className="mt-4 w-full rounded-xl bg-orange-500/20 border border-orange-500/20 px-4 py-3 text-sm font-semibold text-orange-400/60 cursor-not-allowed"
          >
            Continuer
          </button>

        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-700 mt-6">
          Pas encore de compte ?{" "}
          <span className="text-gray-500">Contactez votre administrateur.</span>
        </p>

      </div>
    </div>
  );
}

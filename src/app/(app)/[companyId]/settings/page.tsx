export default function SettingsPage() {
    return (
        <div className="p-8 space-y-6">
            <h1 className="text-3xl font-bold text-white/90">Paramètres de l'entreprise</h1>

            <div className="grid gap-6">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                    <h2 className="text-xl font-semibold text-white/80 mb-4">Profil Général</h2>
                    <p className="text-white/60">Gérez ici les informations de votre entreprise et vos préférences.</p>
                    {/* On pourra ajouter les formulaires plus tard */}
                </div>

                <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 backdrop-blur-md">
                    <h2 className="text-xl font-semibold text-red-400 mb-2">Zone de danger</h2>
                    <button className="px-4 py-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-lg transition-all text-sm border border-red-500/30">
                        Supprimer l'organisation
                    </button>
                </div>
            </div>
        </div>
    )
}
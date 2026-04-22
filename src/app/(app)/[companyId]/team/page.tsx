import { Plus, Users, Shield, Mail } from "lucide-react";

export default function TeamPage() {
    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white/90">Mon Équipe</h1>
                    <p className="text-white/50">Gérez vos collaborateurs et leurs permissions.</p>
                </div>
                {/* Bouton pour ouvrir la modal d'invitation */}
                <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-lg shadow-blue-600/20 font-medium">
                    <Plus size={18} />
                    Inviter un membre
                </button>
            </div>

            <div className="grid gap-6">
                {/* Carte des membres actifs */}
                <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-white/40 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Utilisateur</th>
                                <th className="px-6 py-4">Rôle</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <tr className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 border border-blue-500/30">
                                        E
                                    </div>
                                    <div>
                                        <p className="text-white font-medium text-sm">Emeric (Toi)</p>
                                        <p className="text-white/40 text-xs font-mono">admin@oniva.digital</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 rounded-md bg-purple-500/10 text-purple-400 text-[10px] font-bold border border-purple-500/20">
                                        FOUNDER
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-white/30 hover:text-white transition-colors text-sm font-medium">Gérer</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Section Invitations en attente */}
                <div className="p-6 bg-white/5 border border-dashed border-white/10 rounded-2xl">
                    <h3 className="text-white/60 text-sm font-medium mb-4 flex items-center gap-2">
                        <Mail size={16} /> Invitations en attente
                    </h3>
                    <p className="text-white/30 text-sm italic text-center py-4">Aucune invitation envoyée pour le moment.</p>
                </div>
            </div>
        </div>
    );
}
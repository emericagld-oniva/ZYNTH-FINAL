"use client";

import { motion } from "framer-motion";
import { Mail, MessageSquare, Send } from "lucide-react";

export default function Contact() {
    return (
        <div className="relative pb-20">
            <div className="absolute top-[10%] right-[10%] w-[600px] h-[600px] bg-orange-600/10 rounded-full blur-[150px] pointer-events-none z-0"></div>

            <main className="max-w-6xl mx-auto px-4 py-20 relative z-10">

                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center mb-24">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md">
                        <span className="text-xs font-medium tracking-wide text-orange-400 uppercase">Support & Business</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
                        Contactez le <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">Moteur.</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light">
                        Une question sur la tarification ? Un besoin spécifique pour votre entreprise ? Notre équipe technique vous répond en un éclair.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">

                    {/* Formulaire */}
                    <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="p-8 md:p-10 rounded-3xl bg-[#0a0a0a] border border-white/10 shadow-2xl relative overflow-hidden">
                        <form className="flex flex-col gap-6 relative z-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-gray-400">Prénom & Nom</label>
                                    <input type="text" placeholder="John Doe" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-gray-400">Email professionnel</label>
                                    <input type="email" placeholder="john@entreprise.com" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-gray-400">Sujet</label>
                                <input type="text" placeholder="Demande de démo, Tarification..." className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-gray-400">Message</label>
                                <textarea rows={4} placeholder="Comment Zynth peut vous aider ?" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all resize-none"></textarea>
                            </div>
                            <button type="button" className="mt-4 px-8 py-4 rounded-xl bg-orange-600 text-white font-semibold tracking-wide hover:bg-orange-500 transition-all flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(255,140,0,0.2)]">
                                Envoyer la demande <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </form>
                    </motion.div>

                    {/* Infos de contact */}
                    <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }} className="flex flex-col gap-6">
                        <div className="p-8 rounded-3xl bg-white/5 border border-white/5 flex flex-col items-center justify-center text-center h-full hover:border-orange-500/30 transition-colors">
                            <Mail className="w-10 h-10 text-orange-500 mb-4" />
                            <h3 className="font-semibold text-2xl mb-2">Email Direct</h3>
                            <p className="text-gray-400 mb-2">Pour toute demande commerciale.</p>
                            <a href="mailto:hello@zynth.app" className="text-orange-400 hover:text-orange-300 font-mono">hello@zynth.app</a>
                        </div>
                        <div className="p-8 rounded-3xl bg-white/5 border border-white/5 flex flex-col items-center justify-center text-center h-full hover:border-orange-500/30 transition-colors">
                            <MessageSquare className="w-10 h-10 text-orange-500 mb-4" />
                            <h3 className="font-semibold text-2xl mb-2">Support Technique</h3>
                            <p className="text-gray-400">Réponse garantie en moins de 2 heures pour les clients Élite.</p>
                        </div>
                    </motion.div>

                </div>
            </main>
        </div>
    );
}

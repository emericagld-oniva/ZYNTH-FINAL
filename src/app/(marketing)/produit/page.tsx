"use client";

import { motion } from "framer-motion";
import { Users, TrendingUp, ShieldCheck, Zap, ArrowRight, CheckCircle2, Lock } from "lucide-react";
import Link from "next/link";

export default function Produit() {
    return (
        <div className="relative pb-20">
            <div className="absolute top-[5%] left-[-10%] w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[150px] pointer-events-none z-0"></div>

            <main className="relative z-10 pt-10">

                {/* --- EN-TÊTE HERO SEO --- */}
                <section className="max-w-4xl mx-auto px-4 py-20 text-center mb-16">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
                            <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
                            <span className="text-xs font-medium tracking-wide text-gray-300 uppercase">Au cœur de la machine</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
                            L'anatomie d'un <span className="text-orange-500">outil parfait.</span>
                        </h1>
                        <p className="text-xl text-gray-400 font-light leading-relaxed max-w-3xl mx-auto">
                            Nous avons analysé les processus des entreprises les plus performantes pour concevoir Zynth. Découvrez en détail les quatre piliers qui vont transformer votre façon de travailler.
                        </p>
                    </motion.div>
                </section>

                {/* --- SECTION CRM --- */}
                <section className="max-w-7xl mx-auto px-6 py-32 border-t border-white/5 mb-24">
                    <div className="flex flex-col lg:flex-row items-center gap-20">
                        <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8 }} className="lg:w-1/2">
                            <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-6 border border-orange-500/20 shadow-[0_0_20px_rgba(255,140,0,0.1)]">
                                <Users className="w-6 h-6 text-orange-500" />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">Un CRM qui aligne vos équipes sur un seul objectif : conclure.</h2>
                            <p className="text-gray-400 mb-6 text-lg leading-relaxed">
                                Fini les tableaux Excel fragmentés et les informations perdues. Le CRM Zynth offre une vue panoramique sur vos ventes. De l'acquisition du lead à la signature finale, maîtrisez chaque étape de votre cycle de vente.
                            </p>
                            <p className="text-gray-400 mb-8 text-lg leading-relaxed">
                                Visualisez immédiatement la valeur de votre pipeline et identifiez les opportunités qui nécessitent votre attention pour ne plus laisser d'argent sur la table.
                            </p>
                            <ul className="space-y-4">
                                <li className="flex items-center gap-3 text-gray-300"><CheckCircle2 className="w-5 h-5 text-orange-500" /> Vues Kanban personnalisables par métier</li>
                                <li className="flex items-center gap-3 text-gray-300"><CheckCircle2 className="w-5 h-5 text-orange-500" /> Historique complet des emails et appels (Fiche 360)</li>
                                <li className="flex items-center gap-3 text-gray-300"><CheckCircle2 className="w-5 h-5 text-orange-500" /> Prévisions de chiffre d'affaires intégrées</li>
                            </ul>
                        </motion.div>

                        {/* Faux Kanban CRM en Code */}
                        <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8, delay: 0.1 }} className="lg:w-1/2 w-full rounded-3xl bg-[#0a0a0a] border border-white/10 overflow-hidden shadow-2xl flex flex-col p-6 h-[400px]">
                            <div className="w-full h-8 border-b border-white/5 mb-6 flex items-center justify-between">
                                <p className="text-xs font-mono text-gray-500 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-orange-500"></span> pipeline_ventes_b2b</p>
                            </div>
                            <div className="flex gap-4 h-full">
                                <div className="flex-1 bg-white/5 rounded-xl p-3 flex flex-col gap-3">
                                    <div className="text-xs font-bold text-gray-400 mb-2">QUALIFICATION</div>
                                    <div className="bg-white/10 rounded-lg p-3 h-16 border border-white/5 flex flex-col justify-between"><div className="h-2 w-1/2 bg-gray-500 rounded"></div><div className="h-2 w-1/4 bg-green-500/50 rounded"></div></div>
                                    <div className="bg-white/10 rounded-lg p-3 h-20 border border-white/5 flex flex-col justify-between"><div className="h-2 w-3/4 bg-gray-500 rounded"></div><div className="h-2 w-1/3 bg-green-500/50 rounded"></div></div>
                                </div>
                                <div className="flex-1 bg-white/5 rounded-xl p-3 flex flex-col gap-3">
                                    <div className="text-xs font-bold text-orange-400 mb-2">NÉGOCIATION</div>
                                    <div className="bg-orange-500/20 rounded-lg p-3 h-24 border border-orange-500/30 flex flex-col justify-between shadow-[0_0_15px_rgba(255,140,0,0.1)]"><div className="h-2 w-full bg-orange-400 rounded"></div><div className="h-2 w-1/2 bg-white/50 rounded"></div></div>
                                </div>
                                <div className="flex-1 bg-white/5 rounded-xl p-3 flex flex-col gap-3 opacity-50">
                                    <div className="text-xs font-bold text-gray-400 mb-2">CONTRAT ENVOYÉ</div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* --- SECTION FINANCES --- */}
                <section className="max-w-7xl mx-auto px-6 py-32 border-t border-white/5 bg-gradient-to-b from-transparent to-white/[0.01] mb-24 relative overflow-hidden">
                    <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-blue-900/10 rounded-full blur-[150px] pointer-events-none"></div>

                    <div className="flex flex-col-reverse lg:flex-row items-center gap-20 relative z-10">
                        {/* Faux Graphique Finance en Code */}
                        <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8 }} className="lg:w-1/2 w-full rounded-3xl bg-[#0a0a0a] border border-white/10 overflow-hidden shadow-2xl flex flex-col p-6 h-[400px]">
                            <div className="w-full h-8 border-b border-white/5 mb-6 flex items-center justify-between">
                                <p className="text-xs font-mono text-gray-500 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-400"></span> tableau_de_bord_financier</p>
                            </div>
                            <div className="flex-1 flex items-end gap-2 px-4 pb-4">
                                {[40, 70, 45, 90, 65, 110, 85].map((height, i) => (
                                    <div key={i} className="flex-1 bg-blue-500/20 rounded-t-md relative hover:bg-blue-500/40 transition-colors" style={{ height: `${height}%` }}>
                                        <div className="absolute top-0 w-full bg-blue-400 h-1 rounded-t-md"></div>
                                    </div>
                                ))}
                            </div>
                            <div className="h-12 border-t border-white/5 flex justify-between items-center text-xs text-gray-500 font-mono pt-4">
                                <span>Lun</span><span>Mar</span><span>Mer</span><span>Jeu</span><span>Ven</span><span>Sam</span><span>Dim</span>
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8, delay: 0.1 }} className="lg:w-1/2">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                                <TrendingUp className="w-6 h-6 text-blue-400" />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">Pilotez votre trésorerie avec une précision chirurgicale.</h2>
                            <p className="text-gray-400 mb-6 text-lg leading-relaxed">
                                Zynth transforme la complexité comptable en données claires et exploitables. Fini le stress des fins de mois : l'outil génère vos devis et factures conformes en quelques secondes, aux couleurs de votre marque.
                            </p>
                            <p className="text-gray-400 mb-8 text-lg leading-relaxed">
                                Synchronisez vos comptes bancaires de manière sécurisée pour suivre les paiements en direct, rapprocher vos factures et exporter le tout à votre expert-comptable d'un simple clic.
                            </p>
                            <ul className="space-y-4">
                                <li className="flex items-center gap-3 text-gray-300"><CheckCircle2 className="w-5 h-5 text-blue-400" /> Éditeur de factures et devis 100% personnalisables</li>
                                <li className="flex items-center gap-3 text-gray-300"><CheckCircle2 className="w-5 h-5 text-blue-400" /> Connexion bancaire en temps réel (Norme DSP2)</li>
                                <li className="flex items-center gap-3 text-gray-300"><CheckCircle2 className="w-5 h-5 text-blue-400" /> Suivi automatisé des impayés et relances</li>
                            </ul>
                        </motion.div>
                    </div>
                </section>

                {/* --- SECTION AUTOMATISATION (NOUVELLE) --- */}
                <section className="max-w-7xl mx-auto px-6 py-32 border-t border-white/5 mb-24">
                    <div className="flex flex-col lg:flex-row items-center gap-20">
                        <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8 }} className="lg:w-1/2">
                            <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-6 border border-orange-500/20 shadow-[0_0_20px_rgba(255,140,0,0.1)]">
                                <Zap className="w-6 h-6 text-orange-500" />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">Laissez le moteur Zynth travailler à votre place.</h2>
                            <p className="text-gray-400 mb-6 text-lg leading-relaxed">
                                Les tâches manuelles tuent la productivité de votre équipe. Avec le module de Workflows Zynth, automatisez des chaînes d'actions complexes sans écrire une seule ligne de code.
                            </p>
                            <p className="text-gray-400 mb-8 text-lg leading-relaxed">
                                Un contrat est signé ? Zynth crée automatiquement le projet associé, génère la facture d'acompte et envoie un email de bienvenue au client. Vous n'avez plus qu'à vous concentrer sur votre vrai métier.
                            </p>
                            <ul className="space-y-4">
                                <li className="flex items-center gap-3 text-gray-300"><CheckCircle2 className="w-5 h-5 text-orange-500" /> Éditeur de scénarios logiques (Si... Alors...)</li>
                                <li className="flex items-center gap-3 text-gray-300"><CheckCircle2 className="w-5 h-5 text-orange-500" /> Templates d'automatisation B2B inclus</li>
                                <li className="flex items-center gap-3 text-gray-300"><CheckCircle2 className="w-5 h-5 text-orange-500" /> Alertes et notifications en temps réel</li>
                            </ul>
                        </motion.div>

                        {/* Faux Workflow en Code */}
                        <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8, delay: 0.1 }} className="lg:w-1/2 w-full rounded-3xl bg-[#0a0a0a] border border-white/10 overflow-hidden shadow-2xl flex flex-col p-6 h-[400px] justify-center items-center gap-6">
                            <div className="p-4 bg-white/5 border border-white/10 rounded-xl w-64 text-center">
                                <div className="text-xs text-orange-500 font-bold mb-1">DÉCLENCHEUR</div>
                                <div className="text-sm">Contrat signé (Client A)</div>
                            </div>
                            <div className="w-1 h-8 bg-gradient-to-b from-white/10 to-orange-500/50"></div>
                            <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl w-64 text-center shadow-[0_0_15px_rgba(255,140,0,0.1)]">
                                <div className="text-xs text-orange-400 font-bold mb-1">ACTION 1</div>
                                <div className="text-sm">Créer un dossier Projet</div>
                            </div>
                            <div className="w-1 h-8 bg-gradient-to-b from-orange-500/50 to-white/10"></div>
                            <div className="p-4 bg-white/5 border border-white/10 rounded-xl w-64 text-center">
                                <div className="text-xs text-orange-500 font-bold mb-1">ACTION 2</div>
                                <div className="text-sm">Émettre Facture 30%</div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* --- SECTION VAULT --- */}
                <section className="max-w-7xl mx-auto px-6 py-32 border-t border-white/5 mb-32">
                    <div className="flex flex-col lg:flex-row items-center gap-20">
                        <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8 }} className="lg:w-1/2 w-full rounded-3xl bg-[#0a0a0a] border border-white/10 overflow-hidden shadow-2xl flex flex-col p-6 h-[400px]">
                            <div className="w-full h-8 border-b border-white/5 mb-4 flex items-center justify-between">
                                <p className="text-xs font-mono text-gray-500 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-gray-500"></span> coffre_fort_entreprise</p>
                            </div>
                            <div className="flex flex-col gap-3">
                                {[
                                    { name: "Accès Banque (SGB)", type: "Mot de passe" },
                                    { name: "Contrat Partenariat 2026", type: "Document PDF" },
                                    { name: "Licence Logicielle", type: "Clé Secrète" },
                                    { name: "Kbis & Statuts", type: "Dossier Sécurisé" }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <Lock className="w-4 h-4 text-gray-400" />
                                            <div>
                                                <div className="text-sm font-medium">{item.name}</div>
                                                <div className="text-xs text-gray-500">{item.type}</div>
                                            </div>
                                        </div>
                                        <div className="px-3 py-1 bg-gray-800 rounded text-xs text-gray-400">Crypté</div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8, delay: 0.2 }} className="lg:w-1/2">
                            <div className="w-12 h-12 rounded-xl bg-gray-500/10 flex items-center justify-center mb-6 border border-gray-500/20 shadow-[0_0_20px_rgba(156,163,175,0.1)]">
                                <ShieldCheck className="w-6 h-6 text-gray-300" />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">La forteresse numérique de vos données sensibles.</h2>
                            <p className="text-gray-400 mb-6 text-lg leading-relaxed">
                                Le Vault Zynth est bien plus qu'un gestionnaire de mots de passe. C'est un coffre-fort d'entreprise ultra-sécurisé où vous pouvez stocker vos documents légaux, vos accès bancaires et vos clés logicielles.
                            </p>
                            <p className="text-gray-400 mb-8 text-lg leading-relaxed">
                                Bénéficiez d'une gestion granulaire des droits : partagez un mot de passe avec un employé sans jamais lui révéler en clair, ou révoquez un accès en un clic.
                            </p>
                            <ul className="space-y-4">
                                <li className="flex items-center gap-3 text-gray-300"><CheckCircle2 className="w-5 h-5 text-gray-500" /> Chiffrement de bout en bout (Architecture Zero-Knowledge)</li>
                                <li className="flex items-center gap-3 text-gray-300"><CheckCircle2 className="w-5 h-5 text-gray-500" /> Partage granulaire et contrôle d'accès basé sur les rôles</li>
                                <li className="flex items-center gap-3 text-gray-300"><CheckCircle2 className="w-5 h-5 text-gray-500" /> Historique d'audit et de connexion</li>
                            </ul>
                        </motion.div>
                    </div>
                </section>

                {/* --- CTA FINAL --- */}
                <section className="max-w-4xl mx-auto px-6 py-20 text-center relative z-10">
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="p-16 rounded-[2.5rem] bg-gradient-to-b from-orange-900/20 to-black border border-orange-500/30 relative overflow-hidden shadow-[0_0_60px_rgba(255,140,0,0.1)]">
                        <Zap className="w-12 h-12 text-orange-500 mx-auto mb-10 relative z-10" />
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 relative z-10">Prêt à changer de dimension ?</h2>
                        <p className="text-gray-400 mb-10 relative z-10 max-w-lg mx-auto text-lg">Rejoignez Zynth et faites de votre gestion d'entreprise un avantage concurrentiel majeur.</p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
                            <Link href="/pricing" className="px-10 py-4 rounded-xl bg-orange-600 text-white font-semibold hover:bg-orange-500 transition-all">
                                Voir les tarifs
                            </Link>
                            <Link href="/contact" className="px-10 py-4 rounded-xl bg-white/5 text-white font-semibold hover:bg-white/10 border border-white/10 transition-all">
                                Demander une démo
                            </Link>
                        </div>
                    </motion.div>
                </section>

            </main>
        </div>
    );
}

"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Zap, Shield, Rocket, HelpCircle, Check, Minus } from "lucide-react";
import Link from "next/link";

export default function Pricing() {
    return (
        <div className="relative pb-20">
            {/* Glow d'arrière-plan */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-orange-600/10 rounded-full blur-[150px] pointer-events-none z-0"></div>

            <main className="max-w-6xl mx-auto px-4 py-20 relative z-10">

                {/* --- EN-TÊTE --- */}
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center mb-24">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
                        <span className="text-xs font-medium tracking-wide text-orange-400 uppercase">Tarification Transparente</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
                        Un investissement, <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
                            zéro compromis.
                        </span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light">
                        Choisissez le moteur adapté à la taille de votre entreprise. Tous nos plans incluent les mises à jour gratuites et le support client. Sans frais cachés, annulable à tout moment.
                    </p>
                </motion.div>

                {/* --- GRILLE DES CARTES DE PRIX --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-32">
                    {/* Plan Starter */}
                    <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }} className="p-8 rounded-3xl bg-[#0a0a0a] border border-white/10 flex flex-col hover:border-orange-500/30 transition-colors">
                        <Shield className="w-8 h-8 text-gray-400 mb-4" />
                        <h3 className="text-2xl font-semibold mb-2">Starter</h3>
                        <p className="text-gray-400 mb-6 text-sm">L'essentiel pour les indépendants et TPE qui se structurent.</p>
                        <div className="mb-8">
                            <span className="text-5xl font-bold">29€</span><span className="text-gray-500">/mois</span>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1 text-sm text-gray-300">
                            <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-gray-500" /> Jusqu'à 500 contacts CRM</li>
                            <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-gray-500" /> 10 Projets actifs simultanés</li>
                            <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-gray-500" /> Facturation & Devis simples</li>
                            <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-gray-500" /> Support par email (48h)</li>
                        </ul>
                        <button className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-semibold transition-colors text-sm">Démarrer gratuitement</button>
                    </motion.div>

                    {/* Plan Élite */}
                    <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="p-8 rounded-3xl bg-gradient-to-b from-orange-900/20 to-[#0a0a0a] border border-orange-500 flex flex-col relative overflow-hidden transform md:-translate-y-4 shadow-[0_0_40px_rgba(255,140,0,0.15)]">
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-orange-400 to-orange-600"></div>
                        <div className="absolute top-4 right-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Populaire</div>

                        <Zap className="w-8 h-8 text-orange-500 mb-4" />
                        <h3 className="text-2xl font-semibold mb-2">Élite</h3>
                        <p className="text-gray-400 mb-6 text-sm">Le moteur complet pour propulser les PME et les équipes agiles.</p>
                        <div className="mb-8">
                            <span className="text-5xl font-bold">89€</span><span className="text-gray-500">/mois</span>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1 text-sm text-gray-200">
                            <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-orange-500" /> Contacts & Projets illimités</li>
                            <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-orange-500" /> Workflows d'automatisation</li>
                            <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-orange-500" /> Coffre-fort d'entreprise (Vault)</li>
                            <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-orange-500" /> Synchronisation bancaire live</li>
                            <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-orange-500" /> Support prioritaire (2h)</li>
                        </ul>
                        <button className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold transition-colors shadow-[0_0_20px_rgba(255,140,0,0.2)] text-sm">Déployer Élite</button>
                    </motion.div>

                    {/* Plan Entreprise */}
                    <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="p-8 rounded-3xl bg-[#0a0a0a] border border-white/10 flex flex-col hover:border-orange-500/30 transition-colors">
                        <Rocket className="w-8 h-8 text-gray-400 mb-4" />
                        <h3 className="text-2xl font-semibold mb-2">Sur-mesure</h3>
                        <p className="text-gray-400 mb-6 text-sm">Pour les grandes structures nécessitant un accompagnement total.</p>
                        <div className="mb-8">
                            <span className="text-5xl font-bold">Devis</span>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1 text-sm text-gray-300">
                            <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-gray-600" /> Tout du plan Élite</li>
                            <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-gray-600" /> Instances sur serveurs dédiés</li>
                            <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-gray-600" /> Accès API complet & Webhooks</li>
                            <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-gray-600" /> Ingénieur dédié au déploiement</li>
                        </ul>
                        <Link href="/contact" className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-semibold transition-colors text-center block text-sm">Nous contacter</Link>
                    </motion.div>
                </div>

                {/* --- TABLEAU COMPARATIF DÉTAILLÉ --- */}
                <section className="max-w-5xl mx-auto mb-32 hidden md:block">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Comparaison détaillée des fonctionnalités</h2>
                        <p className="text-gray-400">Découvrez exactement ce qui est inclus dans chaque offre.</p>
                    </div>

                    <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl overflow-hidden">
                        <div className="grid grid-cols-4 bg-white/5 border-b border-white/10 p-6 font-semibold">
                            <div className="col-span-1 text-gray-300">Fonctionnalité</div>
                            <div className="text-center text-white">Starter</div>
                            <div className="text-center text-orange-400">Élite</div>
                            <div className="text-center text-white">Sur-mesure</div>
                        </div>

                        {/* Catégorie 1 */}
                        <div className="bg-white/5 px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">CRM & Ventes</div>
                        {[
                            { name: "Contacts & Leads", s: "500", e: "Illimité", c: "Illimité" },
                            { name: "Pipelines visuels", s: "1", e: "Illimité", c: "Illimité" },
                            { name: "Scoring prédictif (IA)", s: false, e: true, c: true },
                        ].map((row, i) => (
                            <div key={i} className="grid grid-cols-4 border-b border-white/5 p-6 text-sm items-center hover:bg-white/[0.02] transition-colors">
                                <div className="col-span-1 text-gray-300">{row.name}</div>
                                <div className="text-center text-gray-400">{typeof row.s === 'boolean' ? (row.s ? <Check className="w-5 h-5 mx-auto text-gray-300" /> : <Minus className="w-5 h-5 mx-auto text-gray-600" />) : row.s}</div>
                                <div className="text-center text-orange-500">{typeof row.e === 'boolean' ? (row.e ? <Check className="w-5 h-5 mx-auto text-orange-500" /> : <Minus className="w-5 h-5 mx-auto text-gray-600" />) : row.e}</div>
                                <div className="text-center text-gray-400">{typeof row.c === 'boolean' ? (row.c ? <Check className="w-5 h-5 mx-auto text-gray-300" /> : <Minus className="w-5 h-5 mx-auto text-gray-600" />) : row.c}</div>
                            </div>
                        ))}

                        {/* Catégorie 2 */}
                        <div className="bg-white/5 px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Gestion & Finances</div>
                        {[
                            { name: "Factures & Devis", s: "Illimité", e: "Illimité", c: "Illimité" },
                            { name: "Rapprochement bancaire", s: false, e: true, c: true },
                            { name: "Coffre-fort d'entreprise", s: false, e: "Inclus (50Go)", c: "Inclus (Illimité)" },
                            { name: "Automatisations (Workflows)", s: false, e: "Jusqu'à 100/mois", c: "Illimité" },
                        ].map((row, i) => (
                            <div key={i} className="grid grid-cols-4 border-b border-white/5 p-6 text-sm items-center hover:bg-white/[0.02] transition-colors">
                                <div className="col-span-1 text-gray-300">{row.name}</div>
                                <div className="text-center text-gray-400">{typeof row.s === 'boolean' ? (row.s ? <Check className="w-5 h-5 mx-auto text-gray-300" /> : <Minus className="w-5 h-5 mx-auto text-gray-600" />) : row.s}</div>
                                <div className="text-center text-orange-500 font-medium">{typeof row.e === 'boolean' ? (row.e ? <Check className="w-5 h-5 mx-auto text-orange-500" /> : <Minus className="w-5 h-5 mx-auto text-gray-600" />) : row.e}</div>
                                <div className="text-center text-gray-400">{typeof row.c === 'boolean' ? (row.c ? <Check className="w-5 h-5 mx-auto text-gray-300" /> : <Minus className="w-5 h-5 mx-auto text-gray-600" />) : row.c}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* --- FAQ SECTION --- */}
                <section className="max-w-4xl mx-auto mb-32">
                    <div className="text-center mb-12">
                        <HelpCircle className="w-10 h-10 text-orange-500 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold mb-4">Foire aux questions</h2>
                        <p className="text-gray-400">Tout ce que vous devez savoir avant de démarrer avec Zynth.</p>
                    </div>

                    <div className="space-y-6">
                        {[
                            {
                                q: "Puis-je changer d'offre ou annuler à tout moment ?",
                                a: "Absolument. Il n'y a aucun engagement de durée sur les plans Starter et Élite. Vous pouvez passer à l'offre supérieure, inférieure ou annuler votre abonnement d'un simple clic depuis vos paramètres. La facturation s'arrêtera à la fin du mois en cours."
                            },
                            {
                                q: "Comment garantissez-vous la sécurité de mes données (Coffre-fort) ?",
                                a: "La sécurité est l'ADN de Zynth. Vos données sensibles et mots de passe sont chiffrés de bout en bout avec la norme militaire AES-256 (Architecture Zero-Knowledge). Cela signifie que même nos ingénieurs ne peuvent pas lire vos données. De plus, nos serveurs sont hébergés et répliqués en France."
                            },
                            {
                                q: "Proposez-vous une aide pour migrer depuis mon ancien outil ?",
                                a: "Oui. Pour les clients du plan Élite, nous offrons un outil d'importation en 1-clic pour vos fichiers CSV (Excel) ou depuis des outils comme Salesforce, Notion ou Pipedrive. Pour le plan Sur-mesure, un ingénieur dédié s'occupe de l'intégralité de la migration."
                            },
                            {
                                q: "Ai-je besoin de compétences techniques pour utiliser les Workflows ?",
                                a: "Non, pas du tout. Le module d'automatisation a été conçu pour être visuel. C'est un système de glisser-déposer basé sur la logique 'Si ceci arrive, alors fais cela'. Nous fournissons également plus de 50 modèles prêts à l'emploi (ex: relance facture automatique)."
                            }
                        ].map((faq, i) => (
                            <div key={i} className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-colors">
                                <h4 className="text-lg font-bold mb-3 text-white">{faq.q}</h4>
                                <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* --- CTA FINAL --- */}
                <section className="text-center bg-gradient-to-br from-orange-900/20 to-black border border-orange-500/30 rounded-3xl p-12 shadow-[0_0_50px_rgba(255,140,0,0.1)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <h2 className="text-3xl font-bold mb-4 relative z-10">Vous avez un besoin spécifique ?</h2>
                    <p className="text-gray-400 mb-8 max-w-xl mx-auto relative z-10">Notre équipe commerciale est disponible pour analyser vos processus actuels et vous proposer une démonstration personnalisée de la plateforme.</p>
                    <Link href="/contact" className="inline-block px-8 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-semibold transition-colors relative z-10">
                        Contacter l'équipe des ventes
                    </Link>
                </section>

            </main>
        </div>
    );
}

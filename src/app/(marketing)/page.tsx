"use client";

import { motion } from "framer-motion";
import { Users, TrendingUp, ShieldCheck, Zap, ArrowRight, CheckCircle2, BarChart3, Clock, Shield } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative">
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-orange-600/15 rounded-full blur-[150px] pointer-events-none z-0"></div>

      <main className="relative z-10">

        {/* --- HERO SECTION --- */}
        <section className="max-w-6xl mx-auto px-4 pt-24 pb-20 text-center relative">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
              <span className="text-xs font-medium tracking-wide text-gray-300 uppercase">Accès anticipé réservé aux entreprises ambitieuses</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight mb-8 leading-tight">
              Moteur de gestion <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
                nouvelle génération.
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-12 font-light leading-relaxed">
              Ne perdez plus votre temps à jongler entre 10 applications différentes. Zynth centralise votre CRM, vos projets, vos finances et automatise l'invisible. L'élégance technologique au service exclusif de votre rentabilité.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/pricing" className="px-10 py-5 rounded-xl bg-orange-600 text-white font-semibold tracking-wide hover:bg-orange-500 transition-all flex items-center gap-2 group shadow-[0_0_40px_rgba(255,140,0,0.3)] text-lg">
                Déployer mon espace
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/produit" className="px-10 py-5 rounded-xl bg-white/5 text-white font-semibold hover:bg-white/10 border border-white/10 transition-all text-lg">
                Explorer les fonctionnalités
              </Link>
            </div>
          </motion.div>

          {/* DASHBOARD EN PUR CODE */}
          <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.4 }} className="mt-24 w-full max-w-5xl mx-auto rounded-t-3xl bg-[#0a0a0a] border-t border-x border-white/10 relative overflow-hidden shadow-2xl flex flex-col">
            <div className="w-full h-12 bg-white/5 border-b border-white/5 flex items-center px-4 justify-between">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>
              <div className="px-4 py-1 rounded-md bg-black/50 border border-white/5 text-xs text-gray-400 font-mono">
                app.zynth.app/dashboard
              </div>
              <div className="w-16"></div>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6 opacity-80 pointer-events-none">
              <div className="flex flex-col gap-4">
                <div className="h-32 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/20 p-4 flex flex-col justify-between">
                  <div className="text-orange-500 text-sm font-semibold">Chiffre d'affaires</div>
                  <div className="text-3xl font-bold text-white">42,850 €</div>
                  <div className="text-xs text-green-400">+12% vs mois dernier</div>
                </div>
                <div className="h-48 rounded-xl bg-white/5 border border-white/5 p-4 flex flex-col gap-3">
                  <div className="h-4 w-1/2 bg-white/10 rounded"></div>
                  <div className="h-4 w-3/4 bg-white/5 rounded"></div>
                  <div className="h-4 w-2/3 bg-white/5 rounded"></div>
                  <div className="h-4 w-1/2 bg-white/5 rounded mt-4"></div>
                  <div className="h-4 w-4/5 bg-white/5 rounded"></div>
                </div>
              </div>

              <div className="md:col-span-2 flex flex-col gap-4">
                <div className="flex gap-4">
                  <div className="flex-1 h-24 rounded-xl bg-white/5 border border-white/5 p-4 flex flex-col justify-between">
                    <div className="text-gray-400 text-sm">Leads actifs</div>
                    <div className="text-2xl font-bold">124</div>
                  </div>
                  <div className="flex-1 h-24 rounded-xl bg-white/5 border border-white/5 p-4 flex flex-col justify-between">
                    <div className="text-gray-400 text-sm">Projets en cours</div>
                    <div className="text-2xl font-bold">18</div>
                  </div>
                </div>

                <div className="flex-1 rounded-xl bg-white/5 border border-white/5 p-4 flex items-end gap-2 h-40">
                  <div className="w-full bg-orange-500/20 h-[30%] rounded-t-md relative"><div className="absolute top-0 w-full bg-orange-500 h-1"></div></div>
                  <div className="w-full bg-orange-500/40 h-[50%] rounded-t-md relative"><div className="absolute top-0 w-full bg-orange-500 h-1"></div></div>
                  <div className="w-full bg-orange-500/60 h-[40%] rounded-t-md relative"><div className="absolute top-0 w-full bg-orange-500 h-1"></div></div>
                  <div className="w-full bg-orange-500/80 h-[80%] rounded-t-md relative"><div className="absolute top-0 w-full bg-orange-500 h-1"></div></div>
                  <div className="w-full bg-orange-500 h-[60%] rounded-t-md relative"><div className="absolute top-0 w-full bg-orange-400 h-1 shadow-[0_0_10px_#FF8C00]"></div></div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* --- NOUVELLE SECTION : METRICS / REASSURANCE --- */}
        <section className="border-y border-white/5 bg-[#0a0a0a]">
          <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-white/10">
            <div className="flex-1 px-4">
              <BarChart3 className="w-8 h-8 text-orange-500 mx-auto mb-4" />
              <div className="text-4xl font-bold text-white mb-2">+40%</div>
              <div className="text-gray-400 text-sm">De gain de productivité constaté dès le premier mois d'utilisation.</div>
            </div>
            <div className="flex-1 px-4 pt-8 md:pt-0">
              <Clock className="w-8 h-8 text-blue-400 mx-auto mb-4" />
              <div className="text-4xl font-bold text-white mb-2">15h</div>
              <div className="text-gray-400 text-sm">Économisées chaque semaine sur les tâches administratives répétitives.</div>
            </div>
            <div className="flex-1 px-4 pt-8 md:pt-0">
              <Shield className="w-8 h-8 text-gray-300 mx-auto mb-4" />
              <div className="text-4xl font-bold text-white mb-2">100%</div>
              <div className="text-gray-400 text-sm">Données chiffrées en AES-256 et hébergées sur des serveurs souverains.</div>
            </div>
          </div>
        </section>

        {/* --- BENTO GRID --- */}
        <section className="max-w-7xl mx-auto px-6 py-32">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">Tout votre business. <br /><span className="text-gray-500">Une seule interface.</span></h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">Zynth remplace à lui seul votre outil de facturation, votre gestionnaire de tâches et votre plateforme de suivi client.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
              { icon: Users, title: "CRM", desc: "Suivez vos leads, centralisez les échanges et boostez votre taux de conversion avec un pipeline ultra-visuel.", color: "text-orange-500" },
              { icon: TrendingUp, title: "Finances", desc: "Éditez devis et factures en 2 clics. Suivez votre trésorerie en temps réel et automatisez les relances.", color: "text-blue-400" },
              { icon: ShieldCheck, title: "Coffre-fort", desc: "Un espace ultra-sécurisé pour stocker vos mots de passe et documents confidentiels d'entreprise.", color: "text-gray-300" },
              { icon: Zap, title: "Workflows", desc: "Créez des scénarios automatiques puissants pour laisser l'outil travailler à votre place la nuit.", color: "text-orange-500" }
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }} className="p-8 rounded-3xl bg-[#0a0a0a] border border-white/10 hover:border-orange-500/30 transition-colors group cursor-pointer flex flex-col">
                <item.icon className={`w-10 h-10 ${item.color} mb-6 transform group-hover:scale-110 transition-transform`} />
                <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Link href="/produit" className="inline-flex items-center gap-2 text-orange-500 font-semibold hover:text-orange-400 transition-colors">
              Explorer le détail des fonctionnalités <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* --- PRICING TEASER --- */}
        <section className="max-w-5xl mx-auto px-6 py-32 border-t border-white/5 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Investissez dans <span className="text-orange-500">votre performance.</span></h2>
          <p className="text-xl text-gray-400 mb-16">Des tarifs transparents, conçus pour évoluer avec vous.</p>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="p-10 md:p-16 rounded-[2.5rem] bg-gradient-to-b from-orange-900/20 to-[#0a0a0a] border border-orange-500/30 flex flex-col md:flex-row items-center justify-between gap-10 text-left shadow-[0_0_50px_rgba(255,140,0,0.1)]">
            <div>
              <div className="inline-block px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider mb-4 border border-orange-500/20">Plan Populaire</div>
              <h3 className="text-3xl font-bold mb-2">Élite <span className="text-gray-500 font-medium text-lg ml-2">89€ / mois</span></h3>
              <p className="text-gray-400 mb-6">Le moteur complet, taillé pour propulser les PME et les leaders.</p>
              <ul className="space-y-2">
                <li className="flex items-center gap-3 text-sm text-gray-300"><CheckCircle2 className="w-4 h-4 text-orange-500" /> CRM Avancé & Gestion de projets illimités</li>
                <li className="flex items-center gap-3 text-sm text-gray-300"><CheckCircle2 className="w-4 h-4 text-orange-500" /> Automatisations, Facturation & Coffre-fort complets</li>
              </ul>
            </div>

            <Link href="/pricing" className="w-full md:w-auto px-8 py-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold transition-colors text-center whitespace-nowrap shadow-[0_0_20px_rgba(255,140,0,0.2)]">
              Voir tous les tarifs
            </Link>
          </motion.div>
        </section>

      </main>
    </div>
  );
}

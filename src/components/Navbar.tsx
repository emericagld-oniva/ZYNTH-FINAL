"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
    // Cette fonction de Next.js détecte l'URL actuelle
    const pathname = usePathname();

    return (
        <nav className="fixed top-0 w-full z-50 bg-[#050505]/80 backdrop-blur-md border-b border-white/5 h-20">
            <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">

                {/* LOGO SVG */}
                <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
                    <img src="/ZYNTH-APP.svg" alt="Logo Zynth" className="h-8 w-auto" />
                </Link>

                {/* LIENS AVEC DÉTECTION ACTIVE */}
                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
                    <Link
                        href="/"
                        className={`transition-colors pb-1 ${pathname === "/" ? "text-white border-b border-orange-500" : "hover:text-white"}`}
                    >
                        Accueil
                    </Link>
                    <Link
                        href="/produit"
                        className={`transition-colors pb-1 ${pathname === "/produit" ? "text-white border-b border-orange-500" : "hover:text-white"}`}
                    >
                        Produit
                    </Link>
                    <Link
                        href="/pricing"
                        className={`transition-colors pb-1 ${pathname === "/pricing" ? "text-white border-b border-orange-500" : "hover:text-white"}`}
                    >
                        Tarifs
                    </Link>
                    <Link
                        href="/contact"
                        className={`transition-colors pb-1 ${pathname === "/contact" ? "text-white border-b border-orange-500" : "hover:text-white"}`}
                    >
                        Contact
                    </Link>
                </div>

                {/* BOUTON */}
                <Link href="/auth/login" className="px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/5 text-sm font-semibold transition-all">
                    Connexion
                </Link>
            </div>
        </nav>
    );
}
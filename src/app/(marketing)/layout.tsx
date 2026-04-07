// src/app/(marketing)/layout.tsx
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <div className="flex-grow pt-20">
        {children}
      </div>

      <footer className="border-t border-white/5 bg-[#020202] pt-20 pb-12 px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <Link href="/">
            <img src="/ZYNTH-APP.svg" alt="Logo Zynth" className="h-6 w-auto opacity-70 hover:opacity-100 transition-opacity" />
          </Link>

          <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-500">
            <Link href="/produit" className="hover:text-white transition-colors">Produit</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Tarifs</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
            <a href="https://instagram.com/zynth.app" target="_blank" className="font-medium hover:text-orange-500 transition-colors">@zynth.app</a>
          </div>
        </div>
        <div className="text-center text-xs text-gray-700 mt-12">
          © 2026 Zynth App. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}

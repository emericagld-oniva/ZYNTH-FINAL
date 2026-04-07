import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zynth App | Le moteur de gestion nouvelle génération",
  description: "CRM, Finances, Projets et Automatisation dans une seule interface élégante.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="bg-[#050505] text-white selection:bg-orange-500/30 overflow-x-hidden font-sans">
        {children}
      </body>
    </html>
  );
}

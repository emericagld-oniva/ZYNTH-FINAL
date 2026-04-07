"use client";

import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Settings, Users, UsersRound, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard",     icon: LayoutDashboard },
  { href: "/clients",   label: "Clients",        icon: UsersRound },
  { href: "/users",     label: "Utilisateurs",   icon: Users },
  { href: "/settings",  label: "Paramètres",     icon: Settings },
] as const;

interface AppSidebarProps {
  userEmail?: string | null;
}

export function AppSidebar({ userEmail }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-60 h-screen sticky top-0 flex flex-col shrink-0 bg-[#080808] border-r border-white/[0.05]">

      {/* Logo */}
      <div className="px-5 pt-6 pb-5 border-b border-white/[0.04]">
        <Link href="/" className="block w-fit" aria-label="Retour à l'accueil">
          <Image
            src="/ZYNTH-APP.svg"
            alt="Zynth"
            width={80}
            height={20}
            className="h-5 w-auto opacity-75 hover:opacity-100 transition-opacity duration-200"
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <motion.div
              key={item.href}
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            >
              <Link
                href={item.href}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 ${
                  isActive
                    ? "text-orange-300 bg-orange-500/[0.08] border border-orange-500/[0.18]"
                    : "text-gray-500 hover:text-gray-200 hover:bg-white/[0.04] border border-transparent"
                }`}
              >
                <item.icon
                  className={`w-4 h-4 shrink-0 transition-colors duration-150 ${
                    isActive ? "text-orange-400" : ""
                  }`}
                />
                {item.label}

                {/* Active dot */}
                <AnimatePresence>
                  {isActive && (
                    <motion.span
                      key="dot"
                      layoutId="sidebar-active-dot"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-400"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      transition={{ duration: 0.15 }}
                    />
                  )}
                </AnimatePresence>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-3 pb-5 pt-3 border-t border-white/[0.04]">
        {userEmail && (
          <p className="px-3 mb-2 text-xs text-gray-600 truncate" title={userEmail}>
            {userEmail}
          </p>
        )}
        <motion.button
          whileHover={{ x: 3 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 border border-transparent hover:text-red-400 hover:bg-red-500/[0.06] hover:border-red-500/[0.12] transition-colors duration-150"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Déconnexion
        </motion.button>
      </div>
    </aside>
  );
}

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Settings, UsersRound, LogOut, Building2 } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface AppSidebarProps {
  companyId: string;
  companyName: string;
  userEmail?: string | null;
}

export function AppSidebar({ companyId, companyName, userEmail }: AppSidebarProps) {
  const pathname = usePathname();

  const NAV_ITEMS = [
    { href: `/${companyId}/dashboard`, label: "Dashboard",  icon: LayoutDashboard },
    { href: `/${companyId}/clients`,   label: "Clients",    icon: UsersRound },
    { href: `/${companyId}/settings`,  label: "Paramètres", icon: Settings },
  ];

  return (
    <aside className="w-60 h-screen sticky top-0 flex flex-col shrink-0 bg-[#080808] border-r border-white/[0.05]">

      {/* Company header */}
      <div className="px-4 pt-5 pb-4 border-b border-white/[0.04]">
        <Link
          href="/workspaces"
          className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-white/[0.04] transition-colors group"
          title="Changer d'espace"
        >
          <div className="w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0 text-xs font-bold text-orange-400">
            {companyName.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium text-gray-300 truncate group-hover:text-white transition-colors">
            {companyName}
          </span>
          <Building2 className="w-3.5 h-3.5 text-gray-700 shrink-0 ml-auto group-hover:text-gray-500 transition-colors" />
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

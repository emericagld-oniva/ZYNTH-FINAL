import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { TrendingUp, TrendingDown, Users, DollarSign, FolderKanban, CheckCircle2 } from "lucide-react";

const ACCENT_CLASSES = {
  orange:  { icon: "text-orange-400",  glow: "bg-orange-500/[0.08]",  border: "border-orange-500/[0.12]",  badge: "text-orange-400  bg-orange-400/10"  },
  emerald: { icon: "text-emerald-400", glow: "bg-emerald-500/[0.07]", border: "border-emerald-500/[0.12]", badge: "text-emerald-400 bg-emerald-400/10" },
  sky:     { icon: "text-sky-400",     glow: "bg-sky-500/[0.07]",     border: "border-sky-500/[0.12]",     badge: "text-sky-400     bg-sky-400/10"     },
  violet:  { icon: "text-violet-400",  glow: "bg-violet-500/[0.07]",  border: "border-violet-500/[0.12]",  badge: "text-violet-400  bg-violet-400/10"  },
} as const;

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const clientCount = await prisma.client.count({
    where: { userId: session.user.id },
  });

  const now = new Date();
  const dateLabel = now.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const STATS = [
    {
      label: "Clients",
      value: clientCount.toString(),
      delta: "CRM",
      trend: "up" as const,
      icon: Users,
      accent: "orange" as const,
      sub: "dans votre portefeuille",
    },
    {
      label: "Revenus du mois",
      value: "€24 890",
      delta: "+8.3%",
      trend: "up" as const,
      icon: DollarSign,
      accent: "emerald" as const,
      sub: "vs mois dernier",
    },
    {
      label: "Projets en cours",
      value: "12",
      delta: "-2",
      trend: "down" as const,
      icon: FolderKanban,
      accent: "sky" as const,
      sub: "depuis la semaine dernière",
    },
    {
      label: "Taux de résolution",
      value: "94.2%",
      delta: "+1.4pp",
      trend: "up" as const,
      icon: CheckCircle2,
      accent: "violet" as const,
      sub: "tickets clôturés",
    },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">

      {/* Header */}
      <div className="mb-10">
        <p className="text-xs font-medium uppercase tracking-widest text-gray-600 mb-2">
          {dateLabel}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Tableau de bord
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Bonjour {session.user.name ?? session.user.email}. Voici votre activité.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map((stat) => {
          const colors = ACCENT_CLASSES[stat.accent];
          const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown;

          return (
            <div
              key={stat.label}
              className={`relative overflow-hidden rounded-2xl border ${colors.border} bg-white/[0.025] backdrop-blur-sm p-5 flex flex-col gap-4`}
            >
              <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl ${colors.glow} pointer-events-none`} />

              <div className="flex items-start justify-between">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colors.glow} border ${colors.border}`}>
                  <stat.icon className={`w-4 h-4 ${colors.icon}`} />
                </div>
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${colors.badge}`}>
                  <TrendIcon className="w-3 h-3" />
                  {stat.delta}
                </span>
              </div>

              <div>
                <p className="text-2xl font-bold tracking-tight text-white tabular-nums">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
              </div>

              <p className="text-[11px] text-gray-700 border-t border-white/[0.04] pt-3 -mb-1">
                {stat.sub}
              </p>
            </div>
          );
        })}
      </div>

      {/* Placeholder */}
      <div className="mt-6 rounded-2xl border border-white/[0.05] bg-white/[0.015] backdrop-blur-sm p-8 flex items-center justify-center min-h-48">
        <div className="text-center">
          <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center mx-auto mb-3">
            <FolderKanban className="w-5 h-5 text-gray-600" />
          </div>
          <p className="text-sm font-medium text-gray-500">Zone de contenu</p>
          <p className="text-xs text-gray-700 mt-1">Graphiques et données détaillées à venir.</p>
        </div>
      </div>

    </div>
  );
}

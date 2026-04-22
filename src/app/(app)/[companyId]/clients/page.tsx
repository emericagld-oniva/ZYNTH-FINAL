import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ClientsShell from "./shell";

export default async function CompanyClientsPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { companyId } = await params;

  // 1. Vérification de sécurité (Appartenance à l'entreprise)
  const membership = await prisma.companyMember.findUnique({
    where: {
      userId_companyId: {
        userId: session.user.id,
        companyId
      }
    },
  });

  if (!membership) redirect("/workspaces");

  // 2. Récupération des clients (Le champ profession sera inclus automatiquement)
  const clients = await prisma.client.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
  });

  // On envoie les clients et l'ID au "Shell" qui gère l'affichage et le tri
  return <ClientsShell clients={clients} companyId={companyId} />;
}
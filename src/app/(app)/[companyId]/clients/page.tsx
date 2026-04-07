import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ClientsShell from "@/app/(app)/clients/shell";

export default async function CompanyClientsPage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { companyId } = await params;

  const membership = await prisma.companyMember.findUnique({
    where: { userId_companyId: { userId: session.user.id, companyId } },
  });
  if (!membership) redirect("/workspaces");

  const clients = await prisma.client.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
  });

  return <ClientsShell clients={clients} companyId={companyId} />;
}

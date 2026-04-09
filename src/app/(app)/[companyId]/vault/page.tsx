import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import VaultShell from "./vault-shell";

export default async function VaultPage({
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

  const [folders, items] = await Promise.all([
    prisma.vaultFolder.findMany({
      where: { companyId },
      orderBy: { createdAt: "asc" },
      include: { _count: { select: { items: true } } },
    }),
    prisma.vaultItem.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        username: true,
        url: true,
        notes: true,
        folderId: true,
        createdAt: true,
      },
    }),
  ]);

  return (
    <div className="h-screen overflow-hidden">
      <VaultShell companyId={companyId} folders={folders} items={items} />
    </div>
  );
}

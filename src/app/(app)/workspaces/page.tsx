import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import WorkspacesShell from "./workspaces-shell";

export default async function WorkspacesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const memberships = await prisma.companyMember.findMany({
    where: { userId: session.user.id },
    include: { company: true },
    orderBy: { joinedAt: "asc" },
  });

  return (
    <WorkspacesShell
      memberships={memberships.map((m) => ({
        companyId: m.companyId,
        companyName: m.company.name,
        role: m.role,
        joinedAt: m.joinedAt,
      }))}
      userName={session.user.name ?? session.user.email ?? ""}
    />
  );
}

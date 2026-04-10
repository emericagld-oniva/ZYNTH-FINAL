// src/app/(app)/[companyId]/projects/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProjectsShell from "./projects-shell";
import type { ProjectRow, ClientOption } from "./projects-config";

export default async function ProjectsPage({
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

  const [rawProjects, clients] = await Promise.all([
    prisma.project.findMany({
      where: { companyId },
      orderBy: { updatedAt: "desc" },
      include: {
        client: { select: { name: true } },
        tasks:  { select: { status: true } },
      },
    }),
    prisma.client.findMany({
      where: { companyId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const projects: ProjectRow[] = rawProjects.map((p) => ({
    id:          p.id,
    title:       p.title,
    description: p.description,
    status:      p.status as ProjectRow["status"],
    clientId:    p.clientId,
    clientName:  p.client?.name ?? null,
    deadline:    p.deadline,
    totalTasks:  p.tasks.length,
    doneTasks:   p.tasks.filter((t) => t.status === "DONE").length,
    createdAt:   p.createdAt,
  }));

  const clientOptions: ClientOption[] = clients;

  return <ProjectsShell companyId={companyId} projects={projects} clients={clientOptions} />;
}

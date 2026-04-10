// src/lib/actions/projects.ts
"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type ProjectState = { error?: string; success?: boolean } | null;

// ─── helpers ────────────────────────────────────────────

async function getMembership(userId: string, companyId: string) {
  return prisma.companyMember.findUnique({
    where: { userId_companyId: { userId, companyId } },
  });
}

function parseDeadline(raw: FormDataEntryValue | null): Date | null {
  if (!raw || typeof raw !== "string" || !raw.trim()) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
}

// ─── Create ─────────────────────────────────────────────

export async function createProjectAction(
  _prev: ProjectState,
  formData: FormData
): Promise<ProjectState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Non autorisé." };

  const companyId   = (formData.get("companyId")   as string)?.trim();
  const title       = (formData.get("title")        as string)?.trim();
  const description = (formData.get("description")  as string)?.trim() || null;
  const status      = (formData.get("status")        as string)?.trim() || "BACKLOG";
  const clientId    = (formData.get("clientId")      as string)?.trim() || null;
  const deadline    = parseDeadline(formData.get("deadline"));

  if (!companyId) return { error: "Workspace manquant." };
  if (!title)     return { error: "Le titre est requis." };

  const membership = await getMembership(session.user.id, companyId);
  if (!membership) return { error: "Accès refusé." };

  await prisma.project.create({
    data: { title, description, status: status as any, clientId, companyId, deadline },
  });

  revalidatePath(`/${companyId}/projects`);
  return { success: true };
}

// ─── Update ─────────────────────────────────────────────

export async function updateProjectAction(
  _prev: ProjectState,
  formData: FormData
): Promise<ProjectState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Non autorisé." };

  const projectId   = (formData.get("projectId")    as string)?.trim();
  const companyId   = (formData.get("companyId")    as string)?.trim();
  const title       = (formData.get("title")        as string)?.trim();
  const description = (formData.get("description")  as string)?.trim() || null;
  const status      = (formData.get("status")        as string)?.trim() || "BACKLOG";
  const clientId    = (formData.get("clientId")      as string)?.trim() || null;
  const deadline    = parseDeadline(formData.get("deadline"));

  if (!projectId) return { error: "Projet introuvable." };
  if (!companyId) return { error: "Workspace manquant." };
  if (!title)     return { error: "Le titre est requis." };

  const membership = await getMembership(session.user.id, companyId);
  if (!membership) return { error: "Accès refusé." };

  const existing = await prisma.project.findUnique({ where: { id: projectId } });
  if (!existing || existing.companyId !== companyId) return { error: "Projet introuvable." };

  await prisma.project.update({
    where: { id: projectId },
    data: { title, description, status: status as any, clientId, deadline },
  });

  revalidatePath(`/${companyId}/projects`);
  return { success: true };
}

// ─── Delete ─────────────────────────────────────────────

export async function deleteProjectAction(
  projectId: string,
  companyId: string
): Promise<ProjectState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Non autorisé." };

  const membership = await getMembership(session.user.id, companyId);
  if (!membership) return { error: "Accès refusé." };

  const existing = await prisma.project.findUnique({ where: { id: projectId } });
  if (!existing || existing.companyId !== companyId) return { error: "Projet introuvable." };

  await prisma.project.delete({ where: { id: projectId } });

  revalidatePath(`/${companyId}/projects`);
  return { success: true };
}

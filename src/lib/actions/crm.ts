"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ClientStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export type CrmState = { error?: string; success?: boolean } | null;

const VALID_STATUSES = Object.values(ClientStatus);

export async function createClientAction(
  _prevState: CrmState,
  formData: FormData
): Promise<CrmState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Non autorisé." };

  const companyId = (formData.get("companyId") as string)?.trim();
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim() || null;
  const company = (formData.get("company") as string)?.trim() || null;
  const rawStatus = formData.get("status") as string;
  const status = VALID_STATUSES.includes(rawStatus as ClientStatus)
    ? (rawStatus as ClientStatus)
    : ClientStatus.LEAD;

  if (!companyId) return { error: "Workspace manquant." };
  if (!name) return { error: "Le nom du client est requis." };

  const membership = await prisma.companyMember.findUnique({
    where: { userId_companyId: { userId: session.user.id, companyId } },
  });
  if (!membership) return { error: "Accès refusé à ce workspace." };

  await prisma.client.create({
    data: {
      name,
      email: email ?? undefined,
      company: company ?? undefined,
      status,
      companyId,
    },
  });

  revalidatePath(`/${companyId}/clients`);
  revalidatePath(`/${companyId}/dashboard`);
  return { success: true };
}

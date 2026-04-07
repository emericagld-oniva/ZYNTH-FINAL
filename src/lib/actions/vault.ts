"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encrypt, decrypt } from "@/lib/crypto";
import { revalidatePath } from "next/cache";

export type VaultState = { error?: string; success?: boolean } | null;
export type DecryptResult = { password?: string; error?: string };

// ─── Folders ───────────────────────────────────────────

export async function createFolderAction(
  _prev: VaultState,
  formData: FormData
): Promise<VaultState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Non autorisé." };

  const companyId = (formData.get("companyId") as string)?.trim();
  const name = (formData.get("name") as string)?.trim();

  if (!companyId) return { error: "Workspace manquant." };
  if (!name) return { error: "Le nom du dossier est requis." };

  const membership = await prisma.companyMember.findUnique({
    where: { userId_companyId: { userId: session.user.id, companyId } },
  });
  if (!membership) return { error: "Accès refusé." };

  await prisma.vaultFolder.create({ data: { name, companyId } });

  revalidatePath(`/${companyId}/vault`);
  return { success: true };
}

// ─── Items ─────────────────────────────────────────────

export async function createVaultItemAction(
  _prev: VaultState,
  formData: FormData
): Promise<VaultState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Non autorisé." };

  const companyId = (formData.get("companyId") as string)?.trim();
  const title = (formData.get("title") as string)?.trim();
  const username = (formData.get("username") as string)?.trim() || null;
  const password = formData.get("password") as string;
  const url = (formData.get("url") as string)?.trim() || null;
  const notes = (formData.get("notes") as string)?.trim() || null;
  const folderId = (formData.get("folderId") as string)?.trim() || null;

  if (!companyId) return { error: "Workspace manquant." };
  if (!title) return { error: "Le titre est requis." };
  if (!password) return { error: "Le mot de passe est requis." };

  const membership = await prisma.companyMember.findUnique({
    where: { userId_companyId: { userId: session.user.id, companyId } },
  });
  if (!membership) return { error: "Accès refusé." };

  await prisma.vaultItem.create({
    data: {
      title,
      username,
      encryptedPassword: encrypt(password),
      url,
      notes,
      folderId: folderId || null,
      companyId,
      createdById: membership.id,
    },
  });

  revalidatePath(`/${companyId}/vault`);
  return { success: true };
}

// ─── Decrypt ────────────────────────────────────────────

export async function decryptPasswordAction(itemId: string): Promise<DecryptResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Non autorisé." };

  const item = await prisma.vaultItem.findUnique({ where: { id: itemId } });
  if (!item) return { error: "Élément introuvable." };

  const membership = await prisma.companyMember.findUnique({
    where: {
      userId_companyId: { userId: session.user.id, companyId: item.companyId },
    },
  });
  if (!membership) return { error: "Accès refusé." };

  try {
    return { password: decrypt(item.encryptedPassword) };
  } catch {
    return { error: "Erreur de déchiffrement." };
  }
}

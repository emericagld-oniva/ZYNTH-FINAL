"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export type CompanyState = { error?: string } | null;

export async function createCompanyAction(
  _prevState: CompanyState,
  formData: FormData
): Promise<CompanyState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Non autorisé." };

  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "Le nom de l'entreprise est requis." };

  const company = await prisma.company.create({
    data: {
      name,
      members: {
        create: {
          userId: session.user.id,
          role: "FOUNDER",
        },
      },
    },
  });

  redirect(`/${company.id}/dashboard`);
}

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ClientStatus } from "@prisma/client";
import { redirect } from "next/navigation";
import ClientsShell from "./shell";

export default async function ClientsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const clients = await prisma.client.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return <ClientsShell clients={clients} />;
}

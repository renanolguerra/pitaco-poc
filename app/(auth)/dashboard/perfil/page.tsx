import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import PerfilClient from "@/components/dashboard/PerfilClient";

export default async function PerfilPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { empresa: true },
  });

  if (!user) redirect("/login");

  return <PerfilClient user={user} />;
}

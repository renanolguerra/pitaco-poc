import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import EmpresaDashboard from "@/components/dashboard/EmpresaDashboard";
import PitaqueiroDashboard from "@/components/dashboard/PitaqueiroDashboard";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { empresa: { include: { roadmaps: true } } },
  });

  if (!user) redirect("/login");

  if (user.userType === "EMPRESA") {
    return <EmpresaDashboard user={user} />;
  }

  return <PitaqueiroDashboard userId={user.id} />;
}

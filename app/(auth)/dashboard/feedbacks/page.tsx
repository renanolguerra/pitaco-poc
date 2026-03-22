import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import FeedbacksPanel from "@/components/dashboard/FeedbacksPanel";

export default async function FeedbacksPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const empresa = await db.empresa.findUnique({
    where: { userId: session.user.id },
    include: { roadmaps: true },
  });

  if (!empresa) redirect("/dashboard");

  return <FeedbacksPanel empresa={empresa} />;
}

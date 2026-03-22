import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import RoadmapView from "@/components/roadmap/RoadmapView";

export default async function RoadmapPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/login");

  const roadmap = await db.roadmap.findUnique({
    where: { id: params.id },
    include: {
      features: { orderBy: { ordem: "asc" } },
      empresa: { select: { userId: true, nome: true } },
    },
  });

  if (!roadmap) redirect("/dashboard");

  const isOwner = roadmap.empresa.userId === session.user.id;
  if (!isOwner && !roadmap.publicado) redirect("/dashboard");

  return <RoadmapView roadmap={roadmap} isOwner={isOwner} userId={user.id} />;
}

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

async function getOwnedRoadmap(roadmapId: string, userId: string) {
  const empresa = await db.empresa.findUnique({ where: { userId } });
  if (!empresa) return null;
  return db.roadmap.findFirst({ where: { id: roadmapId, empresaId: empresa.id } });
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const roadmap = await db.roadmap.findUnique({
    where: { id: params.id },
    include: {
      features: { orderBy: { ordem: "asc" } },
      empresa: { select: { userId: true } },
    },
  });

  if (!roadmap) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Only empresa owner OR any pitaqueiro (if published) can view
  const isOwner = roadmap.empresa.userId === session.user.id;
  if (!isOwner && !roadmap.publicado) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(roadmap);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const roadmap = await getOwnedRoadmap(params.id, session.user.id);
  if (!roadmap) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const updated = await db.roadmap.update({ where: { id: params.id }, data: body });
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const roadmap = await getOwnedRoadmap(params.id, session.user.id);
  if (!roadmap) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await db.roadmap.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

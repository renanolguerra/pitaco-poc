import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

async function getFeatureWithAccess(featureId: string, userId: string) {
  const feature = await db.feature.findUnique({
    where: { id: featureId },
    include: { roadmap: { include: { empresa: true } } },
  });
  if (!feature) return { feature: null, isOwner: false };
  const isOwner = feature.roadmap.empresa.userId === userId;
  return { feature, isOwner };
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { feature, isOwner } = await getFeatureWithAccess(params.id, session.user.id);
  if (!feature || !isOwner) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();

  // If titulo or descricao changed, reset likes/dislikes and delete comments
  const titleChanged = body.titulo !== undefined && body.titulo !== feature.titulo;
  const descChanged = body.descricao !== undefined && body.descricao !== feature.descricao;

  if (titleChanged || descChanged) {
    await db.comentario.deleteMany({ where: { featureId: params.id } });
    body.likes = 0;
    body.dislikes = 0;
  }

  if (body.dataInicio) body.dataInicio = new Date(body.dataInicio);
  if (body.dataFim) body.dataFim = new Date(body.dataFim);

  const updated = await db.feature.update({ where: { id: params.id }, data: body });
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { feature, isOwner } = await getFeatureWithAccess(params.id, session.user.id);
  if (!feature || !isOwner) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await db.feature.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const comentario = await db.comentario.findUnique({
    where: { id: params.id },
    include: { feature: { include: { roadmap: { include: { empresa: true } } } } },
  });

  if (!comentario) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isAuthor = comentario.autorId === session.user.id;
  const isEmpresaOwner = comentario.feature.roadmap.empresa.userId === session.user.id;

  if (!isAuthor && !isEmpresaOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.comentario.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}

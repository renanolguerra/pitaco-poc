import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({ tipo: z.enum(["UP", "DOWN"]) });

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const comentario = await db.comentario.findUnique({ where: { id: params.id } });
  if (!comentario) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Cannot vote on own comment
  if (comentario.autorId === session.user.id) {
    return NextResponse.json({ error: "Cannot vote on own comment" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const existing = await db.votoComentario.findUnique({
    where: { comentarioId_usuarioId: { comentarioId: params.id, usuarioId: session.user.id } },
  });

  if (existing) {
    if (existing.tipo === parsed.data.tipo) {
      // Remove vote
      await db.votoComentario.delete({ where: { id: existing.id } });
      await db.comentario.update({
        where: { id: params.id },
        data: parsed.data.tipo === "UP" ? { upvotes: { decrement: 1 } } : { downvotes: { decrement: 1 } },
      });
    } else {
      // Change vote
      await db.votoComentario.update({ where: { id: existing.id }, data: { tipo: parsed.data.tipo } });
      if (parsed.data.tipo === "UP") {
        await db.comentario.update({ where: { id: params.id }, data: { upvotes: { increment: 1 }, downvotes: { decrement: 1 } } });
      } else {
        await db.comentario.update({ where: { id: params.id }, data: { downvotes: { increment: 1 }, upvotes: { decrement: 1 } } });
      }
    }
  } else {
    await db.votoComentario.create({ data: { comentarioId: params.id, usuarioId: session.user.id, tipo: parsed.data.tipo } });
    await db.comentario.update({
      where: { id: params.id },
      data: parsed.data.tipo === "UP" ? { upvotes: { increment: 1 } } : { downvotes: { increment: 1 } },
    });
  }

  const updated = await db.comentario.findUnique({
    where: { id: params.id },
    include: { autor: { select: { id: true, name: true, username: true, avatarUrl: true, image: true } } },
  });

  return NextResponse.json(updated);
}

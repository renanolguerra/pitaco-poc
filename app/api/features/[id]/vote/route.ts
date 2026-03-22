import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({ tipo: z.enum(["like", "dislike"]) });

/** GET — retorna o voto atual do usuário na feature */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ userVote: null });

  const voto = await db.votoFeature.findUnique({
    where: { featureId_usuarioId: { featureId: params.id, usuarioId: session.user.id } },
  });

  const feature = await db.feature.findUnique({ where: { id: params.id }, select: { likes: true, dislikes: true } });

  return NextResponse.json({
    userVote: voto ? (voto.tipo === "UP" ? "like" : "dislike") : null,
    likes: feature?.likes ?? 0,
    dislikes: feature?.dislikes ?? 0,
  });
}

/** POST — vota (ou desfaz/troca voto) uma vez por usuário */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const feature = await db.feature.findUnique({ where: { id: params.id } });
  if (!feature) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const novaTipo = parsed.data.tipo === "like" ? "UP" : "DOWN";

  const existing = await db.votoFeature.findUnique({
    where: { featureId_usuarioId: { featureId: params.id, usuarioId: session.user.id } },
  });

  if (existing) {
    if (existing.tipo === novaTipo) {
      // Desfaz voto (toggle off)
      await db.votoFeature.delete({ where: { id: existing.id } });
      await db.feature.update({
        where: { id: params.id },
        data: novaTipo === "UP" ? { likes: { decrement: 1 } } : { dislikes: { decrement: 1 } },
      });
    } else {
      // Troca de lado (like ↔ dislike)
      await db.votoFeature.update({ where: { id: existing.id }, data: { tipo: novaTipo } });
      if (novaTipo === "UP") {
        await db.feature.update({ where: { id: params.id }, data: { likes: { increment: 1 }, dislikes: { decrement: 1 } } });
      } else {
        await db.feature.update({ where: { id: params.id }, data: { dislikes: { increment: 1 }, likes: { decrement: 1 } } });
      }
    }
  } else {
    // Novo voto
    await db.votoFeature.create({ data: { featureId: params.id, usuarioId: session.user.id, tipo: novaTipo } });
    await db.feature.update({
      where: { id: params.id },
      data: novaTipo === "UP" ? { likes: { increment: 1 } } : { dislikes: { increment: 1 } },
    });
  }

  const updated = await db.feature.findUnique({ where: { id: params.id } });
  const voto = await db.votoFeature.findUnique({
    where: { featureId_usuarioId: { featureId: params.id, usuarioId: session.user.id } },
  });

  return NextResponse.json({
    ...updated,
    userVote: voto ? (voto.tipo === "UP" ? "like" : "dislike") : null,
  });
}

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { createComentarioSchema } from "@/lib/validations";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const featureId = searchParams.get("featureId");
  if (!featureId) return NextResponse.json({ error: "featureId required" }, { status: 400 });

  const comentarios = await db.comentario.findMany({
    where: { featureId },
    include: { autor: { select: { id: true, name: true, username: true, avatarUrl: true, image: true } } },
    orderBy: [{ upvotes: "desc" }, { createdAt: "asc" }],
  });

  return NextResponse.json(comentarios);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createComentarioSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const comentario = await db.comentario.create({
    data: { featureId: parsed.data.featureId, autorId: session.user.id, texto: parsed.data.texto },
    include: { autor: { select: { id: true, name: true, username: true, avatarUrl: true, image: true } } },
  });

  return NextResponse.json(comentario, { status: 201 });
}

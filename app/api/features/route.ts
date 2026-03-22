import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { createFeatureSchema } from "@/lib/validations";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createFeatureSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  // Verify ownership
  const roadmap = await db.roadmap.findUnique({
    where: { id: parsed.data.roadmapId },
    include: { empresa: true },
  });
  if (!roadmap || roadmap.empresa.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const feature = await db.feature.create({
    data: {
      roadmapId: parsed.data.roadmapId,
      titulo: parsed.data.titulo,
      descricao: parsed.data.descricao,
      dataInicio: parsed.data.dataInicio ? new Date(parsed.data.dataInicio) : undefined,
      dataFim: parsed.data.dataFim ? new Date(parsed.data.dataFim) : undefined,
      status: parsed.data.status,
      comentario: parsed.data.comentario,
      ordem: parsed.data.ordem,
    },
  });

  return NextResponse.json(feature, { status: 201 });
}

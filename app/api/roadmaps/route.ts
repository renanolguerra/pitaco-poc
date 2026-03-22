import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { createRoadmapSchema } from "@/lib/validations";
import { PLAN_LIMITS } from "@/lib/subscription";
import type { Plan } from "@prisma/client";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const empresa = await db.empresa.findUnique({ where: { userId: session.user.id } });
  if (!empresa) return NextResponse.json([]);

  const roadmaps = await db.roadmap.findMany({
    where: { empresaId: empresa.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(roadmaps);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const empresa = await db.empresa.findUnique({ where: { userId: session.user.id } });
  if (!empresa) return NextResponse.json({ error: "Empresa not found" }, { status: 404 });

  const limit = PLAN_LIMITS[user.plan as Plan].roadmaps;
  const count = await db.roadmap.count({ where: { empresaId: empresa.id } });
  if (count >= limit) {
    return NextResponse.json({ error: "Plan limit reached" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createRoadmapSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const roadmap = await db.roadmap.create({
    data: { empresaId: empresa.id, nome: parsed.data.nome },
  });

  return NextResponse.json(roadmap, { status: 201 });
}

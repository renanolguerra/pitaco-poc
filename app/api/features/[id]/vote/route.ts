import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({ tipo: z.enum(["like", "dislike"]) });

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const feature = await db.feature.findUnique({ where: { id: params.id } });
  if (!feature) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (parsed.data.tipo === "like") {
    await db.feature.update({ where: { id: params.id }, data: { likes: { increment: 1 } } });
  } else {
    await db.feature.update({ where: { id: params.id }, data: { dislikes: { increment: 1 } } });
  }

  const updated = await db.feature.findUnique({ where: { id: params.id } });
  return NextResponse.json(updated);
}

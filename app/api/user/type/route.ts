import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({ userType: z.enum(["EMPRESA", "PITAQUEIRO"]) });

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const { userType } = parsed.data;

  await db.user.update({
    where: { id: session.user.id },
    data: { userType },
  });

  // Create empresa profile if EMPRESA
  if (userType === "EMPRESA") {
    const existing = await db.empresa.findUnique({ where: { userId: session.user.id } });
    if (!existing) {
      await db.empresa.create({
        data: { userId: session.user.id, nome: session.user.name ?? "Minha Empresa" },
      });
    }
  }

  return NextResponse.json({ ok: true });
}

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { updateEmpresaSchema } from "@/lib/validations";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = updateEmpresaSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const empresa = await db.empresa.findUnique({ where: { userId: session.user.id } });
  if (!empresa) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await db.empresa.update({
    where: { id: empresa.id },
    data: { nome: parsed.data.nome, logoUrl: parsed.data.logoUrl || null },
  });

  return NextResponse.json(updated);
}

import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";

  const empresas = await db.empresa.findMany({
    where: q ? { nome: { contains: q, mode: "insensitive" } } : undefined,
    select: { id: true, nome: true, logoUrl: true },
    orderBy: { nome: "asc" },
    take: 50,
  });

  return NextResponse.json(empresas);
}

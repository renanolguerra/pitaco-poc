import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { updateUserSchema } from "@/lib/validations";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = updateUserSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  // Check username uniqueness
  if (parsed.data.username) {
    const existing = await db.user.findFirst({
      where: { username: parsed.data.username, NOT: { id: session.user.id } },
    });
    if (existing) return NextResponse.json({ error: "Username já em uso" }, { status: 409 });
  }

  const updated = await db.user.update({
    where: { id: session.user.id },
    data: { username: parsed.data.username, avatarUrl: parsed.data.avatarUrl || null },
  });

  return NextResponse.json(updated);
}

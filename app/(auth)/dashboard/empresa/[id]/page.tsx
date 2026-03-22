import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import AvatarImg from "@/components/ui/AvatarImg";

export default async function EmpresaPublicPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const empresa = await db.empresa.findUnique({
    where: { id: params.id },
    include: {
      roadmaps: {
        where: { publicado: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!empresa) redirect("/dashboard");

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <AvatarImg src={empresa.logoUrl} alt={empresa.nome} size={64} fallback="🏢" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">{empresa.nome}</h1>
          <p className="text-sm text-muted-foreground">{empresa.roadmaps.length} roadmap{empresa.roadmaps.length !== 1 ? "s" : ""} publicado{empresa.roadmaps.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {empresa.roadmaps.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <div className="text-4xl mb-4">📋</div>
          <p>Nenhum roadmap publicado ainda.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {empresa.roadmaps.map(r => (
            <Link
              key={r.id}
              href={`/dashboard/roadmap/${r.id}`}
              className="border border-border rounded-xl p-4 bg-card hover:shadow-md transition-shadow flex items-center justify-between"
            >
              <span className="font-medium text-foreground">{r.nome}</span>
              <span className="text-sm text-primary">Ver roadmap →</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

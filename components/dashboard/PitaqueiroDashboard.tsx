"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface Props { userId: string; }

export default function PitaqueiroDashboard({ userId }: Props) {
  const [search, setSearch] = useState("");

  const { data: empresas = [] } = useQuery({
    queryKey: ["empresas", search],
    queryFn: async () => {
      const res = await fetch(`/api/empresas?q=${encodeURIComponent(search)}`);
      return res.json();
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Explorar Empresas</h1>
      <div className="mb-6">
        <input
          className="border border-border rounded-lg px-4 py-2 text-sm w-full max-w-sm"
          placeholder="Pesquisar empresas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {empresas.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <div className="text-4xl mb-4">🔍</div>
          <p>Nenhuma empresa encontrada.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {empresas.map((e: { id: string; nome: string; logoUrl?: string }) => (
            <Link
              key={e.id}
              href={`/dashboard/empresa/${e.id}`}
              className="border border-border rounded-xl p-4 flex flex-col items-center gap-3 hover:shadow-md transition-shadow bg-card"
            >
              {e.logoUrl ? (
                <Image src={e.logoUrl} alt={e.nome} width={48} height={48} className="rounded-full object-cover w-12 h-12" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">🏢</div>
              )}
              <span className="text-sm font-medium text-foreground text-center">{e.nome}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import PaywallGate from "@/components/paywall/PaywallGate";
import { PLAN_LIMITS } from "@/lib/subscription";
import type { User, Plan } from "@prisma/client";

interface Props {
  user: User & {
    empresa: {
      id: string;
      nome: string;
      roadmaps: Array<{ id: string; nome: string; publicado: boolean; createdAt: Date }>;
    } | null;
  };
}

export default function EmpresaDashboard({ user }: Props) {
  const qc = useQueryClient();
  const [newName, setNewName] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const { data: roadmaps = [] } = useQuery({
    queryKey: ["roadmaps"],
    queryFn: async () => {
      const res = await fetch("/api/roadmaps");
      return res.json();
    },
    initialData: user.empresa?.roadmaps ?? [],
  });

  const limit = PLAN_LIMITS[user.plan as Plan].roadmaps;
  const atLimit = roadmaps.length >= limit;

  const createMutation = useMutation({
    mutationFn: async (nome: string) => {
      const res = await fetch("/api/roadmaps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["roadmaps"] });
      setNewName("");
      setShowCreate(false);
      toast.success("Roadmap criado!");
    },
    onError: () => toast.error("Erro ao criar roadmap"),
  });

  const togglePublish = useMutation({
    mutationFn: async ({ id, publicado }: { id: string; publicado: boolean }) => {
      const res = await fetch(`/api/roadmaps/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicado }),
      });
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["roadmaps"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/roadmaps/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["roadmaps"] });
      toast.success("Roadmap deletado");
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Meus Roadmaps</h1>
        <PaywallGate resource="roadmaps" blocked={atLimit}>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            + Novo roadmap
          </button>
        </PaywallGate>
      </div>

      {showCreate && (
        <div className="mb-6 p-4 border border-border rounded-xl bg-secondary">
          <input
            className="border border-border rounded-lg px-3 py-2 text-sm w-full max-w-sm mr-2"
            placeholder="Nome do roadmap"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && newName && createMutation.mutate(newName)}
          />
          <button
            onClick={() => newName && createMutation.mutate(newName)}
            disabled={!newName || createMutation.isPending}
            className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50"
          >
            Criar
          </button>
          <button onClick={() => setShowCreate(false)} className="ml-2 text-sm text-muted-foreground">Cancelar</button>
        </div>
      )}

      {roadmaps.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <div className="text-4xl mb-4">📋</div>
          <p>Nenhum roadmap criado ainda.</p>
          <button onClick={() => setShowCreate(true)} className="mt-4 text-primary hover:underline text-sm">
            Criar meu primeiro roadmap
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {roadmaps.map((r: { id: string; nome: string; publicado: boolean }) => (
            <div key={r.id} className="border border-border rounded-xl p-4 flex items-center justify-between bg-card hover:shadow-sm transition-shadow">
              <div>
                <Link href={`/dashboard/roadmap/${r.id}`} className="font-semibold text-foreground hover:text-primary transition-colors">
                  {r.nome}
                </Link>
                <span className={`ml-3 text-xs px-2 py-0.5 rounded-full ${r.publicado ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                  {r.publicado ? "Publicado" : "Rascunho"}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (r.publicado) {
                      togglePublish.mutate({ id: r.id, publicado: false });
                    } else {
                      if (confirm("Publicar este roadmap? Ele ficará visível para todos os usuários.")) {
                        togglePublish.mutate({ id: r.id, publicado: true });
                      }
                    }
                  }}
                  className="text-xs px-3 py-1.5 border border-border rounded-lg hover:bg-secondary transition-colors"
                >
                  {r.publicado ? "Despublicar" : "Publicar"}
                </button>
                <button
                  onClick={() => {
                    if (confirm("Deletar este roadmap?")) deleteMutation.mutate(r.id);
                  }}
                  className="text-xs px-3 py-1.5 text-destructive border border-destructive/30 rounded-lg hover:bg-destructive/5 transition-colors"
                >
                  Deletar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

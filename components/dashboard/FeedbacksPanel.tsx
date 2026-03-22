"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import type { Roadmap } from "@prisma/client";

interface Props {
  empresa: { id: string; roadmaps: Roadmap[] };
}

export default function FeedbacksPanel({ empresa }: Props) {
  const qc = useQueryClient();
  const [selectedRoadmapId, setSelectedRoadmapId] = useState(empresa.roadmaps[0]?.id ?? "");

  const { data } = useQuery({
    queryKey: ["roadmap", selectedRoadmapId, "features"],
    queryFn: async () => {
      if (!selectedRoadmapId) return { features: [] };
      const res = await fetch(`/api/roadmaps/${selectedRoadmapId}`);
      return res.json();
    },
    enabled: !!selectedRoadmapId,
  });

  const { data: comentariosByFeature = {} } = useQuery({
    queryKey: ["feedbacks-comentarios", selectedRoadmapId],
    queryFn: async () => {
      if (!selectedRoadmapId || !data?.features?.length) return {};
      const map: Record<string, any[]> = {};
      await Promise.all(
        data.features.map(async (f: any) => {
          const res = await fetch(`/api/comentarios?featureId=${f.id}`);
          map[f.id] = await res.json();
        })
      );
      return map;
    },
    enabled: !!selectedRoadmapId && !!data?.features?.length,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/comentarios/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["feedbacks-comentarios"] });
      toast.success("Comentário deletado");
    },
  });

  const features = data?.features ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Painel de Feedbacks</h1>
        <select
          className="border border-border rounded-lg px-3 py-2 text-sm"
          value={selectedRoadmapId}
          onChange={e => setSelectedRoadmapId(e.target.value)}
        >
          {empresa.roadmaps.map(r => (
            <option key={r.id} value={r.id}>{r.nome}</option>
          ))}
        </select>
      </div>

      {features.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <div className="text-4xl mb-4">📊</div>
          <p>Nenhuma feature neste roadmap.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {features.map((feature: any) => {
            const comentarios = comentariosByFeature[feature.id] ?? [];
            const total = feature.likes + feature.dislikes;
            const approval = total > 0 ? Math.round((feature.likes / total) * 100) : null;

            return (
              <div key={feature.id} className="border border-border rounded-xl p-4 bg-card">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-foreground">{feature.titulo}</h3>
                  <div className="flex gap-4 text-sm">
                    <span className="text-primary">👍 {feature.likes}</span>
                    <span className="text-destructive">👎 {feature.dislikes}</span>
                    <span className="text-muted-foreground">💬 {comentarios.length}</span>
                    {approval !== null && (
                      <span className="font-medium">{approval}% aprovação</span>
                    )}
                  </div>
                </div>

                {comentarios.length > 0 && (
                  <div className="space-y-2">
                    {comentarios.map((c: any) => (
                      <div key={c.id} className="flex items-start justify-between gap-2 text-sm border border-border rounded-lg p-2">
                        <div>
                          <span className="font-medium text-xs">{c.autor.username ?? c.autor.name}</span>
                          <span className="text-muted-foreground text-xs ml-2">{new Date(c.createdAt).toLocaleDateString("pt-BR")}</span>
                          <p className="text-foreground mt-0.5">{c.texto}</p>
                        </div>
                        <button
                          onClick={() => deleteMutation.mutate(c.id)}
                          className="text-xs text-destructive hover:underline shrink-0"
                        >
                          Deletar
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { Roadmap } from "@prisma/client";

interface Props {
  empresa: { id: string; roadmaps: Roadmap[] };
}

// ─── Drawer de comentários ────────────────────────────────────────────────────
interface DrawerFeature {
  id: string;
  titulo: string;
  descricao?: string | null;
  likes: number;
  dislikes: number;
}

function CommentsDrawer({
  feature,
  onClose,
}: {
  feature: DrawerFeature;
  onClose: () => void;
}) {
  const qc = useQueryClient();

  const { data: comentarios = [] } = useQuery({
    queryKey: ["comentarios", feature.id],
    queryFn: async () => {
      const res = await fetch(`/api/comentarios?featureId=${feature.id}`);
      const data: any[] = await res.json();
      // Ordenar por saldo (upvotes - downvotes) desc
      return data.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/comentarios/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["comentarios", feature.id] });
      toast.success("Comentário deletado");
    },
  });

  // Fechar com Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const saldo = feature.likes - feature.dislikes;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-card border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-border">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h2 className="font-bold text-foreground text-base leading-snug flex-1 min-w-0">
              {feature.titulo}
            </h2>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground text-xl leading-none shrink-0"
            >
              ✕
            </button>
          </div>

          {feature.descricao && (
            <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
              {feature.descricao}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm">
            <span className="text-primary font-medium">👍 {feature.likes}</span>
            <span className="text-destructive font-medium">👎 {feature.dislikes}</span>
            <span
              className={`font-semibold ${saldo >= 0 ? "text-green-600" : "text-red-500"}`}
            >
              Saldo: {saldo > 0 ? "+" : ""}{saldo}
            </span>
            <span className="text-muted-foreground ml-auto">
              💬 {comentarios.length} comentário{comentarios.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Comment list — scrollable */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {comentarios.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <div className="text-3xl mb-3">💬</div>
              <p className="text-sm">Nenhum comentário ainda.</p>
            </div>
          ) : (
            comentarios.map((c: any) => {
              const saldoC = c.upvotes - c.downvotes;
              return (
                <div key={c.id} className="border border-border rounded-xl p-3 bg-background">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                        {(c.autor.username ?? c.autor.name ?? "?")[0].toUpperCase()}
                      </div>
                      <span className="text-xs font-medium">{c.autor.username ?? c.autor.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(c.createdAt).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                          saldoC >= 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
                        }`}
                      >
                        {saldoC > 0 ? "+" : ""}{saldoC}
                      </span>
                      <button
                        onClick={() => deleteMutation.mutate(c.id)}
                        className="text-xs text-destructive hover:underline"
                      >
                        Deletar
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{c.texto}</p>
                  <div className="flex gap-3 mt-1.5 text-xs text-muted-foreground">
                    <span>▲ {c.upvotes}</span>
                    <span>▼ {c.downvotes}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}

// ─── Painel principal ─────────────────────────────────────────────────────────
export default function FeedbacksPanel({ empresa }: Props) {
  const [selectedRoadmapId, setSelectedRoadmapId] = useState(empresa.roadmaps[0]?.id ?? "");
  const [drawerFeature, setDrawerFeature] = useState<DrawerFeature | null>(null);

  const { data } = useQuery({
    queryKey: ["feedbacks-panel", selectedRoadmapId],
    queryFn: async () => {
      if (!selectedRoadmapId) return { features: [] };
      const res = await fetch(`/api/roadmaps/${selectedRoadmapId}`);
      return res.json();
    },
    enabled: !!selectedRoadmapId,
  });

  const features: any[] = data?.features ?? [];

  return (
    <div>
      {/* Drawer */}
      {drawerFeature && (
        <CommentsDrawer
          feature={drawerFeature}
          onClose={() => setDrawerFeature(null)}
        />
      )}

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-foreground">Painel de Feedbacks</h1>
        {empresa.roadmaps.length > 1 && (
          <select
            className="border border-border rounded-lg px-3 py-2 text-sm"
            value={selectedRoadmapId}
            onChange={e => setSelectedRoadmapId(e.target.value)}
          >
            {empresa.roadmaps.map(r => (
              <option key={r.id} value={r.id}>{r.nome}</option>
            ))}
          </select>
        )}
      </div>

      {features.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <div className="text-4xl mb-4">📊</div>
          <p>Nenhuma feature neste roadmap.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {features.map((feature: any) => {
            const total = feature.likes + feature.dislikes;
            const approval = total > 0 ? Math.round((feature.likes / total) * 100) : null;
            const saldo = feature.likes - feature.dislikes;

            return (
              <div
                key={feature.id}
                className="border border-border rounded-xl p-4 bg-card"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{feature.titulo}</h3>
                    {feature.descricao && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{feature.descricao}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-sm shrink-0 flex-wrap">
                    <span className="text-primary">👍 {feature.likes}</span>
                    <span className="text-destructive">👎 {feature.dislikes}</span>
                    <span
                      className={`font-semibold ${saldo >= 0 ? "text-green-600" : "text-red-500"}`}
                    >
                      {saldo > 0 ? "+" : ""}{saldo}
                    </span>
                    {approval !== null && (
                      <span className="text-muted-foreground">{approval}% aprovação</span>
                    )}
                    <button
                      onClick={() =>
                        setDrawerFeature({
                          id: feature.id,
                          titulo: feature.titulo,
                          descricao: feature.descricao,
                          likes: feature.likes,
                          dislikes: feature.dislikes,
                        })
                      }
                      className="px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-secondary transition-colors whitespace-nowrap"
                    >
                      💬 Ver comentários
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

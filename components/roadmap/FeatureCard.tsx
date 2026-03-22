"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Feature } from "@prisma/client";

interface Props {
  feature: Feature;
  isOwner: boolean;
  userId: string;
  roadmapId: string;
  onClick: () => void;
  onDragStart: () => void;
  draggable: boolean;
}

const statusColors: Record<string, string> = {
  PLANEJADO: "bg-blue-100 text-blue-700",
  EM_ANDAMENTO: "bg-yellow-100 text-yellow-700",
  CONCLUIDO: "bg-green-100 text-green-700",
};

const statusLabels: Record<string, string> = {
  PLANEJADO: "Planejado",
  EM_ANDAMENTO: "Em andamento",
  CONCLUIDO: "Concluído",
};

export default function FeatureCard({ feature, isOwner, userId, roadmapId, onClick, onDragStart, draggable }: Props) {
  const qc = useQueryClient();

  const voteMutation = useMutation({
    mutationFn: async (tipo: "like" | "dislike") => {
      const res = await fetch(`/api/features/${feature.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo }),
      });
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["roadmap", roadmapId, "features"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await fetch(`/api/features/${feature.id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["roadmap", roadmapId, "features"] });
      toast.success("Feature deletada");
    },
  });

  return (
    <div
      className="bg-card border border-border rounded-lg p-3 cursor-pointer hover:shadow-sm transition-shadow"
      draggable={draggable}
      onDragStart={onDragStart}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="font-medium text-sm text-foreground line-clamp-2">{feature.titulo}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${statusColors[feature.status]}`}>
          {statusLabels[feature.status]}
        </span>
      </div>

      {feature.descricao && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{feature.descricao}</p>
      )}

      <div className="flex items-center justify-between mt-2">
        <div className="flex gap-3">
          {!isOwner && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); voteMutation.mutate("like"); }}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                👍 {feature.likes}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); voteMutation.mutate("dislike"); }}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                👎 {feature.dislikes}
              </button>
            </>
          )}
          {isOwner && (
            <span className="text-xs text-muted-foreground">👍 {feature.likes} · 👎 {feature.dislikes}</span>
          )}
        </div>

        {isOwner && (
          <button
            onClick={(e) => { e.stopPropagation(); if (confirm("Deletar feature?")) deleteMutation.mutate(); }}
            className="text-xs text-destructive hover:underline"
          >
            Deletar
          </button>
        )}
      </div>
    </div>
  );
}

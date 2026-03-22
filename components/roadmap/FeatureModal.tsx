"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Feature, FeatureStatus } from "@prisma/client";

interface Props {
  roadmapId: string;
  feature?: Feature;
  isOwner?: boolean;
  userId?: string;
  onClose: () => void;
  onSaved: () => void;
}

export default function FeatureModal({ roadmapId, feature, isOwner, userId, onClose, onSaved }: Props) {
  const qc = useQueryClient();
  const isEditing = !!feature;

  const [titulo, setTitulo] = useState(feature?.titulo ?? "");
  const [descricao, setDescricao] = useState(feature?.descricao ?? "");
  const [dataInicio, setDataInicio] = useState(feature?.dataInicio ? new Date(feature.dataInicio).toISOString().split("T")[0] : "");
  const [dataFim, setDataFim] = useState(feature?.dataFim ? new Date(feature.dataFim).toISOString().split("T")[0] : "");
  const [status, setStatus] = useState<FeatureStatus>(feature?.status ?? "PLANEJADO");
  const [comentario, setComentario] = useState(feature?.comentario ?? "");
  const [newComment, setNewComment] = useState("");

  const { data: comentarios = [] } = useQuery({
    queryKey: ["comentarios", feature?.id],
    queryFn: async () => {
      const res = await fetch(`/api/comentarios?featureId=${feature!.id}`);
      return res.json();
    },
    enabled: !!feature?.id,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (isEditing) {
        return fetch(`/api/features/${feature.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ titulo, descricao, dataInicio, dataFim, status, comentario }),
        }).then(r => r.json());
      } else {
        return fetch("/api/features", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roadmapId, titulo, descricao, dataInicio, dataFim, status, comentario }),
        }).then(r => r.json());
      }
    },
    onSuccess: () => { onSaved(); toast.success(isEditing ? "Feature atualizada" : "Feature criada"); },
    onError: () => toast.error("Erro ao salvar"),
  });

  const commentMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/comentarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featureId: feature!.id, texto: newComment }),
      });
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["comentarios", feature?.id] });
      setNewComment("");
      toast.success("Comentário enviado!");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/comentarios/${id}`, { method: "DELETE" });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["comentarios", feature?.id] }),
  });

  const voteMutation = useMutation({
    mutationFn: async ({ id, tipo }: { id: string; tipo: "UP" | "DOWN" }) => {
      const res = await fetch(`/api/comentarios/${id}/votar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo }),
      });
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["comentarios", feature?.id] }),
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center sm:p-4" onClick={onClose}>
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">
              {isEditing ? (isOwner ? "Editar feature" : feature.titulo) : "Nova feature"}
            </h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">✕</button>
          </div>

          {(isOwner || !isEditing) && (
            <div className="space-y-4 mb-6">
              <input
                className="w-full border border-border rounded-lg px-3 py-2 text-sm"
                placeholder="Título *"
                value={titulo}
                onChange={e => setTitulo(e.target.value)}
              />
              <textarea
                className="w-full border border-border rounded-lg px-3 py-2 text-sm resize-none"
                placeholder="Descrição"
                rows={3}
                value={descricao}
                onChange={e => setDescricao(e.target.value)}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Data início</label>
                  <input type="date" className="w-full border border-border rounded-lg px-3 py-2 text-sm" value={dataInicio} onChange={e => setDataInicio(e.target.value)} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Data fim</label>
                  <input type="date" className="w-full border border-border rounded-lg px-3 py-2 text-sm" value={dataFim} onChange={e => setDataFim(e.target.value)} />
                </div>
              </div>
              <select
                className="w-full border border-border rounded-lg px-3 py-2 text-sm"
                value={status}
                onChange={e => setStatus(e.target.value as FeatureStatus)}
              >
                <option value="PLANEJADO">Planejado</option>
                <option value="EM_ANDAMENTO">Em andamento</option>
                <option value="CONCLUIDO">Concluído</option>
              </select>
              <textarea
                className="w-full border border-border rounded-lg px-3 py-2 text-sm resize-none"
                placeholder="Notas internas (opcional)"
                rows={2}
                value={comentario}
                onChange={e => setComentario(e.target.value)}
              />
              <button
                onClick={() => saveMutation.mutate()}
                disabled={!titulo || saveMutation.isPending}
                className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
              >
                {saveMutation.isPending ? "Salvando..." : isEditing ? "Salvar alterações" : "Criar feature"}
              </button>
            </div>
          )}

          {/* Comments section */}
          {isEditing && (
            <div>
              <h3 className="font-semibold text-foreground mb-3">Comentários ({comentarios.length})</h3>
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {comentarios.map((c: any) => (
                  <div key={c.id} className="border border-border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                          {(c.autor.username ?? c.autor.name ?? "?")[0].toUpperCase()}
                        </div>
                        <span className="text-xs font-medium">{c.autor.username ?? c.autor.name}</span>
                        <span className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString("pt-BR")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {userId && userId !== c.autorId && (
                          <>
                            <button onClick={() => voteMutation.mutate({ id: c.id, tipo: "UP" })} className="text-xs text-muted-foreground hover:text-primary">▲ {c.upvotes}</button>
                            <button onClick={() => voteMutation.mutate({ id: c.id, tipo: "DOWN" })} className="text-xs text-muted-foreground hover:text-destructive">▼ {c.downvotes}</button>
                          </>
                        )}
                        {(isOwner || userId === c.autorId) && (
                          <button onClick={() => deleteMutation.mutate(c.id)} className="text-xs text-destructive hover:underline">Deletar</button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-foreground">{c.texto}</p>
                  </div>
                ))}
              </div>
              {userId && (
                <div className="flex gap-2">
                  <input
                    className="flex-1 border border-border rounded-lg px-3 py-2 text-sm"
                    placeholder="Escreva um comentário..."
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && newComment && commentMutation.mutate()}
                  />
                  <button
                    onClick={() => newComment && commentMutation.mutate()}
                    disabled={!newComment || commentMutation.isPending}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50"
                  >
                    Enviar
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

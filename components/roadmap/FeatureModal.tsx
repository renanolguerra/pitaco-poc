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

const STATUS_LABELS: Record<string, string> = {
  PLANEJADO: "Planejado",
  EM_ANDAMENTO: "Em andamento",
  CONCLUIDO: "Concluído",
};

const STATUS_BADGE: Record<string, string> = {
  PLANEJADO: "bg-blue-100 text-blue-700",
  EM_ANDAMENTO: "bg-yellow-100 text-yellow-700",
  CONCLUIDO: "bg-green-100 text-green-700",
};

function fmt(d: Date | string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR");
}

export default function FeatureModal({ roadmapId, feature, isOwner, userId, onClose, onSaved }: Props) {
  const qc = useQueryClient();
  const isEditing = !!feature;
  const [editMode, setEditMode] = useState(!isEditing); // create = always edit mode

  // Form state (for create / edit)
  const [titulo, setTitulo] = useState(feature?.titulo ?? "");
  const [descricao, setDescricao] = useState(feature?.descricao ?? "");
  const [dataInicio, setDataInicio] = useState(
    feature?.dataInicio ? new Date(feature.dataInicio).toISOString().split("T")[0] : ""
  );
  const [dataFim, setDataFim] = useState(
    feature?.dataFim ? new Date(feature.dataFim).toISOString().split("T")[0] : ""
  );
  const [status, setStatus] = useState<FeatureStatus>(feature?.status ?? "PLANEJADO");
  const [comentario, setComentario] = useState(feature?.comentario ?? "");
  const [newComment, setNewComment] = useState("");

  // ── Queries ────────────────────────────────────────────────────────────────
  const { data: comentarios = [] } = useQuery({
    queryKey: ["comentarios", feature?.id],
    queryFn: async () => {
      const res = await fetch(`/api/comentarios?featureId=${feature!.id}`);
      return res.json();
    },
    enabled: !!feature?.id,
  });

  const { data: voteData, refetch: refetchVote } = useQuery({
    queryKey: ["feature-vote", feature?.id],
    queryFn: async () => {
      const res = await fetch(`/api/features/${feature!.id}/vote`);
      return res.json() as Promise<{ userVote: "like" | "dislike" | null; likes: number; dislikes: number }>;
    },
    enabled: !!feature?.id,
  });

  // ── Mutations ──────────────────────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: async () => {
      const url = isEditing ? `/api/features/${feature.id}` : "/api/features";
      const body = isEditing
        ? { titulo, descricao, dataInicio, dataFim, status, comentario }
        : { roadmapId, titulo, descricao, dataInicio, dataFim, status, comentario };
      return fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then(r => r.json());
    },
    onSuccess: () => {
      onSaved();
      toast.success(isEditing ? "Feature atualizada" : "Feature criada");
    },
    onError: () => toast.error("Erro ao salvar"),
  });

  const voteMutation = useMutation({
    mutationFn: async (tipo: "like" | "dislike") => {
      const res = await fetch(`/api/features/${feature!.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo }),
      });
      return res.json();
    },
    onSuccess: () => {
      refetchVote();
      qc.invalidateQueries({ queryKey: ["roadmap", roadmapId, "features"] });
    },
    onError: () => toast.error("Erro ao votar"),
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

  const voteCommentMutation = useMutation({
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

  // ── Derived ────────────────────────────────────────────────────────────────
  const likes = voteData?.likes ?? feature?.likes ?? 0;
  const dislikes = voteData?.dislikes ?? feature?.dislikes ?? 0;
  const userVote = voteData?.userVote ?? null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          {/* ── Header ────────────────────────────────────────────────────── */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex-1 min-w-0">
              {editMode ? (
                <input
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm font-semibold"
                  placeholder="Título *"
                  value={titulo}
                  onChange={e => setTitulo(e.target.value)}
                />
              ) : (
                <h2 className="text-lg font-bold text-foreground leading-snug">{feature?.titulo}</h2>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {isEditing && isOwner && !editMode && (
                <button
                  onClick={() => setEditMode(true)}
                  className="text-xs text-primary hover:underline"
                >
                  Editar
                </button>
              )}
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-lg leading-none">✕</button>
            </div>
          </div>

          {/* ── Info / edit form ──────────────────────────────────────────── */}
          {editMode ? (
            <div className="space-y-4 mb-6">
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
                  <input
                    type="date"
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm"
                    value={dataInicio}
                    onChange={e => setDataInicio(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Data previsão</label>
                  <input
                    type="date"
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm"
                    value={dataFim}
                    onChange={e => setDataFim(e.target.value)}
                  />
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
              {isOwner && (
                <textarea
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm resize-none"
                  placeholder="Notas internas (opcional)"
                  rows={2}
                  value={comentario}
                  onChange={e => setComentario(e.target.value)}
                />
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => saveMutation.mutate()}
                  disabled={!titulo || saveMutation.isPending}
                  className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90 disabled:opacity-50"
                >
                  {saveMutation.isPending ? "Salvando..." : isEditing ? "Salvar alterações" : "Criar feature"}
                </button>
                {isEditing && (
                  <button
                    onClick={() => setEditMode(false)}
                    className="px-4 py-2.5 border border-border rounded-lg text-sm text-muted-foreground hover:bg-secondary"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* ── View mode: feature details ─────────────────────────────── */
            <div className="mb-5 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_BADGE[feature?.status ?? "PLANEJADO"]}`}>
                  {STATUS_LABELS[feature?.status ?? "PLANEJADO"]}
                </span>
                {(feature?.dataInicio || feature?.dataFim) && (
                  <span className="text-xs text-muted-foreground">
                    {fmt(feature?.dataInicio)} → {fmt(feature?.dataFim)}
                  </span>
                )}
              </div>
              {feature?.descricao && (
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.descricao}</p>
              )}
            </div>
          )}

          {/* ── Votes (visible in view mode) ─────────────────────────────── */}
          {isEditing && !editMode && (
            <div className="flex items-center gap-3 mb-5 pb-5 border-b border-border">
              {!isOwner ? (
                <>
                  <button
                    onClick={() => voteMutation.mutate("like")}
                    disabled={voteMutation.isPending}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                      userVote === "like"
                        ? "bg-primary/10 border-primary text-primary"
                        : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                    }`}
                  >
                    👍 <span>{likes}</span>
                  </button>
                  <button
                    onClick={() => voteMutation.mutate("dislike")}
                    disabled={voteMutation.isPending}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                      userVote === "dislike"
                        ? "bg-destructive/10 border-destructive text-destructive"
                        : "border-border text-muted-foreground hover:border-destructive hover:text-destructive"
                    }`}
                  >
                    👎 <span>{dislikes}</span>
                  </button>
                  {userVote && (
                    <span className="text-xs text-muted-foreground">(clique novamente para desfazer)</span>
                  )}
                </>
              ) : (
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>👍 {likes}</span>
                  <span>👎 {dislikes}</span>
                </div>
              )}
            </div>
          )}

          {/* ── Comments section ─────────────────────────────────────────── */}
          {isEditing && (
            <div>
              <h3 className="font-semibold text-foreground mb-3 text-sm">
                Comentários ({comentarios.length})
              </h3>

              {/* Comment list */}
              {comentarios.length > 0 && (
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto pr-1">
                  {comentarios.map((c: any) => {
                    const saldo = c.upvotes - c.downvotes;
                    return (
                      <div key={c.id} className="border border-border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                              {(c.autor.username ?? c.autor.name ?? "?")[0].toUpperCase()}
                            </div>
                            <span className="text-xs font-medium">{c.autor.username ?? c.autor.name}</span>
                            <span className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString("pt-BR")}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* Vote buttons for comments */}
                            {userId && userId !== c.autorId && (
                              <>
                                <button
                                  onClick={() => voteCommentMutation.mutate({ id: c.id, tipo: "UP" })}
                                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                                >
                                  ▲ {c.upvotes}
                                </button>
                                <button
                                  onClick={() => voteCommentMutation.mutate({ id: c.id, tipo: "DOWN" })}
                                  className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                                >
                                  ▼ {c.downvotes}
                                </button>
                              </>
                            )}
                            {userId && userId === c.autorId && (
                              <span className="text-xs text-muted-foreground">saldo: {saldo > 0 ? "+" : ""}{saldo}</span>
                            )}
                            {(isOwner || userId === c.autorId) && (
                              <button
                                onClick={() => deleteMutation.mutate(c.id)}
                                className="text-xs text-destructive hover:underline"
                              >
                                Deletar
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-foreground">{c.texto}</p>
                      </div>
                    );
                  })}
                </div>
              )}

              {comentarios.length === 0 && (
                <p className="text-sm text-muted-foreground mb-4 text-center py-4">
                  Nenhum comentário ainda. Seja o primeiro!
                </p>
              )}

              {/* Add comment */}
              {userId && (
                <div className="flex gap-2">
                  <input
                    className="flex-1 border border-border rounded-lg px-3 py-2 text-sm"
                    placeholder="Escreva um comentário..."
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && newComment.trim() && commentMutation.mutate()}
                  />
                  <button
                    onClick={() => newComment.trim() && commentMutation.mutate()}
                    disabled={!newComment.trim() || commentMutation.isPending}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50 hover:opacity-90"
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

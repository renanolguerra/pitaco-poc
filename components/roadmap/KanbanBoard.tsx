"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { Feature, FeatureStatus } from "@prisma/client";
import FeatureCard from "./FeatureCard";
import FeatureModal from "./FeatureModal";
import { useIsMobile } from "@/hooks/useMediaQuery";

const COLUMNS: { status: FeatureStatus; label: string; color: string }[] = [
  { status: "PLANEJADO",   label: "Planejado",    color: "text-status-planned" },
  { status: "EM_ANDAMENTO", label: "Em andamento", color: "text-status-in-progress" },
  { status: "CONCLUIDO",   label: "Concluído",    color: "text-status-done" },
];

type Filter = FeatureStatus | "TODOS";
const FILTERS: { value: Filter; label: string }[] = [
  { value: "TODOS",        label: "Todos" },
  { value: "PLANEJADO",    label: "Planejado" },
  { value: "EM_ANDAMENTO", label: "Em andamento" },
  { value: "CONCLUIDO",    label: "Concluído" },
];

interface Props {
  roadmapId: string;
  initialFeatures: Feature[];
  isOwner: boolean;
  userId: string;
}

export default function KanbanBoard({ roadmapId, initialFeatures, isOwner, userId }: Props) {
  const qc = useQueryClient();
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FeatureStatus>("PLANEJADO");
  const [filter, setFilter] = useState<Filter>("TODOS");
  const isMobile = useIsMobile();

  const { data: features = initialFeatures } = useQuery<Feature[]>({
    queryKey: ["roadmap", roadmapId, "features"],
    queryFn: async () => {
      const res = await fetch(`/api/roadmaps/${roadmapId}`);
      const data = await res.json();
      return data.features;
    },
    initialData: initialFeatures,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: FeatureStatus }) => {
      const res = await fetch(`/api/features/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["roadmap", roadmapId, "features"] }),
  });

  function handleDragStart(id: string) { setDraggedId(id); }
  function handleDragOver(e: React.DragEvent) { e.preventDefault(); }
  function handleDrop(status: FeatureStatus) {
    if (!draggedId) return;
    updateStatus.mutate({ id: draggedId, status });
    setDraggedId(null);
  }

  // Apply filter: "TODOS" = all features; otherwise only matching status
  const filteredFeatures = filter === "TODOS"
    ? features
    : features.filter(f => f.status === filter);

  const activeCol = COLUMNS.find(c => c.status === activeTab)!;

  return (
    <div>
      {/* ── Toolbar: nova feature + filtro de status ──────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {isOwner && (
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            + Nova feature
          </button>
        )}

        {/* Status filter — desktop only (mobile usa as abas) */}
        <div className="hidden sm:flex bg-secondary rounded-lg p-1 gap-1 text-sm ml-auto">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1 rounded-md font-medium transition-all whitespace-nowrap ${
                filter === f.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Mobile: tabs + coluna única ───────────────────────────────────── */}
      {isMobile && (
        <>
          <div className="flex border border-border rounded-lg overflow-hidden mb-4">
            {COLUMNS.map(col => (
              <button
                key={col.status}
                onClick={() => setActiveTab(col.status)}
                className={`flex-1 py-2 text-xs font-medium transition-colors ${
                  activeTab === col.status
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-secondary text-foreground"
                }`}
              >
                {col.label}
              </button>
            ))}
          </div>
          <div className="bg-secondary rounded-xl p-4 min-h-[300px]">
            <h3 className={`font-semibold text-sm mb-3 ${activeCol.color}`}>{activeCol.label}</h3>
            <div className="space-y-3">
              {filteredFeatures
                .filter(f => f.status === activeTab)
                .map(feature => (
                  <FeatureCard
                    key={feature.id}
                    feature={feature}
                    isOwner={isOwner}
                    userId={userId}
                    roadmapId={roadmapId}
                    onClick={() => setSelectedFeature(feature)}
                    onDragStart={() => {}}
                    draggable={false}
                  />
                ))}
              {filteredFeatures.filter(f => f.status === activeTab).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-10">
                  {filter !== "TODOS" && filter !== activeTab
                    ? "Filtro ativo em outro status"
                    : "Nenhuma feature aqui ainda"}
                </p>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Desktop: 3 colunas ────────────────────────────────────────────── */}
      {!isMobile && (
        <div className="grid grid-cols-3 gap-4">
          {COLUMNS.map(col => (
            <div
              key={col.status}
              className="bg-secondary rounded-xl p-4 min-h-[400px]"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(col.status)}
            >
              <h3 className={`font-semibold text-sm mb-3 ${col.color}`}>
                {col.label}
                <span className="ml-1 text-muted-foreground font-normal">
                  ({filteredFeatures.filter(f => f.status === col.status).length})
                </span>
              </h3>
              <div className="space-y-3">
                {filteredFeatures
                  .filter(f => f.status === col.status)
                  .map(feature => (
                    <FeatureCard
                      key={feature.id}
                      feature={feature}
                      isOwner={isOwner}
                      userId={userId}
                      roadmapId={roadmapId}
                      onClick={() => setSelectedFeature(feature)}
                      onDragStart={() => isOwner && handleDragStart(feature.id)}
                      draggable={isOwner}
                    />
                  ))}
                {filteredFeatures.filter(f => f.status === col.status).length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-8">
                    {filter !== "TODOS" ? "Sem resultados para o filtro" : "Nenhuma feature"}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modais */}
      {showCreate && isOwner && (
        <FeatureModal
          roadmapId={roadmapId}
          onClose={() => setShowCreate(false)}
          onSaved={() => {
            qc.invalidateQueries({ queryKey: ["roadmap", roadmapId, "features"] });
            setShowCreate(false);
          }}
        />
      )}
      {selectedFeature && (
        <FeatureModal
          roadmapId={roadmapId}
          feature={selectedFeature}
          isOwner={isOwner}
          userId={userId}
          onClose={() => setSelectedFeature(null)}
          onSaved={() => {
            qc.invalidateQueries({ queryKey: ["roadmap", roadmapId, "features"] });
            setSelectedFeature(null);
          }}
        />
      )}
    </div>
  );
}

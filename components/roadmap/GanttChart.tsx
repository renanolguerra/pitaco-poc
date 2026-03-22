"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { Feature } from "@prisma/client";
import FeatureModal from "./FeatureModal";

interface Props {
  roadmapId: string;
  initialFeatures: Feature[];
  isOwner: boolean;
}

const statusColors: Record<string, string> = {
  PLANEJADO: "bg-status-planned",
  EM_ANDAMENTO: "bg-status-in-progress",
  CONCLUIDO: "bg-status-done",
};

const statusLabels: Record<string, string> = {
  PLANEJADO: "Planejado",
  EM_ANDAMENTO: "Em andamento",
  CONCLUIDO: "Concluído",
};

export default function GanttChart({ roadmapId, initialFeatures, isOwner }: Props) {
  const qc = useQueryClient();
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const { data: features = initialFeatures } = useQuery<Feature[]>({
    queryKey: ["roadmap", roadmapId, "features"],
    queryFn: async () => {
      const res = await fetch(`/api/roadmaps/${roadmapId}`);
      const data = await res.json();
      return data.features;
    },
    initialData: initialFeatures,
  });

  const featuresWithDates = features.filter(f => f.dataInicio && f.dataFim);

  if (featuresWithDates.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <div className="text-4xl mb-4">📅</div>
        <p className="mb-4">Nenhuma feature com datas definidas.</p>
        {isOwner && (
          <button onClick={() => setShowCreate(true)} className="text-primary hover:underline text-sm">
            Criar feature com datas
          </button>
        )}
        {showCreate && (
          <FeatureModal
            roadmapId={roadmapId}
            onClose={() => setShowCreate(false)}
            onSaved={() => { qc.invalidateQueries({ queryKey: ["roadmap", roadmapId, "features"] }); setShowCreate(false); }}
          />
        )}
      </div>
    );
  }

  const allDates = featuresWithDates.flatMap(f => [new Date(f.dataInicio!), new Date(f.dataFim!)]);
  const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
  const totalDays = Math.max((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24), 1);
  const today = new Date();
  const todayOffset = Math.max(0, Math.min(100, ((today.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) / totalDays * 100));

  return (
    <div>
      {isOwner && (
        <div className="mb-4">
          <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90">
            + Nova feature
          </button>
        </div>
      )}
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Header */}
            <div className="grid grid-cols-[200px_1fr] bg-secondary border-b border-border">
              <div className="p-3 text-xs font-semibold text-muted-foreground">Feature</div>
              <div className="p-3 text-xs font-semibold text-muted-foreground relative">
                <span>{minDate.toLocaleDateString("pt-BR")}</span>
                <span className="absolute right-3">{maxDate.toLocaleDateString("pt-BR")}</span>
              </div>
            </div>
            {/* Rows */}
            <div className="relative">
              {/* Today line */}
              {todayOffset > 0 && todayOffset < 100 && (
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-destructive z-10 pointer-events-none"
                  style={{ left: `calc(200px + ${todayOffset}% * (100% - 200px) / 100)` }}
                />
              )}
              {featuresWithDates.map((feature) => {
                const start = new Date(feature.dataInicio!);
                const end = new Date(feature.dataFim!);
                const left = ((start.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) / totalDays * 100;
                const width = Math.max(1, ((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) / totalDays * 100);

                return (
                  <div key={feature.id} className="grid grid-cols-[200px_1fr] border-b border-border hover:bg-secondary/50 transition-colors">
                    <div
                      className="p-3 text-sm text-foreground truncate cursor-pointer hover:text-primary"
                      onClick={() => setSelectedFeature(feature)}
                    >
                      {feature.titulo}
                    </div>
                    <div className="p-3 relative">
                      <div
                        className={`absolute top-2 h-6 rounded-md cursor-pointer hover:opacity-80 transition-opacity flex items-center px-2 ${statusColors[feature.status]}`}
                        style={{ left: `${left}%`, width: `${width}%`, minWidth: "4px" }}
                        onClick={() => setSelectedFeature(feature)}
                        title={`${feature.titulo} — ${statusLabels[feature.status]}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {selectedFeature && (
        <FeatureModal
          roadmapId={roadmapId}
          feature={selectedFeature}
          isOwner={isOwner}
          onClose={() => setSelectedFeature(null)}
          onSaved={() => { qc.invalidateQueries({ queryKey: ["roadmap", roadmapId, "features"] }); setSelectedFeature(null); }}
        />
      )}
      {showCreate && (
        <FeatureModal
          roadmapId={roadmapId}
          onClose={() => setShowCreate(false)}
          onSaved={() => { qc.invalidateQueries({ queryKey: ["roadmap", roadmapId, "features"] }); setShowCreate(false); }}
        />
      )}
    </div>
  );
}

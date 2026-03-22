"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import type { Feature, FeatureStatus } from "@prisma/client";
import FeatureCard from "./FeatureCard";
import FeatureModal from "./FeatureModal";

const COLUMNS: { status: FeatureStatus; label: string; color: string }[] = [
  { status: "PLANEJADO", label: "Planejado", color: "text-status-planned" },
  { status: "EM_ANDAMENTO", label: "Em andamento", color: "text-status-in-progress" },
  { status: "CONCLUIDO", label: "Concluído", color: "text-status-done" },
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

  return (
    <div>
      {isOwner && (
        <div className="mb-4">
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            + Nova feature
          </button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {COLUMNS.map((col) => (
          <div
            key={col.status}
            className="bg-secondary rounded-xl p-4 min-h-[400px]"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(col.status)}
          >
            <h3 className={`font-semibold text-sm mb-3 ${col.color}`}>{col.label}</h3>
            <div className="space-y-3">
              {features
                .filter((f) => f.status === col.status)
                .map((feature) => (
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
            </div>
          </div>
        ))}
      </div>

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

"use client";

import { useState, useEffect } from "react";
import KanbanBoard from "./KanbanBoard";
import GanttChart from "./GanttChart";
import type { Feature } from "@prisma/client";
import { useIsMobile } from "@/hooks/useMediaQuery";

interface Roadmap {
  id: string;
  nome: string;
  publicado: boolean;
  features: Feature[];
  empresa: { nome: string };
}

interface Props {
  roadmap: Roadmap;
  isOwner: boolean;
  userId: string;
}

export default function RoadmapView({ roadmap, isOwner, userId }: Props) {
  const [view, setView] = useState<"kanban" | "gantt">("kanban");
  const isMobile = useIsMobile();

  // Gantt não disponível em mobile: forçar kanban
  useEffect(() => {
    if (isMobile && view === "gantt") {
      setView("kanban");
    }
  }, [isMobile, view]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">{roadmap.nome}</h1>
          <p className="text-sm text-muted-foreground">{roadmap.empresa.nome}</p>
        </div>

        {/* Toggle Kanban / Gantt — Gantt oculto em mobile */}
        <div className="flex border border-border rounded-lg overflow-hidden self-start sm:self-auto">
          <button
            onClick={() => setView("kanban")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              view === "kanban" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
            }`}
          >
            Kanban
          </button>
          {!isMobile && (
            <button
              onClick={() => setView("gantt")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                view === "gantt" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
              }`}
            >
              Gantt
            </button>
          )}
        </div>
      </div>

      {view === "kanban" ? (
        <KanbanBoard
          roadmapId={roadmap.id}
          initialFeatures={roadmap.features}
          isOwner={isOwner}
          userId={userId}
        />
      ) : (
        <GanttChart
          roadmapId={roadmap.id}
          initialFeatures={roadmap.features}
          isOwner={isOwner}
        />
      )}
    </div>
  );
}

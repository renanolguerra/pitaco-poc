"use client";

import { useState } from "react";
import KanbanBoard from "./KanbanBoard";
import GanttChart from "./GanttChart";
import type { Feature } from "@prisma/client";

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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{roadmap.nome}</h1>
          <p className="text-sm text-muted-foreground">{roadmap.empresa.nome}</p>
        </div>
        <div className="flex border border-border rounded-lg overflow-hidden">
          <button
            onClick={() => setView("kanban")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              view === "kanban" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
            }`}
          >
            Kanban
          </button>
          <button
            onClick={() => setView("gantt")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              view === "gantt" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
            }`}
          >
            Gantt
          </button>
        </div>
      </div>

      {view === "kanban" ? (
        <KanbanBoard roadmapId={roadmap.id} initialFeatures={roadmap.features} isOwner={isOwner} userId={userId} />
      ) : (
        <GanttChart roadmapId={roadmap.id} initialFeatures={roadmap.features} isOwner={isOwner} />
      )}
    </div>
  );
}

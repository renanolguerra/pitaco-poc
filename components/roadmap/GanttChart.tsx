"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useRef, useCallback } from "react";
import type { Feature, FeatureStatus } from "@prisma/client";
import FeatureModal from "./FeatureModal";

type ViewMode = "mensal" | "trimestral" | "anual";

const PX_PER_DAY: Record<ViewMode, number> = {
  mensal: 28,
  trimestral: 9,
  anual: 2.8,
};

const LEFT_COL = 256; // px — fixed feature-name column

const STATUS_COLORS: Record<string, string> = {
  PLANEJADO: "bg-status-planned",
  EM_ANDAMENTO: "bg-status-in-progress",
  CONCLUIDO: "bg-status-done",
};

const STATUS_LABELS: Record<string, string> = {
  PLANEJADO: "Planejado",
  EM_ANDAMENTO: "Em andamento",
  CONCLUIDO: "Concluído",
};

type StatusFilter = FeatureStatus | "TODOS";

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "TODOS",        label: "Todos" },
  { value: "PLANEJADO",    label: "Planejado" },
  { value: "EM_ANDAMENTO", label: "Em andamento" },
  { value: "CONCLUIDO",    label: "Concluído" },
];

interface Props {
  roadmapId: string;
  initialFeatures: Feature[];
  isOwner: boolean;
  userId?: string;
}

interface HoverInfo {
  feature: Feature;
  clientX: number;
  clientY: number;
}

// ─── Period markers ────────────────────────────────────────────────────────────
function getPeriodMarkers(
  minDate: Date,
  maxDate: Date,
  viewMode: ViewMode
): { date: Date; label: string }[] {
  const markers: { date: Date; label: string }[] = [];
  const cursor = new Date(minDate);

  if (viewMode === "mensal") {
    cursor.setDate(1);
    cursor.setMonth(cursor.getMonth() + 1);
    while (cursor <= maxDate) {
      markers.push({
        date: new Date(cursor),
        label: cursor.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
      });
      cursor.setMonth(cursor.getMonth() + 1);
    }
  } else if (viewMode === "trimestral") {
    cursor.setDate(1);
    cursor.setMonth(Math.ceil((cursor.getMonth() + 1) / 3) * 3);
    while (cursor <= maxDate) {
      const q = Math.floor(cursor.getMonth() / 3) + 1;
      markers.push({
        date: new Date(cursor),
        label: `Q${q} ${cursor.getFullYear()}`,
      });
      cursor.setMonth(cursor.getMonth() + 3);
    }
  } else {
    cursor.setDate(1);
    cursor.setMonth(0);
    cursor.setFullYear(cursor.getFullYear() + 1);
    while (cursor <= maxDate) {
      markers.push({
        date: new Date(cursor),
        label: String(cursor.getFullYear()),
      });
      cursor.setFullYear(cursor.getFullYear() + 1);
    }
  }

  return markers;
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────
function GanttTooltip({ info }: { info: HoverInfo }) {
  const f = info.feature;
  const start = new Date(f.dataInicio!).toLocaleDateString("pt-BR");
  const end = new Date(f.dataFim!).toLocaleDateString("pt-BR");

  // Clamp to viewport edges
  const tipW = 230;
  const x = Math.min(info.clientX + 14, window.innerWidth - tipW - 8);
  const y = info.clientY - 12;

  return (
    <div
      className="fixed z-50 pointer-events-none bg-card border border-border rounded-xl shadow-xl p-3 text-sm"
      style={{ left: x, top: y, width: tipW }}
    >
      <p className="font-semibold text-foreground leading-snug mb-1 line-clamp-2">
        {f.titulo}
      </p>
      <p className="text-xs text-muted-foreground mb-2">
        {STATUS_LABELS[f.status]}
      </p>
      <div className="text-xs text-muted-foreground space-y-0.5">
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground/60">Início</span>
          <span className="ml-auto font-medium text-foreground">{start}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground/60">Previsão</span>
          <span className="ml-auto font-medium text-foreground">{end}</span>
        </div>
      </div>
      <div className="flex gap-3 mt-2 pt-2 border-t border-border text-xs">
        <span>👍 <strong>{f.likes}</strong></span>
        <span>👎 <strong>{f.dislikes}</strong></span>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function GanttChart({ roadmapId, initialFeatures, isOwner, userId }: Props) {
  const qc = useQueryClient();
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("mensal");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("TODOS");
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: features = initialFeatures } = useQuery<Feature[]>({
    queryKey: ["roadmap", roadmapId, "features"],
    queryFn: async () => {
      const res = await fetch(`/api/roadmaps/${roadmapId}`);
      const data = await res.json();
      return data.features;
    },
    initialData: initialFeatures,
  });

  const onSaved = useCallback(() => {
    qc.invalidateQueries({ queryKey: ["roadmap", roadmapId, "features"] });
    setSelectedFeature(null);
    setShowCreate(false);
  }, [qc, roadmapId]);

  const featuresWithDates = features
    .filter(f => f.dataInicio && f.dataFim)
    .filter(f => statusFilter === "TODOS" || f.status === statusFilter);

  // ── Empty state ──────────────────────────────────────────────────────────────
  if (featuresWithDates.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <div className="text-4xl mb-4">📅</div>
        <p className="mb-4">Nenhuma feature com datas definidas.</p>
        {isOwner && (
          <button
            onClick={() => setShowCreate(true)}
            className="text-primary hover:underline text-sm"
          >
            Criar feature com datas
          </button>
        )}
        {showCreate && (
          <FeatureModal
            roadmapId={roadmapId}
            onClose={() => setShowCreate(false)}
            onSaved={onSaved}
          />
        )}
      </div>
    );
  }

  // ── Timeline math ────────────────────────────────────────────────────────────
  const pxPerDay = PX_PER_DAY[viewMode];

  const allDates = featuresWithDates.flatMap(f => [
    new Date(f.dataInicio!),
    new Date(f.dataFim!),
  ]);
  const rawMin = new Date(Math.min(...allDates.map(d => d.getTime())));
  const rawMax = new Date(Math.max(...allDates.map(d => d.getTime())));

  // Pad 1 month on each side
  const minDate = new Date(rawMin);
  minDate.setDate(1);
  minDate.setMonth(minDate.getMonth() - 1);

  const maxDate = new Date(rawMax);
  maxDate.setDate(1);
  maxDate.setMonth(maxDate.getMonth() + 2);

  const totalDays =
    (maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24);
  const totalWidth = Math.round(totalDays * pxPerDay);

  function dateToPx(date: Date): number {
    return (
      ((date.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) * pxPerDay
    );
  }

  const today = new Date();
  const todayPx = dateToPx(today);
  const showToday = todayPx >= 0 && todayPx <= totalWidth;

  const markers = getPeriodMarkers(minDate, maxDate, viewMode);

  const ROW_H = 44;

  return (
    <div>
      {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        {isOwner ? (
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90"
          >
            + Nova feature
          </button>
        ) : (
          <div />
        )}

        <div className="flex gap-2 flex-wrap">
          {/* Status filter */}
          <div className="flex bg-secondary rounded-lg p-1 gap-1 text-sm">
            {STATUS_FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-3 py-1 rounded-md font-medium transition-all whitespace-nowrap ${
                  statusFilter === f.value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* View mode toggle */}
          <div className="flex bg-secondary rounded-lg p-1 gap-1 text-sm">
            {(["mensal", "trimestral", "anual"] as ViewMode[]).map(v => (
              <button
                key={v}
                onClick={() => setViewMode(v)}
                className={`px-3 py-1 rounded-md font-medium transition-all capitalize ${
                  viewMode === v
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Gantt container ─────────────────────────────────────────────────── */}
      <div className="border border-border rounded-xl overflow-hidden">
        {/* Tooltip */}
        {hoverInfo && <GanttTooltip info={hoverInfo} />}

        {/* Scroll area: both axes */}
        <div
          ref={scrollRef}
          className="overflow-auto"
          style={{ maxHeight: 520 }}
        >
          {/* Canvas: wide enough to hold all bars */}
          <div style={{ width: LEFT_COL + totalWidth, minWidth: "100%" }}>

            {/* ── Sticky header row ──────────────────────────────────────────── */}
            <div
              className="sticky top-0 z-20 flex bg-secondary border-b border-border"
              style={{ height: ROW_H }}
            >
              {/* Corner cell */}
              <div
                className="sticky left-0 z-30 bg-secondary flex items-center px-3 border-r border-border shrink-0"
                style={{ width: LEFT_COL }}
              >
                <span className="text-xs font-semibold text-muted-foreground">
                  Feature
                </span>
              </div>

              {/* Period labels row */}
              <div
                className="relative"
                style={{ width: totalWidth, minWidth: totalWidth }}
              >
                {markers.map(({ date, label }) => {
                  const px = dateToPx(date);
                  return (
                    <span
                      key={date.toISOString()}
                      className="absolute top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground select-none whitespace-nowrap"
                      style={{ left: px + 4 }}
                    >
                      {label}
                    </span>
                  );
                })}
                {/* Today label */}
                {showToday && (
                  <span
                    className="absolute top-1/2 -translate-y-1/2 text-[11px] font-bold text-destructive select-none whitespace-nowrap"
                    style={{ left: todayPx + 4 }}
                  >
                    Hoje
                  </span>
                )}
              </div>
            </div>

            {/* ── Feature rows ───────────────────────────────────────────────── */}
            {featuresWithDates.map((feature, idx) => {
              const startPx = dateToPx(new Date(feature.dataInicio!));
              const endPx = dateToPx(new Date(feature.dataFim!));
              const widthPx = Math.max(6, endPx - startPx);
              const isLast = idx === featuresWithDates.length - 1;

              return (
                <div
                  key={feature.id}
                  className={`flex group ${!isLast ? "border-b border-border" : ""}`}
                  style={{ height: ROW_H }}
                >
                  {/* Sticky feature-name cell */}
                  <div
                    className="sticky left-0 z-10 flex items-center gap-2 px-3 border-r border-border shrink-0 cursor-pointer
                      bg-card group-hover:bg-secondary transition-colors"
                    style={{ width: LEFT_COL }}
                    onClick={() => setSelectedFeature(feature)}
                  >
                    <span className="text-sm text-foreground truncate flex-1 group-hover:text-primary transition-colors">
                      {feature.titulo}
                    </span>
                    <span className="shrink-0 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <span>👍{feature.likes}</span>
                      <span>👎{feature.dislikes}</span>
                    </span>
                  </div>

                  {/* Bar area */}
                  <div
                    className="relative bg-card group-hover:bg-secondary/30 transition-colors"
                    style={{ width: totalWidth, minWidth: totalWidth }}
                  >
                    {/* Period grid lines */}
                    {markers.map(({ date }) => {
                      const px = dateToPx(date);
                      return (
                        <div
                          key={date.toISOString()}
                          className="absolute top-0 bottom-0 w-px"
                          style={{
                            left: px,
                            background: "hsl(var(--border) / 0.45)",
                          }}
                        />
                      );
                    })}

                    {/* Today line */}
                    {showToday && (
                      <div
                        className="absolute top-0 bottom-0 z-10 pointer-events-none"
                        style={{
                          left: todayPx,
                          width: 2,
                          background: "hsl(var(--destructive) / 0.85)",
                        }}
                      />
                    )}

                    {/* Gantt bar */}
                    <div
                      className={`absolute rounded-md cursor-pointer hover:opacity-80 transition-opacity ${STATUS_COLORS[feature.status]}`}
                      style={{
                        left: startPx,
                        width: widthPx,
                        top: 8,
                        height: ROW_H - 16,
                      }}
                      onClick={() => setSelectedFeature(feature)}
                      onMouseMove={e =>
                        setHoverInfo({
                          feature,
                          clientX: e.clientX,
                          clientY: e.clientY,
                        })
                      }
                      onMouseLeave={() => setHoverInfo(null)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-border bg-secondary/40 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-status-planned inline-block" />
            Planejado
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-status-in-progress inline-block" />
            Em andamento
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-status-done inline-block" />
            Concluído
          </span>
          <span className="flex items-center gap-1.5 ml-auto">
            <span className="w-0.5 h-3 bg-destructive inline-block" />
            Hoje
          </span>
        </div>
      </div>

      {/* Modals */}
      {selectedFeature && (
        <FeatureModal
          roadmapId={roadmapId}
          feature={selectedFeature}
          isOwner={isOwner}
          userId={userId}
          onClose={() => setSelectedFeature(null)}
          onSaved={onSaved}
        />
      )}
      {showCreate && (
        <FeatureModal
          roadmapId={roadmapId}
          onClose={() => setShowCreate(false)}
          onSaved={onSaved}
        />
      )}
    </div>
  );
}

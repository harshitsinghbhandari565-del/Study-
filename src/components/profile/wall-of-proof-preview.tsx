"use client";

import { useMemo } from "react";
import { SUBJECTS } from "@/lib/constants";
import type { StudySession } from "@/lib/types";

interface WallOfProofPreviewProps { sessions: StudySession[]; }

function getColor(subjectId: string): string { return SUBJECTS.find((s) => s.id === subjectId)?.color || "#71717a"; }

export function WallOfProofPreview({ sessions }: WallOfProofPreviewProps) {
  const tiles = useMemo(() => {
    const sorted = [...sessions].sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 30);
    const filled = sorted.map((s) => ({ color: getColor(s.subjectId), id: s.id }));
    while (filled.length < 30) filled.push({ color: "", id: `ghost-${filled.length}` });
    return filled;
  }, [sessions]);

  return (
    <div>
      <div className="overflow-x-auto flex gap-1 pb-2 scrollbar-none">
        {tiles.map((t) => (
          <div key={t.id} className="w-4 h-4 rounded-sm flex-shrink-0" style={{ backgroundColor: t.color || "var(--bg-tertiary)" }} />
        ))}
      </div>
      <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Last 30 sessions</p>
    </div>
  );
}
export default WallOfProofPreview;

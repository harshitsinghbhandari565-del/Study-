"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Crosshair, CheckCircle2, Play } from "lucide-react";
import { BossBadge } from "@/components/ui/boss-badge";
import { ConfidenceRating } from "@/components/ui/confidence-rating";
import { calculateSubjectProgress } from "@/lib/utils";
import type { Chapter } from "@/lib/types";

interface FinalRevisionListProps {
  subjectId: string;
  chapters: Chapter[];
  subjectColor: string;
  onSelectChapter: (chapterId: string) => void;
}

export function FinalRevisionList({ subjectId, chapters, subjectColor, onSelectChapter }: FinalRevisionListProps) {
  const weakChapters = useMemo(() => {
    return chapters
      .filter((c) => c.subjectId === subjectId && c.confidence === 1)
      .sort((a, b) => {
        if (a.isBoss && !b.isBoss) return -1;
        if (!a.isBoss && b.isBoss) return 1;
        return calculateSubjectProgress(a) - calculateSubjectProgress(b);
      });
  }, [subjectId, chapters]);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${subjectColor}15` }}>
          <Crosshair size={16} style={{ color: subjectColor }} />
        </div>
        <h3 className="font-semibold text-zinc-100 text-sm">Prioritize These</h3>
      </div>

      {weakChapters.length === 0 ? (
        <div className="flex items-center gap-2 py-3 text-emerald-400">
          <CheckCircle2 size={16} />
          <span className="text-sm">No weak chapters — you're solid!</span>
        </div>
      ) : (
        <div className="space-y-2 max-h-[280px] overflow-y-auto">
          {weakChapters.map((ch) => {
            const progress = calculateSubjectProgress(ch);
            return (
              <div key={ch.id} className="p-3 rounded-lg bg-zinc-800/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-sm font-medium text-zinc-100 truncate">{ch.name}</span>
                    {ch.isBoss && <BossBadge size="sm" pulse={false} />}
                  </div>
                  <ConfidenceRating value={1} size="sm" readOnly />
                </div>
                <div className="h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: subjectColor }} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500">{progress}% complete</span>
                  <button onClick={() => onSelectChapter(ch.id)} className="flex items-center gap-1 px-3 py-1.5 bg-zinc-800 rounded-lg text-xs font-medium hover:bg-zinc-700 transition-colors" style={{ color: subjectColor }}>
                    <Play size={10} fill="currentColor" /> Log Session
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
export default FinalRevisionList;

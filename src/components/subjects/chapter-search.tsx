"use client";

import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, X, SearchX, ChevronRight } from "lucide-react";
import { BossBadge } from "@/components/ui/boss-badge";
import { ConfidenceRating } from "@/components/ui/confidence-rating";
import { calculateSubjectProgress } from "@/lib/utils";
import { SUBJECTS } from "@/lib/constants";
import type { Chapter, Subject } from "@/lib/types";

interface ChapterSearchProps {
  chapters: Chapter[];
  subjects: Subject[];
  onSelectChapter: (chapterId: string, subjectId: string) => void;
}

type FilterType = "all" | "incomplete" | "shaky" | "boss" | string; // string = subjectId

const cV = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.03 } } };
const iV = { hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0, transition: { duration: 0.2 } } };

export function ChapterSearch({ chapters, onSelectChapter }: ChapterSearchProps) {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const handleChipTap = useCallback((filter: FilterType) => {
    setActiveFilter((prev) => {
      if (filter === "all") return "all";
      if (prev === filter) return "all"; // toggle off
      return filter;
    });
  }, []);

  const isSubjectFilter = (f: FilterType) => SUBJECTS.some((s) => s.id === f);

  const filtered = useMemo(() => {
    let result = [...chapters];

    // Text search
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (ch) =>
          ch.name.toLowerCase().includes(q) ||
          (ch.unit && ch.unit.toLowerCase().includes(q))
      );
    }

    // Chip filters
    if (activeFilter !== "all") {
      if (activeFilter === "incomplete") {
        result = result.filter((ch) => calculateSubjectProgress(ch) < 100);
      } else if (activeFilter === "shaky") {
        result = result.filter((ch) => ch.confidence === 1);
      } else if (activeFilter === "boss") {
        result = result.filter((ch) => ch.isBoss);
      } else if (isSubjectFilter(activeFilter)) {
        result = result.filter((ch) => ch.subjectId === activeFilter);
      }
    }

    return result;
  }, [chapters, query, activeFilter]);

  // Group results by subject (only when not filtered to single subject)
  const grouped = useMemo(() => {
    if (isSubjectFilter(activeFilter)) return null; // flat list
    const map = new Map<string, Chapter[]>();
    filtered.forEach((ch) => {
      if (!map.has(ch.subjectId)) map.set(ch.subjectId, []);
      map.get(ch.subjectId)!.push(ch);
    });
    return map;
  }, [filtered, activeFilter]);

  const showResults = query.trim().length > 0 || activeFilter !== "all";

  const chipActive = "font-bold rounded-full px-3 py-1.5 text-xs whitespace-nowrap min-h-[32px] border transition-colors";
  const chipInactive = "rounded-full px-3 py-1.5 text-xs whitespace-nowrap min-h-[32px] border transition-colors";

  return (
    <div className="mb-6">
      {/* Search Bar */}
      <div className="relative mb-3">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Find a chapter..."
          className="w-full h-12 pl-10 pr-10 rounded-xl text-sm focus:outline-none"
          style={{
            backgroundColor: "var(--bg-card)",
            borderWidth: 1,
            borderColor: "var(--border-color)",
            color: "var(--text-primary)",
          }}
        />
        {query.length > 0 && (
          <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full" style={{ color: "var(--text-muted)" }}>
            <X size={16} />
          </button>
        )}
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {/* All */}
        <button onClick={() => handleChipTap("all")} className={activeFilter === "all" ? chipActive : chipInactive} style={activeFilter === "all" ? { backgroundColor: "var(--btn-primary-bg)", color: "var(--btn-primary-text)", borderColor: "var(--btn-primary-bg)" } : { backgroundColor: "var(--bg-card)", color: "var(--text-muted)", borderColor: "var(--border-color)" }}>
          All
        </button>

        {/* Incomplete */}
        <button onClick={() => handleChipTap("incomplete")} className={activeFilter === "incomplete" ? chipActive : chipInactive} style={activeFilter === "incomplete" ? { backgroundColor: "var(--btn-primary-bg)", color: "var(--btn-primary-text)", borderColor: "var(--btn-primary-bg)" } : { backgroundColor: "var(--bg-card)", color: "var(--text-muted)", borderColor: "var(--border-color)" }}>
          Incomplete
        </button>

        {/* Shaky */}
        <button onClick={() => handleChipTap("shaky")} className={activeFilter === "shaky" ? chipActive : chipInactive} style={activeFilter === "shaky" ? { backgroundColor: "var(--btn-primary-bg)", color: "var(--btn-primary-text)", borderColor: "var(--btn-primary-bg)" } : { backgroundColor: "var(--bg-card)", color: "var(--text-muted)", borderColor: "var(--border-color)" }}>
          ⭐ Shaky
        </button>

        {/* Boss */}
        <button onClick={() => handleChipTap("boss")} className={activeFilter === "boss" ? chipActive : chipInactive} style={activeFilter === "boss" ? { backgroundColor: "var(--btn-primary-bg)", color: "var(--btn-primary-text)", borderColor: "var(--btn-primary-bg)" } : { backgroundColor: "var(--bg-card)", color: "var(--text-muted)", borderColor: "var(--border-color)" }}>
          Boss
        </button>

        {/* Subject chips */}
        {SUBJECTS.map((s) => (
          <button key={s.id} onClick={() => handleChipTap(s.id)} className={activeFilter === s.id ? chipActive : chipInactive} style={activeFilter === s.id ? { backgroundColor: "var(--btn-primary-bg)", color: "var(--btn-primary-text)", borderColor: "var(--btn-primary-bg)" } : { backgroundColor: "var(--bg-card)", color: "var(--text-muted)", borderColor: "var(--border-color)" }}>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
              {s.name}
            </span>
          </button>
        ))}
      </div>

      {/* Results */}
      {showResults && (
        <div className="mt-4">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <SearchX size={32} style={{ color: "var(--text-faint)" }} className="mb-2" />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>No chapters match.</p>
            </div>
          ) : (
            <motion.div variants={cV} initial="hidden" animate="visible" className="space-y-1">
              {grouped ? (
                // Grouped by subject
                Array.from(grouped.entries()).map(([subjectId, chs]) => {
                  const subj = SUBJECTS.find((s) => s.id === subjectId);
                  if (!subj) return null;
                  return (
                    <div key={subjectId} className="mb-3">
                      <div className="flex items-center gap-2 mb-1.5 px-1">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: subj.color }} />
                        <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>{subj.name}</span>
                        <span className="text-[10px]" style={{ color: "var(--text-faint)" }}>({chs.length})</span>
                      </div>
                      {chs.map((ch) => (
                        <ResultRow key={ch.id} chapter={ch} subjectColor={subj.color} onSelect={() => onSelectChapter(ch.id, ch.subjectId)} />
                      ))}
                    </div>
                  );
                })
              ) : (
                // Flat list (single subject filter)
                filtered.map((ch) => {
                  const subj = SUBJECTS.find((s) => s.id === ch.subjectId);
                  return <ResultRow key={ch.id} chapter={ch} subjectColor={subj?.color || "#71717a"} onSelect={() => onSelectChapter(ch.id, ch.subjectId)} />;
                })
              )}
            </motion.div>
          )}

          <p className="text-center text-[10px] mt-3" style={{ color: "var(--text-faint)" }}>
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}

      {/* Idle state */}
      {!showResults && (
        <p className="text-center text-sm py-4" style={{ color: "var(--text-faint)" }}>
          Type to search or pick a filter
        </p>
      )}
    </div>
  );
}

// ─── Result Row ───────────────────────────────────────────────────────────────

function ResultRow({ chapter, subjectColor, onSelect }: { chapter: Chapter; subjectColor: string; onSelect: () => void }) {
  const progress = calculateSubjectProgress(chapter);

  return (
    <motion.button
      variants={iV}
      onClick={onSelect}
      whileTap={{ scale: 0.98 }}
      className="w-full flex items-center gap-3 p-3 rounded-xl border mb-1 text-left min-h-[60px] transition-colors"
      style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}
    >
      {/* Subject dot */}
      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: subjectColor }} />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{chapter.name}</span>
          {chapter.isBoss && <BossBadge size="sm" pulse={false} />}
        </div>
        {chapter.unit && chapter.unit !== chapter.name && (
          <p className="text-[10px] truncate mb-1" style={{ color: "var(--text-faint)" }}>{chapter.unit}</p>
        )}
        <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--bg-tertiary)" }}>
          <div className="h-full rounded-full" style={{ width: `${Math.max(2, progress)}%`, backgroundColor: subjectColor }} />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 shrink-0">
        <ConfidenceRating value={chapter.confidence} size="sm" readOnly />
        <ChevronRight size={16} style={{ color: "var(--text-faint)" }} />
      </div>
    </motion.button>
  );
}

export default ChapterSearch;

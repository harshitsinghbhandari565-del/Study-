"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, LayoutGrid } from "lucide-react";
import { format, parseISO } from "date-fns";
import { SUBJECTS } from "@/lib/constants";
import type { StudySession } from "@/lib/types";

interface WallOfProofModalProps { sessions: StudySession[]; isOpen: boolean; onClose: () => void; }

function getColor(subjectId: string): string { return SUBJECTS.find((s) => s.id === subjectId)?.color || "#71717a"; }

export function WallOfProofModal({ sessions, isOpen, onClose }: WallOfProofModalProps) {
  const sorted = useMemo(() => [...sessions].sort((a, b) => a.timestamp.localeCompare(b.timestamp)), [sessions]);

  const dateRange = useMemo(() => {
    if (sorted.length === 0) return "";
    const first = format(parseISO(sorted[0].timestamp), "MMM yyyy");
    const last = format(parseISO(sorted[sorted.length - 1].timestamp), "MMM yyyy");
    return first === last ? first : `${first} – ${last}`;
  }, [sorted]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm" onClick={onClose}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onClick={(e) => e.stopPropagation()}
            className="absolute inset-4 md:inset-10 rounded-2xl overflow-hidden flex flex-col border"
            style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-color)" }}>
            <div className="flex items-center justify-between p-4" style={{ borderBottomWidth: 1, borderBottomColor: "var(--border-color)" }}>
              <div className="flex items-center gap-2"><LayoutGrid size={18} style={{ color: "var(--text-muted)" }} /><span className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Wall of Proof</span></div>
              <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--bg-card)", color: "var(--text-muted)" }}><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>{sessions.length} sessions · {dateRange}</p>
              {sorted.length === 0 ? (
                <p className="text-center py-8" style={{ color: "var(--text-faint)" }}>No sessions yet. Start building your wall.</p>
              ) : (
                <div className="grid grid-cols-7 gap-1">
                  {sorted.map((s) => (
                    <div key={s.id} className="aspect-square rounded-sm" style={{ backgroundColor: getColor(s.subjectId) }} title={`${SUBJECTS.find((x) => x.id === s.subjectId)?.name} · ${format(parseISO(s.timestamp), "MMM d, yyyy")}`} />
                  ))}
                </div>
              )}
              {sorted.length > 0 && (
                <div className="flex items-center gap-3 mt-4 pt-3 flex-wrap" style={{ borderTopWidth: 1, borderTopColor: "var(--border-color)" }}>
                  {SUBJECTS.map((s) => { const c = sessions.filter((se) => se.subjectId === s.id).length; if (c === 0) return null; return (<div key={s.id} className="flex items-center gap-1.5 text-xs"><div className="w-2 h-2 rounded-sm" style={{ backgroundColor: s.color }} /><span style={{ color: "var(--text-muted)" }}>{c}</span></div>); })}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
export default WallOfProofModal;

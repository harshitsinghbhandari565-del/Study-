"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutGrid, X, Atom, FlaskConical, Calculator, Cpu, Dumbbell, BookOpen, Flame, Meh, BatteryLow } from "lucide-react";
import { format, parseISO } from "date-fns";
import { SUBJECTS, RESOURCE_TYPES } from "@/lib/constants";
import { formatStudyDate, getResourceTypeById } from "@/lib/utils";
import { ConfidenceRating } from "@/components/ui/confidence-rating";
import type { StudySession } from "@/lib/types";

const ICONS: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: number | string }>> = { Atom, FlaskConical, Calculator, Cpu, Dumbbell, BookOpen };
function getIC(n: string) { return ICONS[n] || BookOpen; }
const MOOD_LABEL: Record<string, { label: string; icon: typeof Flame }> = { "locked-in": { label: "Locked In", icon: Flame }, okay: { label: "Okay", icon: Meh }, low: { label: "Low", icon: BatteryLow } };

function getSubjectColor(id: string) { return SUBJECTS.find((s) => s.id === id)?.color || "#71717a"; }
function getSubjectName(id: string) { return SUBJECTS.find((s) => s.id === id)?.name || "Unknown"; }

interface WallOfProofProps { sessions: StudySession[]; }

const cV = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.005 } } };
const tV = { hidden: { opacity: 0, scale: 0 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.15 } } };

export function WallOfProof({ sessions }: WallOfProofProps) {
  const [selected, setSelected] = useState<StudySession | null>(null);

  const sorted = useMemo(() => [...sessions].sort((a, b) => a.timestamp.localeCompare(b.timestamp)), [sessions]);

  const dateRange = useMemo(() => {
    if (sorted.length === 0) return "";
    const f = format(parseISO(sorted[0].timestamp), "MMM yyyy");
    const l = format(parseISO(sorted[sorted.length - 1].timestamp), "MMM yyyy");
    return f === l ? f : `${f} – ${l}`;
  }, [sorted]);

  const ghostTiles = useMemo(() => Array.from({ length: 21 }).map((_, i) => i), []);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl p-4 border overflow-hidden" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2"><div className="p-1.5 rounded-lg bg-amber-500/10"><LayoutGrid size={16} className="text-amber-400" /></div><h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>Your Wall of Proof</h3></div>
        {sessions.length > 0 && <span className="text-xs" style={{ color: "var(--text-faint)" }}>{sessions.length} sessions · {dateRange}</span>}
      </div>

      {sessions.length === 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-7 gap-1">{ghostTiles.map((i) => <div key={i} className="aspect-square w-full rounded-sm" style={{ backgroundColor: "var(--bg-tertiary)" }} />)}</div>
          <p className="text-center text-sm py-2" style={{ color: "var(--text-faint)" }}>Your wall is empty. Start building it one session at a time.</p>
        </div>
      ) : (
        <motion.div variants={cV} initial="hidden" animate="visible" className="grid grid-cols-7 gap-1">
          {sorted.map((s) => {
            const color = getSubjectColor(s.subjectId);
            const initial = getSubjectName(s.subjectId).charAt(0).toUpperCase();
            const dateStr = format(parseISO(s.timestamp), "dd/MM");
            return (
              <motion.button key={s.id} variants={tV} onClick={() => setSelected(s)} className="aspect-square w-full rounded-sm relative flex flex-col items-center justify-center cursor-pointer hover:scale-110 hover:z-10 transition-transform" style={{ backgroundColor: color }}>
                <span className="text-white text-[8px] font-bold leading-none" style={{ textShadow: "0 0 2px rgba(0,0,0,0.5)" }}>{initial}</span>
                <span className="text-white/70 text-[6px] leading-none mt-0.5" style={{ textShadow: "0 0 2px rgba(0,0,0,0.5)" }}>{dateStr}</span>
              </motion.button>
            );
          })}
        </motion.div>
      )}

      {sessions.length > 50 && (
        <div className="mt-4 pt-3 flex items-center justify-center gap-4" style={{ borderTopWidth: 1, borderTopColor: "var(--border-color)" }}>
          {SUBJECTS.map((s) => { const c = sessions.filter((se) => se.subjectId === s.id).length; if (c === 0) return null; return (<div key={s.id} className="flex items-center gap-1.5 text-xs"><div className="w-2 h-2 rounded-sm" style={{ backgroundColor: s.color }} /><span style={{ color: "var(--text-muted)" }}>{c}</span></div>); })}
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (() => {
          const subj = SUBJECTS.find((x) => x.id === selected.subjectId);
          const rt = getResourceTypeById(selected.resourceId.split("-resource-").length > 1 ? RESOURCE_TYPES[parseInt(selected.resourceId.split("-resource-")[1])]?.id || "" : "");
          const moodInfo = MOOD_LABEL[selected.mood] || MOOD_LABEL.okay;
          const MoodIcon = moodInfo.icon;
          const SubjIcon = subj ? getIC(subj.icon) : BookOpen;
          return (
            <motion.div key="detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelected(null)} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="max-w-sm w-full rounded-2xl p-4 shadow-2xl border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}>
                <div className="flex items-center justify-between mb-3">
                  <SubjIcon size={24} style={{ color: subj?.color }} />
                  <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--bg-card-hover)", color: "var(--text-muted)" }}><X size={18} /></button>
                </div>
                <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>{subj?.name}</p>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{selected.chapterId}</p>
                {rt && <p className="text-xs" style={{ color: "var(--text-muted)" }}>{rt.name}</p>}
                <p className="text-emerald-400 font-bold mt-2">+{selected.xpEarned} XP</p>
                <div className="flex items-center gap-2 mt-2"><MoodIcon size={14} style={{ color: "var(--text-muted)" }} /><span className="text-xs" style={{ color: "var(--text-muted)" }}>{moodInfo.label}</span></div>
                <div className="mt-2"><ConfidenceRating value={selected.confidence} size="sm" readOnly /></div>
                <p className="text-xs mt-3" style={{ color: "var(--text-faint)" }}>{formatStudyDate(selected.timestamp)}</p>
                <div className="flex items-center gap-1 mt-3 pt-2" style={{ borderTopWidth: 1, borderTopColor: "var(--border-color)" }}><LayoutGrid size={10} style={{ color: "var(--text-faint)" }} /><span className="text-[10px]" style={{ color: "var(--text-faint)" }}>Wall of Proof</span></div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </motion.div>
  );
}
export default WallOfProof;

"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, BookOpen, Atom, FlaskConical, Calculator, Cpu, Dumbbell } from "lucide-react";
import { calculateSubjectReadiness, getReadinessAdvice } from "@/lib/utils";
import type { Chapter, RevisionItem, Subject, Test } from "@/lib/types";

const ICONS: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: number | string }>> = { Atom, FlaskConical, Calculator, Cpu, Dumbbell, BookOpen };
function getIC(n: string) { return ICONS[n] || BookOpen; }

interface SubjectReadinessProps { chapters: Chapter[]; revisions: RevisionItem[]; subjects: Subject[]; tests: Test[]; }

const cV = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const iV = { hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.25 } } };

export function SubjectReadiness({ chapters, revisions, subjects }: SubjectReadinessProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const data = useMemo(() => subjects.map((s) => {
    const r = calculateSubjectReadiness(s.id, chapters, revisions);
    return { subject: s, readiness: r, advice: getReadinessAdvice(r) };
  }), [subjects, chapters, revisions]);

  const allEmpty = data.every((d) => d.readiness.totalScore === 0 && d.readiness.completedChapters === 0);

  const scoreColor = (s: number) => s >= 80 ? "text-emerald-400" : s >= 50 ? "text-amber-400" : "text-red-400";

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
      <div className="flex items-center gap-2 mb-1">
        <div className="p-1.5 rounded-lg bg-blue-500/10"><Shield size={16} className="text-blue-400" /></div>
        <h3 className="font-semibold text-zinc-100">If Today Were Test Day</h3>
      </div>
      <p className="text-xs text-zinc-500 mb-4 ml-9">How ready are you, really?</p>

      {allEmpty ? (
        <div className="flex flex-col items-center py-4 text-center">
          <BookOpen size={28} className="text-zinc-700 mb-2" />
          <p className="text-sm text-zinc-500">Log sessions to build your readiness score.</p>
        </div>
      ) : (
        <motion.div variants={cV} initial="hidden" animate="visible" className="grid grid-cols-2 gap-3">
          {data.map(({ subject: s, readiness: r, advice }) => {
            const IC = getIC(s.icon);
            const expanded = expandedId === s.id;
            const cPct = r.completionScore > 0 ? Math.round((r.completionScore / 40) * 100) : 0;
            const confPct = r.confidenceScore > 0 ? Math.round((r.confidenceScore / 35) * 100) : 0;
            const revPct = r.revisionScore > 0 ? Math.round((r.revisionScore / 25) * 100) : 0;

            return (
              <motion.div key={s.id} variants={iV} layout>
                <button onClick={() => setExpandedId(expanded ? null : s.id)} className={`w-full text-left p-3 rounded-xl border transition-all ${expanded ? "bg-zinc-800 border-zinc-600 col-span-2" : "bg-zinc-800/50 border-zinc-800 hover:border-zinc-700"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <IC size={16} style={{ color: s.color }} />
                    <span className="text-sm font-medium text-zinc-100 truncate">{s.name}</span>
                  </div>

                  <p className={`text-3xl font-bold tabular-nums ${scoreColor(r.totalScore)}`}>{r.totalScore}%</p>

                  {/* Mini stacked bar */}
                  <div className="flex h-2 rounded-full overflow-hidden mt-2 bg-zinc-700">
                    {cPct > 0 && <div className="h-full rounded-sm" style={{ width: `${cPct}%`, backgroundColor: s.color }} />}
                    {confPct > 0 && <div className="h-full rounded-sm bg-amber-400" style={{ width: `${confPct}%` }} />}
                    {revPct > 0 && <div className="h-full rounded-sm bg-blue-400" style={{ width: `${revPct}%` }} />}
                  </div>

                  {/* Expanded detail */}
                  <AnimatePresence>
                    {expanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="mt-3 pt-3 border-t border-zinc-700 space-y-2 text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                            <span className="text-zinc-300">Completion: {r.completionScore}/40 ({r.completedChapters} of {r.totalChapters} chapters)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-amber-400" />
                            <span className="text-zinc-300">Confidence: {r.confidenceScore}/35 (avg {r.avgConfidence} stars)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-400" />
                            <span className="text-zinc-300">Revision: {r.revisionScore}/25 ({r.completedRevisions} done, {r.overdueRevisions} overdue)</span>
                          </div>
                          <div className="pt-2 border-t border-zinc-700">
                            <p className="text-zinc-100 font-bold">Total: {r.totalScore}/100</p>
                          </div>
                          <p className="text-zinc-400 italic">{advice}</p>
                          <p className="text-zinc-600 text-[10px]">Tap to close</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}
export default SubjectReadiness;

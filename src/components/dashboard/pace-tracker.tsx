"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Gauge, CalendarPlus, Atom, FlaskConical, Calculator, Cpu, Dumbbell, BookOpen } from "lucide-react";
import { calculatePaceStatus } from "@/lib/utils";
import type { Chapter, Test, Subject } from "@/lib/types";

const ICONS: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: number | string }>> = { Atom, FlaskConical, Calculator, Cpu, Dumbbell, BookOpen };
function getIC(n: string) { return ICONS[n] || BookOpen; }

interface PaceTrackerProps { chapters: Chapter[]; tests: Test[]; subjects: Subject[]; sessionStartDate: string; }

const cV = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const iV = { hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0, transition: { duration: 0.25 } } };

export function PaceTracker({ chapters, tests, subjects, sessionStartDate }: PaceTrackerProps) {
  const paces = useMemo(() => subjects.map((s) => ({ subject: s, pace: calculatePaceStatus(s.id, chapters, tests, sessionStartDate) })), [subjects, chapters, tests, sessionStartDate]);
  const allNoTest = paces.every((p) => p.pace.status === "no-test");

  const statusStyles: Record<string, { pill: string; color: string }> = {
    "on-track": { pill: "bg-emerald-500/20 text-emerald-400", color: "text-emerald-400" },
    behind: { pill: "bg-amber-500/20 text-amber-400", color: "text-amber-400" },
    critical: { pill: "bg-red-500/20 text-red-400", color: "text-red-400" },
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-lg bg-violet-500/10"><Gauge size={16} className="text-violet-400" /></div>
        <h3 className="font-semibold text-zinc-100">Your Pace</h3>
      </div>

      {allNoTest ? (
        <div className="flex flex-col items-center py-4 text-center">
          <CalendarPlus size={28} className="text-zinc-700 mb-2" />
          <p className="text-sm text-zinc-500">Schedule tests to see your pace.</p>
        </div>
      ) : (
        <motion.div variants={cV} initial="hidden" animate="visible" className="space-y-3">
          {paces.map(({ subject: s, pace: p }) => {
            const IC = getIC(s.icon);

            if (p.status === "no-test") {
              return (
                <motion.div key={s.id} variants={iV} className="flex items-center gap-3 py-1">
                  <IC size={16} style={{ color: s.color }} />
                  <span className="text-sm text-zinc-400">{s.name}</span>
                  <span className="text-xs text-zinc-600 ml-auto">Add a test to track pace</span>
                </motion.div>
              );
            }

            if (p.status === "passed") {
              return (
                <motion.div key={s.id} variants={iV} className="flex items-center gap-3 py-1">
                  <IC size={16} style={{ color: s.color }} />
                  <span className="text-sm text-zinc-400">{s.name}</span>
                  <span className="text-xs text-zinc-600 ml-auto">Test date has passed</span>
                </motion.div>
              );
            }

            const st = statusStyles[p.status] || statusStyles["on-track"];
            const expectedPct = p.total > 0 ? Math.min(100, Math.round(((p.daysElapsed / (p.daysElapsed + p.daysRemaining)) * p.total / p.total) * 100)) : 0;
            const actualPct = p.total > 0 ? Math.round((p.completed / p.total) * 100) : 0;

            return (
              <motion.div key={s.id} variants={iV} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IC size={18} style={{ color: s.color }} />
                    <span className="text-sm font-medium text-zinc-100">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold tabular-nums ${st.color}`}>{p.requiredChaptersPerWeek}/wk</span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${st.pill}`}>
                      {p.status === "on-track" ? "On Track" : p.status === "behind" ? "Behind" : "Critical"}
                    </span>
                  </div>
                </div>

                {/* Dual bars */}
                <div className="space-y-1">
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${actualPct}%` }} transition={{ duration: 0.6 }} className="h-full rounded-full" style={{ backgroundColor: s.color }} />
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden relative">
                    <div className="h-full rounded-full bg-zinc-700 opacity-50" style={{ width: `${expectedPct}%` }} />
                    {expectedPct > 0 && expectedPct < 100 && (
                      <div className="absolute top-0 h-full w-px bg-white" style={{ left: `${expectedPct}%` }} />
                    )}
                  </div>
                </div>

                <p className="text-xs text-zinc-500">{p.completed} of {p.total} done · {p.daysRemaining}d left</p>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}
export default PaceTracker;

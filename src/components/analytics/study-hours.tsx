"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { calculateTotalHours } from "@/lib/utils";
import type { StudySession, Subject } from "@/lib/types";

interface StudyHoursProps { sessions: StudySession[]; subjects: Subject[]; }

export function StudyHours({ sessions, subjects }: StudyHoursProps) {
  const total = useMemo(() => calculateTotalHours(sessions), [sessions]);
  const bySubject = useMemo(() => subjects.map((s) => ({ ...s, hours: calculateTotalHours(sessions, s.id) })).filter((s) => s.hours > 0).sort((a, b) => b.hours - a.hours), [sessions, subjects]);
  const maxH = useMemo(() => Math.max(...bySubject.map((s) => s.hours), 1), [bySubject]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4"><div className="p-1.5 rounded-lg bg-violet-500/10"><Clock size={16} className="text-violet-400" /></div><h3 className="font-semibold text-zinc-100">Study Hours</h3></div>

      {total === 0 ? (
        <p className="text-sm text-zinc-500 text-center py-4">Start logging sessions to track your time.</p>
      ) : (
        <>
          <div className="text-center mb-4"><p className="text-4xl font-bold text-zinc-100">{total}</p><p className="text-xs text-zinc-500">total hours</p></div>
          <div className="space-y-2.5">
            {bySubject.map((s) => (
              <div key={s.id} className="flex items-center gap-3">
                <span className="text-xs text-zinc-400 w-16 truncate">{s.name}</span>
                <div className="flex-1 h-3 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${(s.hours / maxH) * 100}%` }} transition={{ duration: 0.8 }} className="h-full rounded-full" style={{ backgroundColor: s.color }} />
                </div>
                <span className="text-xs text-zinc-500 w-10 text-right">{s.hours}h</span>
              </div>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}
export default StudyHours;

"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { differenceInDays, parseISO, format } from "date-fns";
import { ProgressBar } from "@/components/ui/progress-bar";
import type { StudySession, Test } from "@/lib/types";

interface StudyVsRemainingProps { sessions: StudySession[]; nearestTest: Test | null; }

export function StudyVsRemaining({ sessions, nearestTest }: StudyVsRemainingProps) {
  const daysLogged = useMemo(() => {
    const unique = new Set<string>(); sessions.forEach((s) => unique.add(format(parseISO(s.timestamp), "yyyy-MM-dd"))); return unique.size;
  }, [sessions]);

  const daysUntil = useMemo(() => {
    if (!nearestTest) return 0; return Math.max(0, differenceInDays(parseISO(nearestTest.date), new Date()));
  }, [nearestTest]);

  const barMaxA = Math.max(30, daysLogged);
  const barMaxB = Math.max(30, daysUntil);
  const colorB = daysUntil < 3 ? "#ef4444" : daysUntil <= 7 ? "#f59e0b" : "#10b981";

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
      <div className="flex items-center gap-2 mb-4"><div className="p-1.5 rounded-lg bg-amber-500/10"><Zap size={16} className="text-amber-400" /></div><h3 className="font-semibold text-zinc-100">Your Pace</h3></div>
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1"><span className="text-xs text-zinc-400">Days Studied</span><span className="text-lg font-bold text-zinc-100">{daysLogged}</span></div>
          <ProgressBar progress={Math.round((daysLogged / barMaxA) * 100)} color="#8b5cf6" height={8} showLabel={false} animate />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1"><span className="text-xs text-zinc-400">Days Until Next Test</span><span className="text-lg font-bold text-zinc-100">{nearestTest ? daysUntil : "—"}</span></div>
          {nearestTest ? <ProgressBar progress={Math.round((daysUntil / barMaxB) * 100)} color={colorB} height={8} showLabel={false} animate /> : <p className="text-xs text-zinc-600">No test scheduled</p>}
        </div>
      </div>
    </motion.div>
  );
}
export default StudyVsRemaining;

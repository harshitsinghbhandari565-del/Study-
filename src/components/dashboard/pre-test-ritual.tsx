"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, X } from "lucide-react";
import { differenceInDays, parseISO, format } from "date-fns";
import { SUBJECTS } from "@/lib/constants";
import type { Test, StudySession, Subject } from "@/lib/types";

interface PreTestRitualProps { tests: Test[]; sessions: StudySession[]; subjects: Subject[]; }

export function PreTestRitual({ tests, sessions }: PreTestRitualProps) {
  const [dismissed, setDismissed] = useState(false);
  const today = format(new Date(), "yyyy-MM-dd");

  const urgentTest = useMemo(() => {
    const candidates = tests.filter((t) => {
      const days = differenceInDays(parseISO(t.date), new Date());
      return days >= 0 && days <= 1 && !t.reflection;
    }).sort((a, b) => a.date.localeCompare(b.date));
    return candidates[0] || null;
  }, [tests]);

  const sessionCount = useMemo(() => {
    if (!urgentTest) return 0;
    return sessions.filter((s) => s.subjectId === urgentTest.subjectId).length;
  }, [urgentTest, sessions]);

  if (!urgentTest || dismissed) return null;

  const subj = SUBJECTS.find((s) => s.id === urgentTest.subjectId);
  const isToday = urgentTest.date === today;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-zinc-900 border border-amber-500/30 rounded-xl p-4 relative">
        <button onClick={() => setDismissed(true)} className="absolute top-3 right-3 p-1 text-zinc-600 hover:text-zinc-400"><X size={16} /></button>
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-amber-500/20"><Shield size={16} className="text-amber-400" /></div>
          <h3 className="font-semibold text-amber-400 text-sm">{isToday ? "Today" : "Tomorrow"}: {urgentTest.name}</h3>
        </div>
        <div className="space-y-2 ml-9">
          {["Pack your materials", "Review key points", "Sleep early", "Stay calm — you've prepared"].map((item, i) => (
            <div key={i} className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-400/50" /><span className="text-xs text-zinc-400">{item}</span></div>
          ))}
          <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /><span className="text-xs text-emerald-400">You logged {sessionCount} sessions for {subj?.name || "this subject"}</span></div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
export default PreTestRitual;

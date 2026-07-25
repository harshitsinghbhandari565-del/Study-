"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import type { Test, TestReflection } from "@/lib/types";

interface ReflectionPromptProps { tests: Test[]; onSubmitReflection: (testId: string, reflection: TestReflection) => void; }

export function ReflectionPrompt({ tests, onSubmitReflection }: ReflectionPromptProps) {
  const today = format(new Date(), "yyyy-MM-dd");
  const unreflected = useMemo(() => tests.filter((t) => t.date < today && !t.reflection).sort((a, b) => b.date.localeCompare(a.date)), [tests, today]);
  const test = unreflected[0] || null;

  const [difficulty, setDifficulty] = useState(0);
  const [surprise, setSurprise] = useState("");
  const [wouldChange, setWouldChange] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = useCallback(() => {
    if (!test || difficulty === 0) return;
    onSubmitReflection(test.id, { difficulty, surpriseTopics: surprise, wouldDoDifferently: wouldChange, completedAt: new Date().toISOString() });
    setSubmitted(true);
  }, [test, difficulty, surprise, wouldChange, onSubmitReflection]);

  if (!test || submitted) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-zinc-900/95 rounded-xl p-4 border border-amber-500/30">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-amber-500/20"><MessageSquare size={16} className="text-amber-400" /></div>
          <div><h3 className="font-semibold text-zinc-100 text-sm">Reflect on {test.name}</h3><p className="text-[10px] text-zinc-500">Your thoughts are still fresh — capture them now.</p></div>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-xs text-zinc-400 mb-1.5">How hard was it?</p>
            <div className="flex gap-1">{[1, 2, 3, 4, 5].map((v) => (<button key={v} onClick={() => setDifficulty(v)} className="p-1.5 min-w-[40px] min-h-[40px] flex items-center justify-center"><Star size={22} className={v <= difficulty ? "text-amber-400 fill-amber-400" : "text-zinc-600"} /></button>))}</div>
          </div>
          <textarea value={surprise} onChange={(e) => setSurprise(e.target.value)} placeholder="Any unexpected topics?" rows={2} className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none resize-none" />
          <textarea value={wouldChange} onChange={(e) => setWouldChange(e.target.value)} placeholder="What would you change next time?" rows={2} className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none resize-none" />
          <motion.button whileTap={difficulty > 0 ? { scale: 0.98 } : {}} onClick={handleSubmit} disabled={difficulty === 0} className={`w-full min-h-[48px] flex items-center justify-center gap-2 rounded-xl font-bold ${difficulty > 0 ? "bg-white text-zinc-900" : "bg-zinc-800 text-zinc-500 cursor-not-allowed"}`}>Save Reflection</motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
export default ReflectionPrompt;

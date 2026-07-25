"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Atom, FlaskConical, Calculator, Cpu, Dumbbell, BookOpen, Zap } from "lucide-react";
import { differenceInSeconds, parseISO } from "date-fns";
import type { Test, Subject } from "@/lib/types";

const ICON_MAP: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: number | string }>> = { Atom, FlaskConical, Calculator, Cpu, Dumbbell, BookOpen };
function getIcon(n: string) { return ICON_MAP[n] || BookOpen; }

interface FocusWeekBannerProps { test: Test; subject: Subject; subjectProgress: number; testDate: string; }

export function FocusWeekBanner({ test, subject, subjectProgress, testDate }: FocusWeekBannerProps) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000);
    const onFocus = () => setNow(Date.now());
    const onVis = () => { if (!document.hidden) setNow(Date.now()); };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);
    return () => { clearInterval(tick); window.removeEventListener("focus", onFocus); document.removeEventListener("visibilitychange", onVis); };
  }, []);

  const countdown = useMemo(() => {
    const target = parseISO(testDate + "T23:59:59");
    const totalSec = Math.max(0, differenceInSeconds(target, new Date(now)));
    const days = Math.floor(totalSec / 86400);
    const hours = Math.floor((totalSec % 86400) / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    return { days, hours, mins };
  }, [testDate, now]);

  const motivation = useMemo(() => {
    if (countdown.days >= 5) return "Solidify what you know.";
    if (countdown.days >= 2) return "Deep focus — no new topics.";
    return "Final stretch — review and rest.";
  }, [countdown.days]);

  const IC = getIcon(subject.icon);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl p-6 border-2 relative overflow-hidden"
      style={{ backgroundColor: `${subject.color}10`, borderColor: `${subject.color}40` }}
    >
      <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-20" style={{ backgroundColor: subject.color }} />

      <div className="relative z-10">
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full mb-4" style={{ backgroundColor: `${subject.color}20`, color: subject.color }}>
          <Zap size={10} /> Focus Week
        </span>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl" style={{ backgroundColor: `${subject.color}20` }}>
            <IC size={32} style={{ color: subject.color }} />
          </div>
          <div>
            <p className="text-2xl font-bold text-zinc-50">{subject.name}</p>
            <p className="text-sm text-zinc-400">{test.name}</p>
          </div>
        </div>

        <div className="flex items-baseline gap-1 mb-4">
          <span className="text-4xl font-black tabular-nums font-mono" style={{ color: subject.color }}>
            {countdown.days}d {countdown.hours}h {countdown.mins}m
          </span>
        </div>

        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
            <span>Subject Progress</span>
            <span>{subjectProgress}%</span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${subjectProgress}%` }} transition={{ duration: 1 }} className="h-full rounded-full" style={{ backgroundColor: subject.color }} />
          </div>
        </div>

        <p className="text-sm text-zinc-400 italic">{motivation}</p>
      </div>
    </motion.div>
  );
}
export default FocusWeekBanner;

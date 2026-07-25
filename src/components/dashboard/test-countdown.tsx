"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock } from "lucide-react";
import { differenceInSeconds, parseISO } from "date-fns";
import { SUBJECTS } from "@/lib/constants";
import type { Test } from "@/lib/types";

interface TestCountdownProps { nearestTest: Test | null; }

export function TestCountdown({ nearestTest }: TestCountdownProps) {
  const [showSeconds, setShowSeconds] = useState(false);
  const [now, setNow] = useState(Date.now());

  // Live ticker + mobile refocus fix
  useEffect(() => {
    if (!showSeconds) return;
    const tick = setInterval(() => setNow(Date.now()), 1000);
    const onFocus = () => setNow(Date.now());
    const onVis = () => { if (!document.hidden) setNow(Date.now()); };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);
    return () => { clearInterval(tick); window.removeEventListener("focus", onFocus); document.removeEventListener("visibilitychange", onVis); };
  }, [showSeconds]);

  const info = useMemo(() => {
    if (!nearestTest) return null;
    const target = parseISO(nearestTest.date + "T23:59:59");
    const totalSec = Math.max(0, differenceInSeconds(target, new Date(now)));
    const days = Math.floor(totalSec / 86400);
    const hours = Math.floor((totalSec % 86400) / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    const color = days < 3 ? "text-red-400" : days <= 7 ? "text-amber-400" : "text-emerald-400";
    const subj = SUBJECTS.find((s) => s.id === nearestTest.subjectId);
    return { days, hours, mins, secs, color, subj };
  }, [nearestTest, now]);

  const toggleMode = useCallback(() => setShowSeconds((p) => !p), []);

  if (!nearestTest || !info) {
    return (
      <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
        <div className="flex items-center gap-2 text-zinc-500"><Calendar size={16} /><span className="text-sm">No upcoming tests scheduled</span></div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-zinc-900 rounded-xl p-4 border border-zinc-800" style={{ borderLeftWidth: 4, borderLeftColor: info.subj?.color || "#71717a" }}>
      <div className="flex items-center gap-4">
        <div className="text-center min-w-[80px]">
          {showSeconds ? (
            <div>
              <p className={`text-2xl font-black tabular-nums font-mono ${info.color}`}>{info.days}d</p>
              <p className={`text-lg font-bold tabular-nums font-mono ${info.color}`}>
                {String(info.hours).padStart(2, "0")}:{String(info.mins).padStart(2, "0")}:{String(info.secs).padStart(2, "0")}
              </p>
            </div>
          ) : (
            <>
              <p className={`text-5xl font-black ${info.color}`}>{info.days}</p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">days</p>
            </>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-zinc-100 truncate">{nearestTest.name}</p>
          <p className="text-xs text-zinc-500 mt-0.5">{info.subj?.name} · {nearestTest.date}</p>
        </div>
        <button onClick={toggleMode} className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors shrink-0">
          <Clock size={16} />
        </button>
      </div>
    </motion.div>
  );
}
export default TestCountdown;

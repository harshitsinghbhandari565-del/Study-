"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Moon, ChevronDown, Check, CheckCircle2 } from "lucide-react";
import { BossBadge } from "@/components/ui/boss-badge";
import { useStudyContext } from "@/contexts/study-context";
import { calculateSubjectProgress, getResourceTypeById } from "@/lib/utils";
import type { ScheduleDay } from "@/lib/types";

interface ScheduleListProps { schedule: ScheduleDay[]; }

const cV = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const iV = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.25 } } };

export function ScheduleList({ schedule }: ScheduleListProps) {
  const { chapters, logSession } = useStudyContext();
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const todayISO = new Date().toISOString().split("T")[0];

  const quickLog = useCallback((subjectId: string, chapterId: string, resourceId: string) => {
    logSession(subjectId, chapterId, resourceId, "okay", 2);
  }, [logSession]);

  const logAll = useCallback((subjectId: string, chapterId: string) => {
    const ch = chapters.find((c) => c.id === chapterId);
    if (!ch) return;
    ch.resources.filter((r) => !r.completed).forEach((r) => logSession(subjectId, chapterId, r.id, "okay", 2));
  }, [chapters, logSession]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4"><div className="p-1.5 rounded-lg bg-violet-500/10"><Sparkles size={16} className="text-violet-400" /></div><h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>Your 7-Day Plan</h3></div>

      <motion.div variants={cV} initial="hidden" animate="visible" className="space-y-3">
        {schedule.map((day) => {
          const accentColor = day.isRestDay ? "#ef4444" : day.isTestDay ? "#ffffff" : day.sessions[0]?.subjectColor || "var(--border-color)";
          const isPast = day.date < todayISO;
          const isFuture = day.date > todayISO;
          const interactive = day.date >= todayISO && !day.isRestDay && !day.isTestDay;

          return (
            <motion.div key={day.date} variants={iV} className="rounded-xl border p-4 flex gap-3" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", opacity: isPast ? 0.5 : isFuture ? 0.7 : 1 }}>
              <div className="w-[3px] rounded-full shrink-0" style={{ backgroundColor: accentColor }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{day.dayName}</span>
                  <span className="text-xs" style={{ color: "var(--text-faint)" }}>{day.date}</span>
                </div>

                {day.isRestDay && (<div className="flex items-center justify-center gap-2 py-3"><Moon size={16} className="text-red-400" /><span className="text-sm text-red-400 italic">Rest Day</span></div>)}
                {day.isTestDay && !day.isRestDay && (<div className="py-2"><span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Test Day</span></div>)}

                {!day.isRestDay && !day.isTestDay && day.sessions.length > 0 && (
                  <div className="space-y-2">
                    {day.sessions.map((s, i) => {
                      const ch = chapters.find((c) => c.id === s.chapterId);
                      const progress = ch ? calculateSubjectProgress(ch) : 0;
                      const incomplete = ch ? ch.resources.filter((r) => !r.completed) : [];
                      const allDone = incomplete.length === 0;
                      const key = `${day.date}-${s.chapterId}-${i}`;
                      const isExp = expandedKey === key && interactive;

                      return (
                        <div key={key} className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--border-color)" }}>
                          <button onClick={() => interactive && setExpandedKey(isExp ? null : key)} className="w-full p-2.5 text-left" style={{ pointerEvents: interactive ? "auto" : "none" }}>
                            <div className="flex items-center gap-3">
                              {interactive && (
                                <div onClick={(e) => { e.stopPropagation(); if (!allDone && ch) logAll(s.subjectId, s.chapterId); }} className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 cursor-pointer ${allDone ? "bg-emerald-500 border-emerald-500" : "border-[var(--border-strong)]"}`}>
                                  {allDone && <Check size={12} className="text-white" strokeWidth={3} />}
                                </div>
                              )}
                              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.subjectColor }} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm truncate" style={{ color: "var(--text-primary)" }}>{s.chapterName}</p>
                                {s.unit && s.unit !== s.chapterName && <p className="text-[10px] truncate" style={{ color: "var(--text-faint)" }}>{s.unit}</p>}
                              </div>
                              {s.isBoss && <BossBadge size="sm" pulse={false} />}
                              {interactive && <motion.div animate={{ rotate: isExp ? 180 : 0 }}><ChevronDown size={14} style={{ color: "var(--text-faint)" }} /></motion.div>}
                            </div>
                            <div className="h-1 rounded-full mt-1.5 overflow-hidden" style={{ backgroundColor: "var(--bg-tertiary)" }}><div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: s.subjectColor }} /></div>
                          </button>

                          <AnimatePresence>
                            {isExp && ch && (
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                <div className="px-2.5 pb-2.5" style={{ borderTopWidth: 1, borderTopColor: "var(--border-color)" }}>
                                  {allDone ? (
                                    <div className="flex items-center gap-2 py-2"><CheckCircle2 size={12} className="text-emerald-400" /><span className="text-xs text-emerald-400">Complete! 🎉</span></div>
                                  ) : (
                                    <AnimatePresence>
                                      {incomplete.map((r) => {
                                        const rt = getResourceTypeById(r.typeId);
                                        const xp = rt ? (ch.isBoss ? rt.xpValue * 3 : rt.xpValue) : 10;
                                        return (
                                          <motion.div key={r.id} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-2 py-1.5" style={{ borderBottomWidth: 1, borderBottomColor: "var(--border-color)" }}>
                                            <button onClick={() => quickLog(s.subjectId, s.chapterId, r.id)} className="w-4 h-4 rounded border shrink-0" style={{ borderColor: "var(--border-strong)" }} />
                                            <span className="text-xs flex-1" style={{ color: "var(--text-secondary)" }}>{rt?.name || "Resource"}</span>
                                            <span className="text-[9px] font-bold text-emerald-400">+{xp}</span>
                                          </motion.div>
                                        );
                                      })}
                                    </AnimatePresence>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                )}

                {!day.isRestDay && !day.isTestDay && day.sessions.length === 0 && (<p className="text-sm py-2" style={{ color: "var(--text-faint)" }}>Free day — catch up or rest!</p>)}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
export default ScheduleList;

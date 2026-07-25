"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardList, CalendarDays, ChevronDown, CheckCircle2, Check } from "lucide-react";
import { useStudyContext } from "@/contexts/study-context";
import { BossBadge } from "@/components/ui/boss-badge";
import { calculateSubjectProgress, getResourceTypeById } from "@/lib/utils";

export function DailyChecklist() {
  const { schedule, chapters, logSession } = useStudyContext();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showPast, setShowPast] = useState(false);

  const todayISO = new Date().toISOString().split("T")[0];
  const tomorrowISO = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const { todayDay, tomorrowDay, pastDays } = useMemo(() => {
    if (!schedule) return { todayDay: null, tomorrowDay: null, pastDays: [] };
    return {
      todayDay: schedule.find((d) => d.date === todayISO) || null,
      tomorrowDay: schedule.find((d) => d.date === tomorrowISO) || null,
      pastDays: schedule.filter((d) => d.date < todayISO),
    };
  }, [schedule, todayISO, tomorrowISO]);

  const quickLog = useCallback((subjectId: string, chapterId: string, resourceId: string) => {
    logSession(subjectId, chapterId, resourceId, "okay", 2);
  }, [logSession]);

  const logAllIncomplete = useCallback((subjectId: string, chapterId: string) => {
    const ch = chapters.find((c) => c.id === chapterId);
    if (!ch) return;
    ch.resources.filter((r) => !r.completed).forEach((r) => {
      logSession(subjectId, chapterId, r.id, "okay", 2);
    });
  }, [chapters, logSession]);

  if (!schedule) {
    return (
      <div className="rounded-xl p-4 border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}>
        <div className="flex items-center gap-2 mb-3"><ClipboardList size={18} style={{ color: "var(--text-muted)" }} /><h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Today's Plan</h3></div>
        <div className="flex flex-col items-center py-4">
          <CalendarDays size={24} style={{ color: "var(--text-muted)" }} />
          <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>No schedule yet. Generate one in the Planner.</p>
        </div>
      </div>
    );
  }

  const renderSession = (sess: typeof todayDay extends null ? never : NonNullable<typeof todayDay>["sessions"][0], interactive: boolean) => {
    const ch = chapters.find((c) => c.id === sess.chapterId);
    if (!ch) return null;
    const progress = calculateSubjectProgress(ch);
    const incomplete = ch.resources.filter((r) => !r.completed);
    const allDone = incomplete.length === 0;
    const isExpanded = expandedId === sess.chapterId && interactive;

    return (
      <div key={sess.chapterId} className="rounded-xl border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", opacity: interactive ? 1 : 0.5, pointerEvents: interactive ? "auto" : "none" }}>
        <button onClick={() => interactive && setExpandedId(isExpanded ? null : sess.chapterId)} className="w-full p-3 text-left">
          <div className="flex items-center gap-3">
            {/* Parent checkbox */}
            <div onClick={(e) => { e.stopPropagation(); if (interactive && !allDone) logAllIncomplete(sess.subjectId, sess.chapterId); }} className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 cursor-pointer ${allDone ? "bg-emerald-500 border-emerald-500" : incomplete.length < ch.resources.length ? "bg-emerald-500/30 border-emerald-500" : "border-[var(--border-strong)]"}`}>
              {allDone && <Check size={14} className="text-white" strokeWidth={3} />}
              {!allDone && incomplete.length < ch.resources.length && <div className="w-3 h-0.5 bg-emerald-400 rounded" />}
            </div>
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: sess.subjectColor }} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2"><span className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{sess.chapterName}</span>{sess.isBoss && <BossBadge size="sm" pulse={false} />}</div>
              {sess.unit && sess.unit !== sess.chapterName && <p className="text-[10px] uppercase" style={{ color: "var(--text-muted)" }}>{sess.unit}</p>}
            </div>
            <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}><ChevronDown size={16} style={{ color: "var(--text-muted)" }} /></motion.div>
          </div>
          <div className="h-1 rounded-full mt-2 overflow-hidden" style={{ backgroundColor: "var(--bg-tertiary)" }}><div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: sess.subjectColor }} /></div>
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="px-3 pb-3 pt-1" style={{ borderTopWidth: 1, borderTopColor: "var(--border-color)" }}>
                {allDone ? (
                  <div className="flex items-center gap-2 py-2"><CheckCircle2 size={14} className="text-emerald-400" /><span className="text-xs text-emerald-400">All caught up! 🎉</span></div>
                ) : (
                  <AnimatePresence>
                    {incomplete.map((r) => {
                      const rt = getResourceTypeById(r.typeId);
                      const xp = rt ? (ch.isBoss ? rt.xpValue * 3 : rt.xpValue) : 10;
                      return (
                        <motion.div key={r.id} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-3 py-2" style={{ borderBottomWidth: 1, borderBottomColor: "var(--border-color)" }}>
                          <button onClick={() => quickLog(sess.subjectId, sess.chapterId, r.id)} className="w-5 h-5 rounded border-2 shrink-0" style={{ borderColor: "var(--border-strong)" }} />
                          <span className="text-sm flex-1" style={{ color: "var(--text-secondary)" }}>{rt?.name || "Resource"}</span>
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 rounded-full px-2 py-0.5">+{xp} XP</span>
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
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2"><ClipboardList size={18} style={{ color: "var(--text-muted)" }} /><h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Today's Plan</h3></div>

      {todayDay && !todayDay.isRestDay && !todayDay.isTestDay && todayDay.sessions.length > 0 && (
        <div className="space-y-2">{todayDay.sessions.map((s) => renderSession(s, true))}</div>
      )}
      {todayDay && (todayDay.isRestDay || todayDay.isTestDay || todayDay.sessions.length === 0) && (
        <p className="text-sm py-2" style={{ color: "var(--text-muted)" }}>{todayDay.isRestDay ? "Rest day — recharge!" : todayDay.isTestDay ? "Test day — you got this!" : "No sessions planned for today."}</p>
      )}

      {tomorrowDay && tomorrowDay.sessions.length > 0 && (
        <>
          <p className="text-xs font-bold uppercase tracking-wider mt-4 mb-2" style={{ color: "var(--text-muted)" }}>Tomorrow</p>
          <div className="space-y-2">{tomorrowDay.sessions.map((s) => renderSession(s, false))}</div>
        </>
      )}

      {pastDays.length > 0 && (
        <button onClick={() => setShowPast(!showPast)} className="flex items-center justify-between w-full py-2 mt-2">
          <span className="text-xs font-bold uppercase" style={{ color: "var(--text-muted)" }}>Past days</span>
          <span className="text-[10px] rounded-full px-2 py-0.5 border" style={{ backgroundColor: "var(--bg-card-hover)", borderColor: "var(--border-color)", color: "var(--text-muted)" }}>{pastDays.length}</span>
        </button>
      )}
      {showPast && pastDays.map((day) => (
        <div key={day.date} className="text-xs py-1" style={{ color: "var(--text-faint)" }}>
          {day.dayName} · {day.sessions.length} sessions
        </div>
      ))}
    </div>
  );
}
export default DailyChecklist;

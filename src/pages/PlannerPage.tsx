"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { CalendarDays, ArrowLeft, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isToday, addMonths, subMonths, parseISO, differenceInDays } from "date-fns";
import { useStudyContext } from "@/contexts/study-context";
import { SUBJECTS } from "@/lib/constants";

import { ScheduleList } from "@/components/planner/schedule-list";
import type { Test } from "@/lib/types";

const DL = ["Mo","Tu","We","Th","Fr","Sa","Su"];
const TYPE_DOT: Record<Test["type"], { size: string; color: string }> = {
  board: { size: "w-3 h-3", color: "bg-red-500" },
  mock: { size: "w-2 h-2", color: "bg-amber-400" },
  school: { size: "w-1.5 h-1.5", color: "bg-blue-400" },
};
const TYPE_PILL: Record<Test["type"], { bg: string; text: string; label: string }> = {
  board: { bg: "bg-red-500/15", text: "text-red-400", label: "Board" },
  mock: { bg: "bg-amber-400/15", text: "text-amber-400", label: "Mock" },
  school: { bg: "bg-blue-400/15", text: "text-blue-400", label: "School" },
};

interface PlannerPageProps { onBack: () => void; }

export function PlannerPage({ onBack }: PlannerPageProps) {
  const { tests, sessions, revisions, userStats, toggleHoliday, markRevisionDone, setMaxSessionsPerDay, buildSchedule, clearSchedule, schedule } = useStudyContext();
  const holidaySet = useMemo(() => new Set(userStats.holidayDates), [userStats.holidayDates]);
  const [month, setMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const days = useMemo(() => { const ms = startOfMonth(month); const me = endOfMonth(month); const cs = startOfWeek(ms, { weekStartsOn: 1 }); const ce = endOfWeek(me, { weekStartsOn: 1 }); const a: Date[] = []; let d = cs; while (d <= ce) { a.push(d); d = addDays(d, 1); } return a; }, [month]);

  const testDates = useMemo(() => { const m = new Map<string, typeof tests>(); tests.forEach((t) => { const k = t.date; if (!m.has(k)) m.set(k, []); m.get(k)!.push(t); }); return m; }, [tests]);
  const sessionDates = useMemo(() => { const s = new Set<string>(); sessions.forEach((se) => s.add(format(parseISO(se.timestamp), "yyyy-MM-dd"))); return s; }, [sessions]);
  const revisionDates = useMemo(() => { const m = new Map<string, typeof revisions>(); revisions.filter((r) => !r.completed).forEach((r) => { if (!m.has(r.dueDate)) m.set(r.dueDate, []); m.get(r.dueDate)!.push(r); }); return m; }, [revisions]);

  const selTests = useMemo(() => selectedDate ? testDates.get(selectedDate) || [] : [], [selectedDate, testDates]);
  const selSessions = useMemo(() => selectedDate ? sessions.filter((s) => format(parseISO(s.timestamp), "yyyy-MM-dd") === selectedDate) : [], [selectedDate, sessions]);
  const selRevisions = useMemo(() => selectedDate ? revisionDates.get(selectedDate) || [] : [], [selectedDate, revisionDates]);
  const selIsHoliday = selectedDate ? holidaySet.has(selectedDate) : false;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md mx-auto px-4 py-6 pb-24">
        <header className="mb-6">
          <button onClick={onBack} className="flex items-center gap-1 mb-4 -ml-1 min-h-[44px]" style={{ color: "var(--text-muted)" }}><ArrowLeft size={20} /><span className="text-sm font-medium">Back</span></button>
          <div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/20"><CalendarDays size={24} className="text-indigo-400" /></div><div><h1 className="text-2xl font-bold">Planner</h1><p className="text-sm" style={{ color: "var(--text-faint)" }}>Your monthly overview</p></div></div>
        </header>

        {/* Calendar Grid */}
        <div className="rounded-xl p-4 border mb-6" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}>
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setMonth(subMonths(month, 1))} className="p-2 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center" style={{ color: "var(--text-muted)" }}><ChevronLeft size={20} /></button>
            <h3 className="font-semibold">{format(month, "MMMM yyyy")}</h3>
            <button onClick={() => setMonth(addMonths(month, 1))} className="p-2 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center" style={{ color: "var(--text-muted)" }}><ChevronRight size={20} /></button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">{DL.map((d) => <div key={d} className="text-center text-[10px] font-medium py-1" style={{ color: "var(--text-faint)" }}>{d}</div>)}</div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const key = format(day, "yyyy-MM-dd"); const inM = isSameMonth(day, month); const td = isToday(day);
              const dayTests = testDates.get(key) || [];
              const hasSess = sessionDates.has(key); const hasRev = revisionDates.has(key); const isHol = holidaySet.has(key);
              const sel = selectedDate === key;
              return (
                <button key={key} onClick={() => setSelectedDate(key)}
                  className={`relative flex flex-col items-center justify-start pt-1.5 rounded-lg min-h-[48px] transition-colors ${td ? "font-bold" : ""} ${sel ? "ring-1 ring-white" : ""}`}
                  style={{ color: !inM ? "var(--text-faint)" : "var(--text-primary)", backgroundColor: td ? "rgba(255,255,255,0.1)" : "transparent" }}>
                  <span className="text-[11px]">{format(day, "d")}</span>
                  <div className="flex flex-col gap-0.5 mt-auto mb-1 items-center">
                    {dayTests.map((t) => { const td2 = TYPE_DOT[t.type]; return <div key={t.id} className={`${td2.size} rounded-full ${td2.color}`} />; })}
                    {hasRev && <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                    {hasSess && dayTests.length === 0 && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                    {isHol && <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 mt-3 pt-3 flex-wrap" style={{ borderTopWidth: 1, borderTopColor: "var(--border-color)" }}>
            {[["bg-red-500","Board"],["bg-amber-400","Mock"],["bg-blue-400","School"],["bg-emerald-400","Session"],["bg-purple-400","Rest"]].map(([c,l]) => (
              <div key={l} className="flex items-center gap-1"><div className={`w-2 h-2 rounded-full ${c}`} /><span className="text-[10px]" style={{ color: "var(--text-faint)" }}>{l}</span></div>
            ))}
          </div>
        </div>

        {/* Selected Date Detail */}
        {selectedDate && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 rounded-xl p-4 border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}>
            <h4 className="font-semibold mb-3">{format(parseISO(selectedDate), "EEEE, MMMM d")}</h4>

            {selTests.length > 0 && (<div className="mb-3"><p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "var(--text-faint)" }}>Tests</p>{selTests.map((t) => { const s = SUBJECTS.find((x) => x.id === t.subjectId); const dl = differenceInDays(parseISO(t.date), new Date()); const tp = TYPE_PILL[t.type]; return (<div key={t.id} className="flex items-center gap-2 py-1.5"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: s?.color }} /><span className="text-sm font-semibold">{t.name}</span><span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${tp.bg} ${tp.text}`}>{tp.label}</span>{dl >= 0 && <span className="text-xs ml-auto" style={{ color: "var(--text-faint)" }}>{dl === 0 ? "Today" : `${dl}d left`}</span>}{dl < 0 && <span className="text-xs ml-auto" style={{ color: "var(--text-faint)" }}>Completed</span>}</div>); })}</div>)}

            {selRevisions.length > 0 && (<div className="mb-3"><p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "var(--text-faint)" }}>Revisions</p>{selRevisions.map((r) => (<div key={`${r.chapterId}-${r.revisionNumber}`} className="flex items-center justify-between py-1"><span className="text-sm" style={{ color: "var(--text-secondary)" }}>{r.chapterId} R{r.revisionNumber}</span><button onClick={() => markRevisionDone(`${r.chapterId}-${r.revisionNumber}`)} className="text-xs text-cyan-400 bg-cyan-500/20 px-2 py-0.5 rounded">Done</button></div>))}</div>)}

            {selSessions.length > 0 && (<div className="mb-3"><p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "var(--text-faint)" }}>Sessions ({selSessions.length})</p>{selSessions.slice(0, 5).map((se) => { const s = SUBJECTS.find((x) => x.id === se.subjectId); return (<div key={se.id} className="flex items-center gap-2 py-0.5"><div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s?.color }} /><span className="text-xs" style={{ color: "var(--text-muted)" }}>{s?.name} · +{se.xpEarned} XP</span></div>); })}</div>)}

            <button onClick={() => toggleHoliday(selectedDate)} className="w-full py-2 rounded-lg text-sm font-medium border" style={selIsHoliday ? { backgroundColor: "rgba(239,68,68,0.2)", color: "#f87171", borderColor: "rgba(239,68,68,0.3)" } : { backgroundColor: "var(--bg-tertiary)", color: "var(--text-muted)", borderColor: "var(--border-color)" }}>
              {selIsHoliday ? "Remove Rest Day" : "Mark as Rest Day"}
            </button>
          </motion.div>
        )}

        {/* Capacity Toggle */}
        <div className="mb-4"><p className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--text-faint)" }}>Daily sessions target</p>
          <div className="flex gap-2">{[2,3,4,5].map((n) => (<button key={n} onClick={() => setMaxSessionsPerDay(n)} className="flex-1 h-10 rounded-lg font-bold text-sm border" style={userStats.maxSessionsPerDay === n ? { backgroundColor: "var(--btn-primary-bg)", color: "var(--btn-primary-text)", borderColor: "var(--btn-primary-bg)" } : { backgroundColor: "var(--bg-card)", color: "var(--text-muted)", borderColor: "var(--border-color)" }}>{n}</button>))}</div>
        </div>

        <motion.button whileTap={{ scale: 0.98 }} onClick={buildSchedule} className="w-full min-h-[56px] flex items-center justify-center gap-2 font-bold text-lg rounded-xl shadow-lg mb-2" style={{ backgroundColor: "var(--btn-primary-bg)", color: "var(--btn-primary-text)" }}><Sparkles size={20} /> Generate My Schedule</motion.button>
        <p className="text-xs text-center mb-6" style={{ color: "var(--text-faint)" }}>Plan your next 7 days based on your pace and test dates</p>

        {schedule && (<div className="space-y-4"><ScheduleList schedule={schedule} /><button onClick={clearSchedule} className="w-full py-2 text-sm underline" style={{ color: "var(--text-faint)" }}>Clear Schedule</button></div>)}
      </motion.div>
    </div>
  );
}
export default PlannerPage;

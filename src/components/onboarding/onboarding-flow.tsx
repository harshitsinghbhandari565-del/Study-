"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, ChevronUp, ChevronDown, GripVertical, Plus, CheckCircle2, Flame, BarChart3, Calendar, Target, X } from "lucide-react";
import { useStudyContext } from "@/contexts/study-context";
import { SUBJECTS } from "@/lib/constants";
import { Atom, FlaskConical, Calculator, Cpu, Dumbbell, BookOpen } from "lucide-react";

const ICONS: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: number | string }>> = { Atom, FlaskConical, Calculator, Cpu, Dumbbell, BookOpen };
function getIC(n: string) { return ICONS[n] || BookOpen; }

interface OnboardingFlowProps { onComplete: () => void; onOpenLogger: () => void; }

const stepAnim = { initial: { opacity: 0, x: 50 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -50 }, transition: { duration: 0.25 } };

export function OnboardingFlow({ onComplete, onOpenLogger }: OnboardingFlowProps) {
  const { setUserName, setSubjectOrder, addTest, sessions, subjectOrder } = useStudyContext();
  const [step, setStep] = useState<1|2|3|4|5>(1);
  const [name, setName] = useState("");
  const [localOrder, setLocalOrder] = useState<string[]>(subjectOrder);
  const [localTests, setLocalTests] = useState<Array<{ id: string; subjectId: string; name: string; date: string }>>([]);
  const [tSubj, setTSubj] = useState(""); const [tName, setTName] = useState(""); const [tDate, setTDate] = useState("");

  const hasLogged = sessions.length > 0;

  const swap = useCallback((id: string, dir: "up"|"down") => {
    setLocalOrder((p) => { const i = p.indexOf(id); const ni = dir === "up" ? i-1 : i+1; if (ni < 0 || ni >= p.length) return p; const n = [...p]; [n[i], n[ni]] = [n[ni], n[i]]; return n; });
  }, []);

  const addLocalTest = useCallback(() => {
    if (!tSubj || !tName || !tDate) return;
    setLocalTests((p) => [...p, { id: `onb-${Date.now()}`, subjectId: tSubj, name: tName, date: tDate }]);
    setTSubj(""); setTName(""); setTDate("");
  }, [tSubj, tName, tDate]);

  const next = useCallback(() => {
    if (step === 1) { setUserName(name.trim()); }
    if (step === 2) { setSubjectOrder(localOrder); }
    if (step === 3) { localTests.forEach((t) => addTest({ id: t.id, subjectId: t.subjectId, name: t.name, date: t.date, type: "school" })); }
    if (step === 5) { onComplete(); return; }
    setStep((p) => Math.min(5, p + 1) as 1|2|3|4|5);
  }, [step, name, localOrder, localTests, setUserName, setSubjectOrder, addTest, onComplete]);

  const back = useCallback(() => setStep((p) => Math.max(1, p - 1) as 1|2|3|4|5), []);

  const orderedSubs = useMemo(() => { const m = new Map(SUBJECTS.map((s) => [s.id, s])); return localOrder.map((id) => m.get(id)).filter(Boolean) as typeof SUBJECTS; }, [localOrder]);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col overflow-y-auto" style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}>
      {/* Progress bar */}
      <div className="h-1" style={{ backgroundColor: "var(--bg-tertiary)" }}><div className="h-full transition-all duration-300" style={{ width: `${(step / 5) * 100}%`, backgroundColor: "var(--btn-primary-bg)" }} /></div>

      {/* Top bar */}
      <div className="h-14 flex items-center justify-between px-6 shrink-0">
        {step > 1 ? <button onClick={back} className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>Back</button> : <div />}
        <div className="flex gap-1.5">{[1,2,3,4,5].map((s) => (<div key={s} className="w-2 h-2 rounded-full" style={{ backgroundColor: s <= step ? "var(--text-primary)" : "var(--bg-tertiary)" }} />))}</div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="s1" {...stepAnim} className="flex-1 flex flex-col items-center justify-center px-6">
            <User size={48} style={{ color: "var(--text-muted)" }} />
            <h1 className="text-3xl font-bold text-center mt-6">Welcome to STUDYMAP</h1>
            <p className="text-center mt-2" style={{ color: "var(--text-muted)" }}>Your personal learning universe.</p>
            <div className="mt-8 w-full max-w-sm">
              <label className="text-sm font-medium mb-2 block">What should we call you?</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full h-12 px-4 rounded-xl border focus:outline-none" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", color: "var(--text-primary)" }} />
            </div>
            <div className="p-6 w-full max-w-sm mt-auto">
              <button onClick={next} disabled={name.trim().length < 2} className="w-full h-14 rounded-xl font-bold text-base transition-opacity" style={{ backgroundColor: "var(--btn-primary-bg)", color: "var(--btn-primary-text)", opacity: name.trim().length < 2 ? 0.5 : 1 }}>Next</button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="s2" {...stepAnim} className="flex-1 flex flex-col px-6 pt-8 pb-6">
            <h1 className="text-2xl font-bold">Your 6 subjects</h1>
            <p className="text-sm mt-1 mb-4" style={{ color: "var(--text-muted)" }}>Tap arrows to reorder by priority.</p>
            <div className="space-y-2 flex-1">
              {orderedSubs.map((s, i) => { const IC = getIC(s.icon); return (
                <div key={s.id} className="rounded-xl p-3 flex items-center gap-3 border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}>
                  <GripVertical size={16} style={{ color: "var(--text-faint)" }} />
                  <IC size={24} style={{ color: s.color }} />
                  <span className="flex-1 font-medium">{s.name}</span>
                  <div className="flex flex-col gap-0.5">
                    {i > 0 && <button onClick={() => swap(s.id, "up")} className="p-1" style={{ color: "var(--text-muted)" }}><ChevronUp size={18} /></button>}
                    {i < 5 && <button onClick={() => swap(s.id, "down")} className="p-1" style={{ color: "var(--text-muted)" }}><ChevronDown size={18} /></button>}
                  </div>
                </div>
              ); })}
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={back} className="flex-1 h-14 rounded-xl font-medium border" style={{ borderColor: "var(--border-color)" }}>Back</button>
              <button onClick={next} className="flex-1 h-14 rounded-xl font-bold" style={{ backgroundColor: "var(--btn-primary-bg)", color: "var(--btn-primary-text)" }}>Next</button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="s3" {...stepAnim} className="flex-1 flex flex-col px-6 pt-8 pb-6">
            <h1 className="text-2xl font-bold">When are your tests?</h1>
            <p className="text-sm mt-1 mb-4" style={{ color: "var(--text-muted)" }}>Enter at least one date to unlock your Pace Tracker.</p>
            <select value={tSubj} onChange={(e) => setTSubj(e.target.value)} className="w-full h-12 px-3 rounded-xl border mb-2" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", color: "var(--text-primary)" }}><option value="">Select subject...</option>{SUBJECTS.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
            <input value={tName} onChange={(e) => setTName(e.target.value)} placeholder="Test name (e.g., Unit 1)" className="w-full h-12 px-4 rounded-xl border mb-2" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", color: "var(--text-primary)" }} />
            <input type="date" value={tDate} onChange={(e) => setTDate(e.target.value)} className="w-full h-12 px-4 rounded-xl border mb-2 [color-scheme:dark]" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", color: "var(--text-primary)" }} />
            <button onClick={addLocalTest} disabled={!tSubj||!tName||!tDate} className="w-full h-12 rounded-xl font-medium border mb-4 transition-opacity" style={{ backgroundColor: "var(--bg-card-hover)", borderColor: "var(--border-color)", opacity: (!tSubj||!tName||!tDate) ? 0.5 : 1 }}>Add</button>
            <div className="space-y-2 flex-1 overflow-y-auto">
              {localTests.map((t) => { const s = SUBJECTS.find((x) => x.id === t.subjectId); return (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-lg border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: s?.color }} /><span className="text-sm">{t.name}</span><span className="text-xs" style={{ color: "var(--text-faint)" }}>{t.date}</span></div>
                  <button onClick={() => setLocalTests((p) => p.filter((x) => x.id !== t.id))} style={{ color: "var(--text-muted)" }}><X size={16} /></button>
                </div>
              ); })}
            </div>
            {localTests.length === 0 && <p className="text-sm text-amber-400 mb-2">Add at least one test to continue.</p>}
            <div className="flex gap-3 mt-4">
              <button onClick={back} className="flex-1 h-14 rounded-xl font-medium border" style={{ borderColor: "var(--border-color)" }}>Back</button>
              <button onClick={next} disabled={localTests.length === 0} className="flex-1 h-14 rounded-xl font-bold transition-opacity" style={{ backgroundColor: "var(--btn-primary-bg)", color: "var(--btn-primary-text)", opacity: localTests.length === 0 ? 0.5 : 1 }}>Next</button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key="s4" {...stepAnim} className="flex-1 flex flex-col px-6 pt-8 pb-6">
            <h1 className="text-2xl font-bold">Log your first session</h1>
            <p className="text-sm mt-1 mb-6" style={{ color: "var(--text-muted)" }}>Three taps. That's all it takes.</p>
            <div className="flex items-center justify-center gap-4 mb-2">
              {[{ n: "1", l: "Subject" }, { n: "2", l: "Chapter" }, { n: "3", l: "Resource" }].map(({ n, l }) => (
                <div key={n} className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}>{n}</div>
                  <span className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>{l}</span>
                </div>
              ))}
            </div>
            <div className="my-6 h-px" style={{ backgroundColor: "var(--border-color)" }} />
            <p className="text-sm leading-relaxed mb-8" style={{ color: "var(--text-secondary)" }}>Pick a subject. Pick a chapter. Pick what resource you studied. That's it.</p>
            <div className="flex-1 flex flex-col items-center justify-center">
              {hasLogged ? (
                <div className="flex items-center gap-2"><CheckCircle2 size={24} className="text-emerald-400" /><span className="text-emerald-400 font-medium">Session logged!</span></div>
              ) : (
                <button onClick={onOpenLogger} className="h-14 px-8 rounded-xl font-bold text-base flex items-center gap-2" style={{ backgroundColor: "var(--btn-primary-bg)", color: "var(--btn-primary-text)" }}><Plus size={20} />Open Session Logger</button>
              )}
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={back} className="flex-1 h-14 rounded-xl font-medium border" style={{ borderColor: "var(--border-color)" }}>Back</button>
              <button onClick={next} disabled={!hasLogged} className="flex-1 h-14 rounded-xl font-bold transition-opacity" style={{ backgroundColor: "var(--btn-primary-bg)", color: "var(--btn-primary-text)", opacity: hasLogged ? 1 : 0.5 }}>Next</button>
            </div>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div key="s5" {...stepAnim} className="flex-1 flex flex-col px-6 pt-8 pb-6">
            <h1 className="text-2xl font-bold">This is your command center</h1>
            <p className="text-sm mt-1 mb-6" style={{ color: "var(--text-muted)" }}>Here's everything at a glance.</p>
            <div className="space-y-3 flex-1">
              {[
                { icon: Flame, color: "#fbbf24", text: "Streak Counter — Don't break the chain." },
                { icon: BarChart3, color: "#3b82f6", text: "Subject Overview — Your progress across all subjects." },
                { icon: Calendar, color: "#ef4444", text: "Test Countdown — Days left until your next test." },
                { icon: Plus, color: "var(--text-primary)", text: "Log Session — One tap to record your work." },
                { icon: Target, color: "#8b5cf6", text: "Pace Tracker — Are you on track?" },
              ].map(({ icon: IC, color, text }, i) => (
                <div key={i} className="flex items-center gap-3 p-4 rounded-xl border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}>
                  <IC size={20} style={{ color }} />
                  <span className="text-sm">{text}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={back} className="flex-1 h-14 rounded-xl font-medium border" style={{ borderColor: "var(--border-color)" }}>Back</button>
              <button onClick={next} className="flex-1 h-14 rounded-xl font-bold" style={{ backgroundColor: "var(--btn-primary-bg)", color: "var(--btn-primary-text)" }}>Finish</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
export default OnboardingFlow;

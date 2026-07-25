"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeft, Atom, FlaskConical, Calculator, Cpu, Dumbbell, BookOpen, Flame, Meh, BatteryLow, Check, ChevronRight, AlertCircle, Zap, Clock } from "lucide-react";
import { useStudyContext } from "@/contexts/study-context";
import { SUBJECTS, RESOURCE_TYPES } from "@/lib/constants";
import { calculateSubjectProgress } from "@/lib/utils";
import { BossBadge } from "@/components/ui/boss-badge";
import { ConfidenceRating } from "@/components/ui/confidence-rating";
import type { SessionMood, ConfidenceLevel } from "@/lib/types";

const ICON_MAP: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: number | string }>> = { Atom, FlaskConical, Calculator, Cpu, Dumbbell, BookOpen };
function getSubjectIcon(n: string) { return ICON_MAP[n] || BookOpen; }

interface SessionLoggerProps { isOpen: boolean; onClose: () => void; }
type Step = 1 | 2 | 3 | 4;

const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } };
const modalVariants = { hidden: { opacity: 0, scale: 0.95, y: 20 }, visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring" as const, damping: 25, stiffness: 300 } }, exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.15 } } };
const cardStaggerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const cardItemVariants = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.2 } } };

export function SessionLogger({ isOpen, onClose }: SessionLoggerProps) {
  const { chapters, logSession, updateSessionDuration, settings } = useStudyContext();
  const moodEnabled = settings.moodLogging;
  const totalSteps = 3; // Subject, Chapter, Log (Resource + optional mood + confidence)

  const [step, setStep] = useState<Step>(1);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<SessionMood | null>(moodEnabled ? null : "okay");
  const [selectedConfidence, setSelectedConfidence] = useState<ConfidenceLevel>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const lastSessionIdRef = useRef<string | null>(null);

  const resetState = useCallback(() => { setStep(1); setDirection(1); setSelectedSubjectId(null); setSelectedChapterId(null); setSelectedResourceId(null); setSelectedMood(moodEnabled ? null : "okay"); setSelectedConfidence(0); setIsSubmitting(false); setEarnedXP(0); lastSessionIdRef.current = null; }, [moodEnabled]);
  useEffect(() => { if (!isOpen) { const t = setTimeout(resetState, 200); return () => clearTimeout(t); } }, [isOpen, resetState]);

  const subjectChapters = useMemo(() => selectedSubjectId ? chapters.filter((ch) => ch.subjectId === selectedSubjectId) : [], [chapters, selectedSubjectId]);
  const selectedChapter = useMemo(() => selectedChapterId ? chapters.find((ch) => ch.id === selectedChapterId) || null : null, [chapters, selectedChapterId]);
  const selectedSubject = useMemo(() => selectedSubjectId ? SUBJECTS.find((s) => s.id === selectedSubjectId) || null : null, [selectedSubjectId]);
  const canSubmit = useMemo(() => selectedSubjectId && selectedChapterId && selectedResourceId && selectedMood && selectedConfidence > 0 && !isSubmitting, [selectedSubjectId, selectedChapterId, selectedResourceId, selectedMood, selectedConfidence, isSubmitting]);

  const handleSelectSubject = useCallback((id: string) => { setSelectedSubjectId(id); setDirection(1); setStep(2); }, []);
  const handleSelectChapter = useCallback((id: string) => { setSelectedChapterId(id); setDirection(1); setStep(3); }, []);
  const handleBack = useCallback(() => { setDirection(-1); if (step === 2) { setStep(1); setSelectedSubjectId(null); } else if (step === 3) { setStep(2); setSelectedChapterId(null); setSelectedResourceId(null); setSelectedMood(moodEnabled ? null : "okay"); setSelectedConfidence(0); } }, [step, moodEnabled]);
  const handleClose = useCallback(() => onClose(), [onClose]);
  const handleBackdropClick = useCallback((e: React.MouseEvent) => { if (e.target === e.currentTarget) handleClose(); }, [handleClose]);

  const handleSubmit = useCallback(() => {
    if (!canSubmit || !selectedSubjectId || !selectedChapterId || !selectedResourceId || !selectedMood) return;
    setIsSubmitting(true);
    try {
      logSession(selectedSubjectId, selectedChapterId, selectedResourceId, selectedMood, selectedConfidence);
      const ch = chapters.find((c) => c.id === selectedChapterId);
      const res = ch?.resources.find((r) => r.id === selectedResourceId);
      const rt = res ? RESOURCE_TYPES.find((t) => t.id === res.typeId) : null;
      let xp = rt?.xpValue || 15; if (ch?.isBoss) xp *= 3;
      setEarnedXP(xp);
      lastSessionIdRef.current = `session-${Date.now()}`;
      setDirection(1); setStep(4); setIsSubmitting(false);
    } catch { setIsSubmitting(false); }
  }, [canSubmit, selectedSubjectId, selectedChapterId, selectedResourceId, selectedMood, selectedConfidence, logSession, chapters]);

  const handleDuration = useCallback((mins: number) => { updateSessionDuration(lastSessionIdRef.current || "", mins); handleClose(); }, [updateSessionDuration, handleClose]);

  const stepVariants = { enter: (dir: number) => ({ x: dir > 0 ? 50 : -50, opacity: 0 }), center: { x: 0, opacity: 1 }, exit: (dir: number) => ({ x: dir > 0 ? -50 : 50, opacity: 0 }) };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div variants={backdropVariants} initial="hidden" animate="visible" exit="exit" onClick={handleBackdropClick} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit" onClick={(e) => e.stopPropagation()} className="w-full max-w-md border rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col" style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-color)" }}>
            {step < 4 && (
              <div className="flex items-center justify-between px-4 py-3" style={{ borderBottomWidth: 1, borderBottomColor: "var(--border-color)" }}>
                {step > 1 ? (<motion.button whileTap={{ scale: 0.9 }} onClick={handleBack} className="p-2 -ml-2 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center" style={{ color: "var(--text-muted)" }}><ArrowLeft size={20} /></motion.button>) : (<div className="w-[44px]" />)}
                <div className="flex items-center gap-2">{[1,2,3].map((s) => (<motion.div key={s} initial={false} animate={{ scale: s === step ? 1.2 : 1, backgroundColor: s <= step ? "var(--text-primary)" : "var(--text-faint)" }} className="w-2 h-2 rounded-full" />))}</div>
                <motion.button whileTap={{ scale: 0.9 }} onClick={handleClose} className="p-2 -mr-2 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center" style={{ color: "var(--text-muted)" }}><X size={20} /></motion.button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait" custom={direction}>
                {step === 1 && (
                  <motion.div key="step-1" custom={direction} variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }} className="p-4">
                    <div className="mb-4"><p className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--text-faint)" }}>Step 1 of {totalSteps}</p><h2 className="text-xl font-bold">Select Subject</h2></div>
                    <motion.div variants={cardStaggerVariants} initial="hidden" animate="visible" className="grid grid-cols-2 gap-3">
                      {SUBJECTS.map((s) => { const IC = getSubjectIcon(s.icon); return (<motion.button key={s.id} variants={cardItemVariants} whileTap={{ scale: 0.97 }} onClick={() => handleSelectSubject(s.id)} className="flex flex-col items-center gap-2 p-4 rounded-xl border min-h-[100px]" style={{ backgroundColor: "var(--bg-card)", borderColor: selectedSubjectId === s.id ? s.color : "var(--border-color)" }}><div className="p-3 rounded-xl" style={{ backgroundColor: `${s.color}15` }}><IC size={28} style={{ color: s.color }} /></div><span className="text-sm font-medium">{s.name}</span></motion.button>); })}
                    </motion.div>
                  </motion.div>
                )}

                {step === 2 && selectedSubject && (
                  <motion.div key="step-2" custom={direction} variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }} className="p-4">
                    <div className="mb-4"><p className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--text-faint)" }}>Step 2 of {totalSteps}</p><h2 className="text-xl font-bold">Select Chapter</h2><p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{selectedSubject.name}</p></div>
                    <motion.div variants={cardStaggerVariants} initial="hidden" animate="visible" className="space-y-2">
                      {subjectChapters.map((ch) => { const p = calculateSubjectProgress(ch); const nr = ch.confidence === 1; return (<motion.button key={ch.id} variants={cardItemVariants} whileTap={{ scale: 0.98 }} onClick={() => handleSelectChapter(ch.id)} className="w-full flex items-center gap-3 p-4 rounded-xl border text-left min-h-[64px]" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}><div className="flex-1 min-w-0"><div className="flex items-center gap-2"><span className="font-medium truncate">{ch.name}</span>{ch.isBoss && <BossBadge size="sm" pulse={false} />}{nr && <span className="flex items-center gap-1 text-[10px] text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded"><AlertCircle size={10} />Needs redo</span>}</div><p className="text-xs mt-0.5" style={{ color: "var(--text-faint)" }}>{p}% complete · {ch.sessionsCount} sessions</p></div><ChevronRight size={18} style={{ color: "var(--text-faint)" }} /></motion.button>); })}
                    </motion.div>
                  </motion.div>
                )}

                {step === 3 && selectedChapter && selectedSubject && (
                  <motion.div key="step-3" custom={direction} variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }} className="p-4 pb-6">
                    <div className="mb-4"><p className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--text-faint)" }}>Step 3 of {totalSteps}</p><h2 className="text-xl font-bold">Log Session</h2><p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{selectedSubject.name} → {selectedChapter.name}</p></div>

                    <div className="mb-6"><h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Zap size={14} className="text-amber-400" />Select Resource</h3>
                      <div className="grid grid-cols-2 gap-2">{RESOURCE_TYPES.map((r) => { const isSel = selectedResourceId === r.id; const cr = selectedChapter.resources.find((x) => x.typeId === r.id); const done = cr?.completed || false; const rid = cr?.id || `${selectedChapter.id}-resource-${r.id}`; const xv = selectedChapter.isBoss ? r.xpValue * 3 : r.xpValue; return (<motion.button key={r.id} whileTap={{ scale: 0.97 }} onClick={() => setSelectedResourceId(rid)} className={`relative flex flex-col p-3 rounded-xl border min-h-[70px] ${done ? "opacity-60" : ""}`} style={{ backgroundColor: isSel ? "var(--bg-tertiary)" : "var(--bg-card)", borderColor: isSel ? "var(--text-primary)" : "var(--border-color)" }}><span className="text-sm font-medium">{r.name}</span><div className="flex items-center gap-2 mt-1"><span className="text-xs text-emerald-400">+{xv} XP</span>{done && <span className="flex items-center gap-0.5 text-[10px] text-emerald-500"><Check size={10} />Done</span>}</div><div className="flex gap-0.5 mt-1.5">{Array.from({ length: 5 }).map((_, i) => (<div key={i} className={`w-1.5 h-1.5 rounded-full ${i < r.difficulty ? "bg-amber-400" : ""}`} style={i >= r.difficulty ? { backgroundColor: "var(--bg-tertiary)" } : {}} />))}</div></motion.button>); })}</div>
                    </div>

                    {moodEnabled && (
                      <div className="mb-6"><h3 className="text-sm font-semibold mb-3">How are you feeling?</h3>
                        <div className="grid grid-cols-3 gap-2">{[{ mood: "locked-in" as SessionMood, icon: Flame, label: "Locked In", color: "text-orange-400", bg: "bg-orange-500/10" }, { mood: "okay" as SessionMood, icon: Meh, label: "Okay", color: "text-blue-400", bg: "bg-blue-500/10" }, { mood: "low" as SessionMood, icon: BatteryLow, label: "Low", color: "text-zinc-400", bg: "bg-zinc-500/10" }].map(({ mood, icon: Icon, label, color, bg }) => { const sel = selectedMood === mood; return (<motion.button key={mood} whileTap={{ scale: 0.95 }} onClick={() => setSelectedMood(mood)} className={`flex flex-col items-center gap-2 p-4 rounded-xl border min-h-[80px] ${sel ? `${bg} border-current ${color}` : ""}`} style={sel ? {} : { backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}><Icon size={24} className={sel ? color : ""} style={sel ? {} : { color: "var(--text-faint)" }} /><span className={`text-xs font-medium ${sel ? color : ""}`} style={sel ? {} : { color: "var(--text-muted)" }}>{label}</span></motion.button>); })}</div>
                      </div>
                    )}

                    <div className="mb-6"><h3 className="text-sm font-semibold mb-3">How well do you know this chapter?</h3><div className="flex justify-center p-4 rounded-xl border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}><ConfidenceRating value={selectedConfidence} onChange={(v) => setSelectedConfidence(v)} size="lg" readOnly={false} /></div></div>

                    <motion.button whileTap={canSubmit ? { scale: 0.98 } : {}} onClick={handleSubmit} disabled={!canSubmit} className="w-full min-h-[56px] flex items-center justify-center gap-2 rounded-xl font-bold text-lg" style={{ backgroundColor: canSubmit ? "var(--btn-primary-bg)" : "var(--bg-tertiary)", color: canSubmit ? "var(--btn-primary-text)" : "var(--text-faint)", cursor: canSubmit ? "pointer" : "not-allowed" }}>{isSubmitting ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-5 h-5 border-2 rounded-full" style={{ borderColor: "var(--text-faint)", borderTopColor: "var(--text-primary)" }} /> : <><Zap size={20} />LOG IT</>}</motion.button>
                    {!canSubmit && <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mt-3 text-center"><p className="text-xs" style={{ color: "var(--text-faint)" }}>{!selectedResourceId ? "Select a resource" : !selectedMood ? "Select your mood" : selectedConfidence === 0 ? "Rate your confidence" : ""}</p></motion.div>}
                  </motion.div>
                )}

                {step === 4 && selectedSubject && (
                  <motion.div key="step-4" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ type: "spring" as const, damping: 20, stiffness: 300 }} className="p-6 flex flex-col items-center justify-center min-h-[400px]">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: "spring" as const, stiffness: 400 }} className="text-6xl font-black mb-2" style={{ color: selectedSubject.color }}>+{earnedXP}</motion.div>
                    <p className="text-xl font-bold mb-1">XP Earned!</p>
                    <p className="text-sm mb-8" style={{ color: "var(--text-faint)" }}>Session logged successfully</p>
                    <div className="w-full">
                      <div className="flex items-center gap-2 mb-3 justify-center"><Clock size={16} style={{ color: "var(--text-muted)" }} /><p className="text-sm" style={{ color: "var(--text-muted)" }}>How long was your session?</p></div>
                      <div className="grid grid-cols-4 gap-2 mb-4">
                        {[{ label: "30 min", value: 30 }, { label: "1 hr", value: 60 }, { label: "1.5 hr", value: 90 }, { label: "2+ hr", value: 120 }].map(({ label, value }) => (
                          <motion.button key={value} whileTap={{ scale: 0.95 }} onClick={() => handleDuration(value)} className="py-3 rounded-xl border text-sm font-semibold min-h-[48px]" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}>{label}</motion.button>
                        ))}
                      </div>
                      <button onClick={handleClose} className="w-full py-2 text-sm font-medium" style={{ color: "var(--text-faint)" }}>Skip</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
export default SessionLogger;

"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, ArrowLeft, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { format, differenceInDays, parseISO } from "date-fns";
import { useStudyContext } from "@/contexts/study-context";
import { SUBJECTS } from "@/lib/constants";
import { formatStudyDate } from "@/lib/utils";
import type { Test } from "@/lib/types";

const TYPE_STYLES: Record<Test["type"], { bg: string; text: string; label: string }> = {
  board: { bg: "bg-red-500/15", text: "text-red-400", label: "Board" },
  mock: { bg: "bg-amber-400/15", text: "text-amber-400", label: "Mock" },
  school: { bg: "bg-blue-400/15", text: "text-blue-400", label: "School" },
};

interface TestsPageProps { onBack: () => void; }

export function TestsPage({ onBack }: TestsPageProps) {
  const { tests, addTest, deleteTest } = useStudyContext();
  const [showForm, setShowForm] = useState(false);
  const [fSubj, setFSubj] = useState(""); const [fName, setFName] = useState("");
  const [fDate, setFDate] = useState(format(new Date(), "yyyy-MM-dd")); const [fNotes, setFNotes] = useState("");
  const [fType, setFType] = useState<Test["type"]>("school");

  const sorted = useMemo(() => [...tests].sort((a, b) => a.date.localeCompare(b.date)), [tests]);
  const valid = fSubj && fName && fDate;

  const handleAdd = useCallback(() => {
    if (!valid) return;
    addTest({ id: `test-${Date.now()}`, subjectId: fSubj, name: fName, date: fDate, type: fType, notes: fNotes || undefined });
    setFSubj(""); setFName(""); setFNotes(""); setFType("school"); setShowForm(false);
  }, [valid, fSubj, fName, fDate, fNotes, fType, addTest]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md mx-auto px-4 py-6 pb-24">
        <header className="mb-6">
          <button onClick={onBack} className="flex items-center gap-1 mb-4 -ml-1 min-h-[44px]" style={{ color: "var(--text-muted)" }}><ArrowLeft size={20} /><span className="text-sm font-medium">Back</span></button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/20"><Calendar size={24} className="text-rose-400" /></div>
              <div><h1 className="text-2xl font-bold">Upcoming Tests</h1><p className="text-sm" style={{ color: "var(--text-faint)" }}>Stay ahead of your schedule</p></div>
            </div>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowForm(true)} className="flex items-center gap-1 px-3 py-2 font-semibold text-sm rounded-lg" style={{ backgroundColor: "var(--btn-primary-bg)", color: "var(--btn-primary-text)" }}><Plus size={16} />Add</motion.button>
          </div>
        </header>

        <AnimatePresence>{showForm && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-6">
            <div className="rounded-xl p-4 border space-y-3" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}>
              <select value={fSubj} onChange={(e) => setFSubj(e.target.value)} className="w-full px-3 py-3 rounded-lg text-sm focus:outline-none min-h-[48px]" style={{ backgroundColor: "var(--bg-tertiary)", borderWidth: 1, borderColor: "var(--border-color)", color: "var(--text-primary)" }}><option value="">Select Subject...</option>{SUBJECTS.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
              <input type="text" value={fName} onChange={(e) => setFName(e.target.value)} placeholder="Test name, e.g. Unit Test 3" className="w-full px-3 py-3 rounded-lg text-sm focus:outline-none" style={{ backgroundColor: "var(--bg-tertiary)", borderWidth: 1, borderColor: "var(--border-color)", color: "var(--text-primary)" }} />

              {/* Type selector */}
              <div>
                <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>Type</p>
                <div className="flex gap-2">
                  {(["board", "mock", "school"] as const).map((t) => (
                    <button key={t} onClick={() => setFType(t)} className="flex-1 h-12 rounded-xl font-bold text-sm capitalize transition-colors border" style={fType === t ? { backgroundColor: "var(--btn-primary-bg)", color: "var(--btn-primary-text)", borderColor: "var(--btn-primary-bg)" } : { backgroundColor: "var(--bg-card)", color: "var(--text-muted)", borderColor: "var(--border-color)" }}>
                      {t === "board" ? "Board" : t === "mock" ? "Mock" : "School"}
                    </button>
                  ))}
                </div>
              </div>

              <input type="date" value={fDate} onChange={(e) => setFDate(e.target.value)} className="w-full px-3 py-3 rounded-lg text-sm focus:outline-none [color-scheme:dark]" style={{ backgroundColor: "var(--bg-tertiary)", borderWidth: 1, borderColor: "var(--border-color)", color: "var(--text-primary)" }} />
              <textarea value={fNotes} onChange={(e) => setFNotes(e.target.value)} placeholder="Notes (optional)" rows={2} className="w-full px-3 py-3 rounded-lg text-sm focus:outline-none resize-none" style={{ backgroundColor: "var(--bg-tertiary)", borderWidth: 1, borderColor: "var(--border-color)", color: "var(--text-primary)" }} />
              <div className="flex gap-2">
                <motion.button whileTap={valid ? { scale: 0.98 } : {}} onClick={handleAdd} disabled={!valid} className="flex-1 py-3 rounded-lg font-semibold text-sm" style={{ backgroundColor: valid ? "var(--btn-primary-bg)" : "var(--bg-tertiary)", color: valid ? "var(--btn-primary-text)" : "var(--text-faint)", cursor: valid ? "pointer" : "not-allowed" }}>Add Test</motion.button>
                <button onClick={() => setShowForm(false)} className="px-4 py-3 text-sm" style={{ color: "var(--text-faint)" }}>Cancel</button>
              </div>
            </div>
          </motion.div>
        )}</AnimatePresence>

        {sorted.length === 0 ? (
          <div className="rounded-xl p-8 text-center border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}><Calendar size={40} className="mx-auto mb-3" style={{ color: "var(--text-faint)" }} /><p className="text-sm" style={{ color: "var(--text-faint)" }}>No tests scheduled.</p><p className="text-xs mt-1" style={{ color: "var(--text-faint)" }}>Add one and stay ahead.</p></div>
        ) : (
          <div className="space-y-2">{sorted.map((t) => {
            const subj = SUBJECTS.find((s) => s.id === t.subjectId); const dl = differenceInDays(parseISO(t.date), new Date());
            const cc = dl < 3 ? "text-red-400 bg-red-500/10" : dl <= 7 ? "text-amber-400 bg-amber-500/10" : "text-emerald-400 bg-emerald-500/10";
            const past = dl < 0;
            const ts = TYPE_STYLES[t.type];
            return (<motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`rounded-xl p-4 border ${past ? "opacity-50" : ""}`} style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}>
              <div className="flex items-start gap-3">
                <div className="w-2 min-h-[40px] rounded-full shrink-0 mt-1" style={{ backgroundColor: subj?.color || "#71717a" }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-semibold text-sm">{t.name}</p>
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${ts.bg} ${ts.text}`}>{ts.label}</span>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-faint)" }}>{subj?.name} · {formatStudyDate(t.date)}</p>
                  {t.notes && <p className="text-xs mt-1" style={{ color: "var(--text-faint)" }}>{t.notes}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {t.reflection && <CheckCircle2 size={14} className="text-emerald-400" />}
                  {!past && <span className={`text-xs font-medium px-2 py-1 rounded-md ${cc}`}>{dl === 0 ? "Today!" : `${dl}d`}</span>}
                  {past && <span className="text-xs" style={{ color: "var(--text-faint)" }}>Done</span>}
                  <button onClick={() => deleteTest(t.id)} className="p-1.5 hover:text-red-400 transition-colors rounded" style={{ color: "var(--text-faint)" }}><Trash2 size={14} /></button>
                </div>
              </div>
            </motion.div>);
          })}</div>
        )}
      </motion.div>
    </div>
  );
}
export default TestsPage;

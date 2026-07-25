"use client";

import { motion } from "framer-motion";
import { Atom, FlaskConical, Calculator, Cpu, Dumbbell, BookOpen, AlertTriangle } from "lucide-react";
import { useStudyContext } from "@/contexts/study-context";
import { SubjectPressure } from "@/components/dashboard/subject-pressure";
import type { Subject } from "@/lib/types";

const ICON_MAP: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: number | string }>> = { Atom, FlaskConical, Calculator, Cpu, Dumbbell, BookOpen };
function getSubjectIcon(n: string) { return ICON_MAP[n] || BookOpen; }

interface SubjectProgress { subject: Subject; progress: number; level: number; xp: number; isLow: boolean; }
interface SubjectOverviewProps { subjectsProgress: SubjectProgress[]; }

const cV = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const iV = { hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" as const } } };

export function SubjectOverview({ subjectsProgress }: SubjectOverviewProps) {
  const { tests } = useStudyContext();
  return (
    <div className="w-full">
      <h2 className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-3">Subject Progress</h2>
      <motion.div variants={cV} initial="hidden" animate="visible" className="space-y-2">
        {subjectsProgress.map(({ subject, progress, level, xp, isLow }) => {
          const IC = getSubjectIcon(subject.icon);
          const hi = progress >= 50;
          return (
            <motion.div key={subject.id} variants={iV} className={`flex items-center gap-3 p-3 rounded-xl bg-zinc-900 border min-h-[64px] ${hi ? "border-zinc-700/50" : "border-zinc-800"}`} style={{ boxShadow: hi ? `0 0 20px ${subject.color}15` : undefined }}>
              <div className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0" style={{ backgroundColor: `${subject.color}20` }}><IC size={22} style={{ color: subject.color }} /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-medium text-zinc-100 truncate text-sm">{subject.name}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0" style={{ backgroundColor: `${subject.color}20`, color: subject.color }}>Lv.{level}</span>
                  <SubjectPressure subjectId={subject.id} tests={tests} subjectColor={subject.color} />
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, progress)}%` }} transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }} className="h-full rounded-full" style={{ backgroundColor: subject.color }} /></div>
                <p className="text-[10px] text-zinc-500 mt-1">{xp.toLocaleString()} XP</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {isLow && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500 }}><AlertTriangle size={16} className="text-amber-400" /></motion.div>}
                <span className={`text-sm font-semibold tabular-nums ${progress >= 50 ? "text-zinc-100" : "text-zinc-400"}`}>{progress}%</span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
export default SubjectOverview;

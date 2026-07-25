"use client";

import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Atom, FlaskConical, Calculator, Cpu, Dumbbell, BookOpen } from "lucide-react";
import type { Subject } from "@/lib/types";

const ICON_MAP: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: number | string }>> = { Atom, FlaskConical, Calculator, Cpu, Dumbbell, BookOpen };
function getIcon(n: string) { return ICON_MAP[n] || BookOpen; }

interface SubjectProgressItem { subject: Subject; progress: number; level: number; xp: number; isLow: boolean; }

interface OtherSubjectsDrawerProps {
  subjectsProgress: SubjectProgressItem[];
  activeSubjectId: string;
  children: ReactNode;
}

export function OtherSubjectsDrawer({ subjectsProgress, activeSubjectId, children }: OtherSubjectsDrawerProps) {
  const [expanded, setExpanded] = useState(false);
  const others = subjectsProgress.filter((sp) => sp.subject.id !== activeSubjectId);

  return (
    <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-3">
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between min-h-[44px]">
        <span className="text-sm font-semibold text-zinc-400">Other Subjects</span>
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={18} className="text-zinc-500" />
        </motion.div>
      </button>

      {/* Collapsed: tiny icons row */}
      {!expanded && (
        <div className="flex items-center justify-around mt-2">
          {others.map((sp) => {
            const IC = getIcon(sp.subject.icon);
            return (
              <div key={sp.subject.id} className="flex flex-col items-center gap-1">
                <IC size={16} style={{ color: sp.subject.color }} />
                <div className="w-8 h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${Math.max(2, sp.progress)}%`, backgroundColor: sp.subject.color }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Expanded: full children */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3 border-t border-zinc-800">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
export default OtherSubjectsDrawer;

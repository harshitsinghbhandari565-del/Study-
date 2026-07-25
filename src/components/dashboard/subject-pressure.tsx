"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { differenceInDays, parseISO, format } from "date-fns";
import type { Test } from "@/lib/types";

interface SubjectPressureProps { subjectId: string; tests: Test[]; subjectColor: string; }

export function SubjectPressure({ subjectId, tests, subjectColor }: SubjectPressureProps) {
  const info = useMemo(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    const upcoming = tests.filter((t) => t.subjectId === subjectId && t.date >= today).sort((a, b) => a.date.localeCompare(b.date));
    if (upcoming.length === 0) return null;
    const days = differenceInDays(parseISO(upcoming[0].date), new Date());
    return { days, name: upcoming[0].name };
  }, [subjectId, tests]);

  if (!info || info.days > 90) return null;

  const color = info.days < 7 ? "text-red-400" : info.days <= 30 ? "text-orange-400" : info.days <= 60 ? "text-amber-400" : "text-emerald-400";
  const pulse = info.days < 7;

  return (
    <motion.span
      animate={pulse ? { scale: [1, 1.05, 1] } : {}}
      transition={pulse ? { duration: 1.5, repeat: Infinity } : {}}
      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded ${color}`}
      style={{ backgroundColor: `${subjectColor}15` }}
    >
      {info.days}d
    </motion.span>
  );
}
export default SubjectPressure;

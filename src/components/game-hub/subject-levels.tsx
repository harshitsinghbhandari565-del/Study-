"use client";

/**
 * STUDYMAP — Subject Levels
 *
 * Displays level progress bars for each of the 6 subjects.
 * Shows current level, XP progress, and title for each subject.
 */

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Atom,
  FlaskConical,
  Calculator,
  Cpu,
  Dumbbell,
  BookOpen,
} from "lucide-react";

import { SUBJECTS } from "@/lib/constants";
import { calculateLevel } from "@/lib/utils";
import type { Subject, Chapter } from "@/lib/types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface SubjectWithProgress {
  id: string;
  name?: string;
  color?: string;
  icon?: string;
  progress: number;
  level: number;
  totalXP: number;
}

interface SubjectLevelsProps {
  /** Subjects with progress from context, or raw subjects */
  subjectsWithProgress?: SubjectWithProgress[];
  /** Raw subjects (if not using subjectsWithProgress) */
  subjects?: Subject[];
  /** Chapters for calculating XP (if using raw subjects) */
  chapters?: Chapter[];
}

// ─── Icon Mapping ─────────────────────────────────────────────────────────────

const SUBJECT_ICONS: Record<
  string,
  React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: number | string }>
> = {
  Atom,
  FlaskConical,
  Calculator,
  Cpu,
  Dumbbell,
  BookOpen,
};

function getSubjectIcon(iconName: string) {
  return SUBJECT_ICONS[iconName] || BookOpen;
}

// ─── Animation Variants ───────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
    },
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * SubjectLevels
 *
 * Renders horizontal progress bars for each subject showing level progress.
 */
export function SubjectLevels({
  subjectsWithProgress,
  chapters,
}: SubjectLevelsProps) {
  /**
   * Compute subject data from either subjectsWithProgress or raw subjects + chapters
   */
  const subjectData = useMemo(() => {
    if (subjectsWithProgress && subjectsWithProgress.length > 0) {
      // Use provided subjectsWithProgress
      return SUBJECTS.map((subject) => {
        const progress = subjectsWithProgress.find((sp) => sp.id === subject.id);
        const totalXP = progress?.totalXP || 0;
        const levelInfo = calculateLevel(totalXP);

        return {
          subject,
          totalXP,
          level: levelInfo.level,
          title: levelInfo.title,
          progressPercent: levelInfo.progressPercent,
          xpToNext: levelInfo.xpToNext,
        };
      });
    }

    // Fallback: compute from chapters
    return SUBJECTS.map((subject) => {
      const subjectChapters = chapters?.filter((ch) => ch.subjectId === subject.id) || [];
      const totalXP = subjectChapters.reduce((sum, ch) => sum + ch.xpEarned, 0);
      const levelInfo = calculateLevel(totalXP);

      return {
        subject,
        totalXP,
        level: levelInfo.level,
        title: levelInfo.title,
        progressPercent: levelInfo.progressPercent,
        xpToNext: levelInfo.xpToNext,
      };
    });
  }, [subjectsWithProgress, chapters]);

  /**
   * Sort by total XP descending
   */
  const sortedSubjects = useMemo(() => {
    return [...subjectData].sort((a, b) => b.totalXP - a.totalXP);
  }, [subjectData]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-lg bg-purple-500/10">
          <GraduationCap size={16} className="text-purple-400" />
        </div>
        <h3 className="font-semibold text-zinc-100">Subject Mastery</h3>
      </div>

      {/* Subject Progress Bars */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        {sortedSubjects.map(({ subject, totalXP, level, title, progressPercent, xpToNext }) => {
          const IconComponent = getSubjectIcon(subject.icon);
          // Show minimum 2% for visibility when empty
          const displayPercent = totalXP === 0 ? 2 : progressPercent;

          return (
            <motion.div key={subject.id} variants={itemVariants}>
              {/* Label Row */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <IconComponent
                    size={14}
                    style={{ color: subject.color }}
                  />
                  <span className="text-sm font-medium text-zinc-200">
                    {subject.name}
                  </span>
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                    style={{
                      backgroundColor: `${subject.color}20`,
                      color: subject.color,
                    }}
                  >
                    Lv.{level}
                  </span>
                  <span className="text-[10px] text-zinc-500">
                    {title}
                  </span>
                </div>
                <span className="text-xs text-zinc-400 tabular-nums">
                  {totalXP.toLocaleString()} XP
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${displayPercent}%` }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: subject.color,
                    opacity: totalXP === 0 ? 0.3 : 1,
                  }}
                />
              </div>

              {/* XP to Next */}
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-zinc-600">
                  {progressPercent}% to Lv.{level + 1}
                </span>
                <span className="text-[10px] text-zinc-500">
                  {xpToNext > 0 ? `${xpToNext} XP needed` : "MAX LEVEL"}
                </span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}

export default SubjectLevels;

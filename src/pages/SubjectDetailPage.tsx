"use client";

/**
 * STUDYMAP — Subject Detail Page
 *
 * Displays a single subject's chapters with full resource management,
 * confidence ratings, and session logging capabilities.
 *
 * Chapters are grouped by unit when a subject has multiple distinct units
 * (Physics, Maths, English). Unit-only subjects (Chemistry, CS, PE) where
 * unit === name render a flat list.
 */

import { useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Atom,
  FlaskConical,
  Calculator,
  Cpu,
  Dumbbell,
  BookOpen,
  Trophy,
  Target,
} from "lucide-react";

import { useStudyContext } from "@/contexts/study-context";
import { ChapterCard } from "@/components/chapter-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { SUBJECTS } from "@/lib/constants";
import { calculateLevel, groupChaptersByUnit, calculateTotalHours } from "@/lib/utils";
import { differenceInDays, parseISO, format } from "date-fns";
import type { ConfidenceLevel } from "@/lib/types";

// ─── Icon Mapping ─────────────────────────────────────────────────────────────

const ICON_MAP: Record<
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
  return ICON_MAP[iconName] || BookOpen;
}

// ─── Animation Variants ───────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: "easeOut" as const,
    },
  },
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface SubjectDetailPageProps {
  subjectId: string;
  onBack: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SubjectDetailPage({ subjectId, onBack }: SubjectDetailPageProps) {
  const {
    chapters,
    sessions,
    tests,
    toggleResourceComplete,
    setConfidence,
    logSession,
  } = useStudyContext();

  // Subject data
  const subject = useMemo(() => {
    return SUBJECTS.find((s) => s.id === subjectId);
  }, [subjectId]);

  // Chapters for this subject
  const subjectChapters = useMemo(() => {
    return chapters.filter((ch) => ch.subjectId === subjectId);
  }, [chapters, subjectId]);

  // Group chapters by unit
  const unitGroups = useMemo(() => {
    return groupChaptersByUnit(subjectChapters);
  }, [subjectChapters]);

  // Determine if we should show unit headers:
  // Show them when there are multiple distinct units AND at least one unit
  // differs from its chapter name (i.e. it's a real grouping, not unit == name).
  const showUnitHeaders = useMemo(() => {
    const unitNames = Object.keys(unitGroups);
    if (unitNames.length <= 1) return false;

    // Check if every chapter's unit === its name (flat subjects like Chemistry/CS/PE)
    const allUnitEqualsName = subjectChapters.every(
      (ch) => !ch.unit || ch.unit === ch.name
    );
    return !allUnitEqualsName;
  }, [unitGroups, subjectChapters]);

  // Ordered unit keys (preserves syllabus order since chapters are ordered)
  const orderedUnits = useMemo(() => {
    const seen = new Set<string>();
    const order: string[] = [];
    for (const ch of subjectChapters) {
      const unit = ch.unit || "General";
      if (!seen.has(unit)) {
        seen.add(unit);
        order.push(unit);
      }
    }
    return order;
  }, [subjectChapters]);

  // Subject statistics
  const subjectStats = useMemo(() => {
    const totalResources = subjectChapters.reduce(
      (sum, ch) => sum + ch.resources.length,
      0
    );
    const completedResources = subjectChapters.reduce(
      (sum, ch) => sum + ch.resources.filter((r) => r.completed).length,
      0
    );
    const totalXP = subjectChapters.reduce((sum, ch) => sum + ch.xpEarned, 0);
    const totalSessions = subjectChapters.reduce(
      (sum, ch) => sum + ch.sessionsCount,
      0
    );
    const progress =
      totalResources > 0
        ? Math.round((completedResources / totalResources) * 100)
        : 0;
    const levelInfo = calculateLevel(totalXP);
    const completedChapters = subjectChapters.filter((ch) =>
      ch.resources.every((r) => r.completed)
    ).length;

    return {
      totalResources,
      completedResources,
      totalXP,
      totalSessions,
      progress,
      level: levelInfo.level,
      title: levelInfo.title,
      progressToNext: levelInfo.progressPercent,
      xpToNext: levelInfo.xpToNext,
      completedChapters,
    };
  }, [subjectChapters]);

  // Handlers
  const handleToggleResource = useCallback(
    (chapterId: string, resourceId: string) => {
      toggleResourceComplete(chapterId, resourceId);
    },
    [toggleResourceComplete]
  );

  const handleSetConfidence = useCallback(
    (chapterId: string, confidence: ConfidenceLevel) => {
      setConfidence(chapterId, confidence);
    },
    [setConfidence]
  );

  const handleLogSession = useCallback(
    (chapterId: string, resourceId: string) => {
      if (subject) {
        logSession(subject.id, chapterId, resourceId, "locked-in", 2);
      }
    },
    [subject, logSession]
  );

  // Guard: subject not found
  if (!subject) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400 mb-4">Subject not found</p>
          <button
            onClick={onBack}
            className="text-indigo-400 hover:text-indigo-300"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const IconComponent = getSubjectIcon(subject.icon);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-md mx-auto px-4 py-6 pb-24"
      >
        {/* ─── Header ─────────────────────────────────────────────────────── */}
        <header className="mb-6">
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={onBack}
            className="flex items-center gap-1 text-zinc-400 hover:text-zinc-200 transition-colors mb-4 -ml-1 min-h-[44px]"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Back</span>
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3 mb-4"
          >
            <div
              className="flex items-center justify-center w-12 h-12 rounded-xl"
              style={{ backgroundColor: `${subject.color}20` }}
            >
              <IconComponent size={24} style={{ color: subject.color }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-50">{subject.name}</h1>
              <p className="text-sm text-zinc-500">
                {subjectChapters.length} chapters · {subjectStats.totalSessions} sessions
              </p>
            </div>
          </motion.div>
        </header>

        {/* ─── Subject Stats Card ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 mb-6"
        >
          {/* Level and XP */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy size={16} className="text-amber-400" />
              <span className="font-semibold text-zinc-100">
                Level {subjectStats.level}
              </span>
              <span className="text-zinc-500">·</span>
              <span className="text-sm text-zinc-400">{subjectStats.title}</span>
            </div>
            <span className="text-sm font-medium text-zinc-300">
              {subjectStats.totalXP.toLocaleString()} XP
            </span>
          </div>

          {/* Level Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
              <span>Level Progress</span>
              <span>{subjectStats.xpToNext > 0 ? `${subjectStats.xpToNext} XP to next` : "MAX"}</span>
            </div>
            <ProgressBar
              progress={subjectStats.progressToNext}
              color={subject.color}
              height={8}
              showLabel={false}
              animate={true}
            />
          </div>

          {/* Overall Completion */}
          <div>
            <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
              <span className="flex items-center gap-1">
                <Target size={12} />
                Overall Completion
              </span>
              <span>
                {subjectStats.completedResources}/{subjectStats.totalResources} resources
              </span>
            </div>
            <ProgressBar
              progress={subjectStats.progress}
              color={subject.color}
              height={10}
              showLabel={true}
              animate={true}
              glow={subjectStats.progress >= 100}
            />
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-zinc-800">
            <div className="text-center">
              <p className="text-xl font-bold text-zinc-100">
                {subjectStats.completedChapters}
              </p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
                Completed
              </p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-zinc-100">
                {subjectChapters.filter((ch) => ch.isBoss).length}
              </p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
                Boss Ch.
              </p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-zinc-100">
                {subjectStats.totalSessions}
              </p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
                Sessions
              </p>
            </div>
          </div>
        </motion.div>

        {/* ─── Pressure Banner & Hours ─────────────────────────────────────── */}
        {(() => {
          const today = format(new Date(), "yyyy-MM-dd");
          const upcoming = tests.filter((t) => t.subjectId === subjectId && t.date >= today).sort((a, b) => a.date.localeCompare(b.date));
          const nearest = upcoming[0];
          const days = nearest ? differenceInDays(parseISO(nearest.date), new Date()) : null;
          const hours = calculateTotalHours(sessions, subjectId);
          const borderColor = days !== null && days < 7 ? "border-red-500/40" : days !== null && days <= 30 ? "border-orange-500/30" : days !== null && days <= 60 ? "border-amber-500/30" : "border-zinc-800";

          return (
            <div className="space-y-3 mb-6">
              {nearest && days !== null && days <= 90 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`bg-zinc-900 rounded-xl p-4 border ${borderColor}`}>
                  <p className={`text-sm font-semibold ${days < 7 ? "text-red-400" : days <= 30 ? "text-orange-400" : "text-amber-400"}`}>
                    {days === 0 ? "Today" : `Only ${days} days`} until {nearest.name}!
                  </p>
                </motion.div>
              )}
              {hours > 0 && (
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                  <span>⏱️ Total time: <span className="text-zinc-300 font-medium">{hours} hours</span></span>
                </div>
              )}
            </div>
          );
        })()}

        {/* ─── Chapters Section ───────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-3">
            Chapters ({subjectChapters.length})
          </h2>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {showUnitHeaders
              ? /* ── Grouped by Unit ─────────────────────────────────────── */
                orderedUnits.map((unitName) => {
                  const unitChapters = unitGroups[unitName] || [];
                  const hasBoss = unitChapters.some((ch) => ch.isBoss);

                  return (
                    <motion.div key={unitName} variants={itemVariants}>
                      {/* Unit Header */}
                      <div
                        className="bg-zinc-900/50 border-l-4 px-3 py-2 rounded-lg mb-2 mt-4 first:mt-0"
                        style={{ borderLeftColor: subject.color }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-zinc-100">
                            {unitName}
                          </span>
                          {hasBoss && (
                            <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">
                              BOSS
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-zinc-500">
                          {unitChapters.length} chapter{unitChapters.length !== 1 ? "s" : ""}
                        </span>
                      </div>

                      {/* Chapter Cards within this unit */}
                      <div className="space-y-2">
                        {unitChapters.map((chapter) => (
                          <ChapterCard
                            key={chapter.id}
                            chapter={chapter}
                            subjectColor={subject.color}
                            onToggleResource={(resourceId) =>
                              handleToggleResource(chapter.id, resourceId)
                            }
                            onSetConfidence={(confidence) =>
                              handleSetConfidence(chapter.id, confidence)
                            }
                            onLogSession={(resourceId) =>
                              handleLogSession(chapter.id, resourceId)
                            }
                          />
                        ))}
                      </div>
                    </motion.div>
                  );
                })
              : /* ── Flat List (unit == name or single unit) ─────────────── */
                subjectChapters.map((chapter) => (
                  <motion.div key={chapter.id} variants={itemVariants}>
                    <ChapterCard
                      chapter={chapter}
                      subjectColor={subject.color}
                      onToggleResource={(resourceId) =>
                        handleToggleResource(chapter.id, resourceId)
                      }
                      onSetConfidence={(confidence) =>
                        handleSetConfidence(chapter.id, confidence)
                      }
                      onLogSession={(resourceId) =>
                        handleLogSession(chapter.id, resourceId)
                      }
                    />
                  </motion.div>
                ))}
          </motion.div>
        </motion.div>

        {/* ─── Empty State ────────────────────────────────────────────────── */}
        {subjectChapters.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <BookOpen size={48} className="mx-auto mb-4 text-zinc-700" />
            <p className="text-zinc-500">No chapters found for this subject</p>
          </motion.div>
        )}

        {/* ─── Footer Stats ───────────────────────────────────────────────── */}
        {subjectChapters.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800/50 text-center"
          >
            <p className="text-sm text-zinc-400">
              {subjectStats.progress >= 100 ? (
                <span className="text-emerald-400">
                  🎉 Congratulations! You've completed all resources!
                </span>
              ) : (
                <>
                  Keep going! Only{" "}
                  <span className="text-zinc-200 font-semibold">
                    {subjectStats.totalResources - subjectStats.completedResources}
                  </span>{" "}
                  resources left to master {subject.name}
                </>
              )}
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default SubjectDetailPage;

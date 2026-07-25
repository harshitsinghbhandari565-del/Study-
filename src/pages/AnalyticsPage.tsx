"use client";

/**
 * STUDYMAP — Analytics Page
 *
 * The central analytics hub displaying comprehensive study statistics,
 * visualizations, and insights to help students track their progress.
 */

import { useMemo } from "react";
import { motion } from "framer-motion";
import { BarChart3, ArrowLeft } from "lucide-react";

import { useStudyContext } from "@/contexts/study-context";
import { SUBJECTS } from "@/lib/constants";

import { SubjectRadar } from "@/components/analytics/subject-radar";
import { WeeklyReport } from "@/components/analytics/weekly-report";
import { Heatmap } from "@/components/analytics/heatmap";
import { TimelineFeed } from "@/components/analytics/timeline-feed";
import { StudyHours } from "@/components/analytics/study-hours";

// ─── Animation Variants ───────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut" as const,
    },
  },
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface AnalyticsPageProps {
  /** Callback to navigate back */
  onBack: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * AnalyticsPage
 *
 * Renders the analytics dashboard with multiple visualization components.
 */
export function AnalyticsPage({ onBack }: AnalyticsPageProps) {
  const {
    sessions,
    chapters,
    heatmap,
    weeklyReports,
    subjectsWithProgress,
    currentStreak,
    totalXP,
    userStats,
  } = useStudyContext();

  /**
   * Prepare subjects progress data for SubjectRadar
   */
  const subjectsProgressData = useMemo(() => {
    return subjectsWithProgress.map((sp) => ({
      subject: SUBJECTS.find((s) => s.id === sp.id) || {
        id: sp.id,
        name: sp.id,
        color: "#71717a",
        icon: "BookOpen",
        level: 1,
        totalXP: 0,
      },
      progress: sp.progress,
      level: sp.level,
      xp: sp.totalXP,
    }));
  }, [subjectsWithProgress]);

  /**
   * Get the most recent weekly report if available
   */
  const latestWeeklyReport = useMemo(() => {
    if (weeklyReports.length === 0) return null;
    return weeklyReports[weeklyReports.length - 1];
  }, [weeklyReports]);

  /**
   * Calculate some summary stats
   */
  const summaryStats = useMemo(() => {
    const totalSessions = sessions.length;
    const completedChapters = chapters.filter((ch) =>
      ch.resources.every((r) => r.completed)
    ).length;
    const totalChapters = chapters.length;

    return {
      totalSessions,
      completedChapters,
      totalChapters,
      totalXP,
    };
  }, [sessions, chapters, totalXP]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-md mx-auto px-4 py-6 pb-24"
      >
        {/* ─── Header ─────────────────────────────────────────────────────── */}
        <motion.header variants={itemVariants} className="mb-6">
          {/* Back Button */}
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-zinc-400 hover:text-zinc-200 transition-colors mb-4 -ml-1 min-h-[44px]"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Back</span>
          </button>

          {/* Title */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20">
              <BarChart3 size={24} className="text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-50">Analytics</h1>
              <p className="text-sm text-zinc-500">Track your study progress</p>
            </div>
          </div>
        </motion.header>

        {/* ─── Quick Stats Banner ─────────────────────────────────────────── */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-3 gap-2 mb-6"
        >
          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-center">
            <p className="text-2xl font-bold text-zinc-100">
              {summaryStats.totalSessions}
            </p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
              Sessions
            </p>
          </div>
          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-center">
            <p className="text-2xl font-bold text-zinc-100">
              {summaryStats.completedChapters}/{summaryStats.totalChapters}
            </p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
              Chapters
            </p>
          </div>
          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-center">
            <p className="text-2xl font-bold text-amber-400">
              {summaryStats.totalXP.toLocaleString()}
            </p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
              Total XP
            </p>
          </div>
        </motion.div>

        {/* ─── Subject Radar ──────────────────────────────────────────────── */}
        <motion.section variants={itemVariants} className="mb-6">
          <SubjectRadar subjectsProgress={subjectsProgressData} />
        </motion.section>

        {/* ─── Study Hours ─────────────────────────────────────────────────── */}
        <motion.section variants={itemVariants} className="mb-6">
          <StudyHours sessions={sessions} subjects={SUBJECTS} />
        </motion.section>

        {/* ─── Weekly Report ──────────────────────────────────────────────── */}
        <motion.section variants={itemVariants} className="mb-6">
          <WeeklyReport
            weeklyReport={latestWeeklyReport}
            sessions={sessions}
            chapters={chapters}
            currentStreak={currentStreak}
          />
        </motion.section>

        {/* ─── Heatmap ────────────────────────────────────────────────────── */}
        <motion.section variants={itemVariants} className="mb-6">
          <Heatmap heatmapData={heatmap} holidayDates={userStats.holidayDates} />
        </motion.section>

        {/* ─── Timeline Feed ──────────────────────────────────────────────── */}
        <motion.section variants={itemVariants} className="mb-6">
          <TimelineFeed sessions={sessions} currentStreak={currentStreak} />
        </motion.section>

        {/* ─── Footer ─────────────────────────────────────────────────────── */}
        <motion.footer
          variants={itemVariants}
          className="text-center py-4 text-xs text-zinc-600"
        >
          Keep grinding! Every session counts 💪
        </motion.footer>
      </motion.div>
    </div>
  );
}

export default AnalyticsPage;

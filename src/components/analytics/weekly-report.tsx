"use client";

/**
 * STUDYMAP — Weekly Report
 *
 * A comprehensive summary card showing study statistics for the current week.
 * Includes session counts, subject distribution, XP earned, and areas needing attention.
 */

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  Flame,
  Target,
  TrendingUp,
  TrendingDown,
  Calendar,
  Zap,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { startOfWeek, endOfWeek, isWithinInterval, parseISO, getWeek } from "date-fns";

import { SUBJECTS } from "@/lib/constants";
import type { StudySession, Chapter, WeeklyReport as WeeklyReportType } from "@/lib/types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface WeeklyReportProps {
  /** Pre-computed weekly report from context (optional) */
  weeklyReport?: WeeklyReportType | null;
  /** Sessions array for computing report if not provided */
  sessions?: StudySession[];
  /** Chapters array for computing low confidence chapters */
  chapters?: Chapter[];
  /** Current streak from context */
  currentStreak?: number;
}

// ─── Helper Functions ─────────────────────────────────────────────────────────

/**
 * Get subject name by ID
 */
function getSubjectName(subjectId: string): string {
  return SUBJECTS.find((s) => s.id === subjectId)?.name || "Unknown";
}

/**
 * Get subject color by ID
 */
function getSubjectColor(subjectId: string): string {
  return SUBJECTS.find((s) => s.id === subjectId)?.color || "#71717a";
}

/**
 * Get day name from day number
 */
function getDayName(dayNum: number): string {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[dayNum] || "Unknown";
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * WeeklyReport
 *
 * Renders a stats card summarizing the user's weekly study activity.
 */
export function WeeklyReport({
  weeklyReport,
  sessions = [],
  chapters = [],
  currentStreak = 0,
}: WeeklyReportProps) {
  /**
   * Compute weekly stats from sessions if weeklyReport not provided
   */
  const stats = useMemo(() => {
    // If weeklyReport is provided, use it
    if (weeklyReport) {
      return {
        weekNumber: weeklyReport.weekNumber,
        totalSessions: weeklyReport.totalSessions,
        subjectsTouched: weeklyReport.subjectsTouched,
        mostActiveSubjectId: weeklyReport.mostActiveSubjectId,
        weakestSubjectId: weeklyReport.weakestSubjectId,
        bestDay: weeklyReport.bestDay,
        resourcesCompleted: weeklyReport.resourcesCompleted,
        xpEarned: weeklyReport.xpEarned,
        currentStreak: weeklyReport.currentStreak,
        lowConfidenceChapters: weeklyReport.lowConfidenceChapters,
      };
    }

    // Otherwise, compute from sessions
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

    // Filter sessions from this week
    const weeklySessions = sessions.filter((s) => {
      const sessionDate = parseISO(s.timestamp);
      return isWithinInterval(sessionDate, { start: weekStart, end: weekEnd });
    });

    // Count by subject
    const subjectCounts: Record<string, number> = {};
    weeklySessions.forEach((s) => {
      subjectCounts[s.subjectId] = (subjectCounts[s.subjectId] || 0) + 1;
    });

    const subjectEntries = Object.entries(subjectCounts);
    const mostActiveSubjectId =
      subjectEntries.length > 0
        ? subjectEntries.sort((a, b) => b[1] - a[1])[0][0]
        : "";

    // Find weakest subject (least sessions or not touched)
    const allSubjectIds = SUBJECTS.map((s) => s.id);
    const untouchedSubjects = allSubjectIds.filter((id) => !subjectCounts[id]);
    const weakestSubjectId =
      untouchedSubjects.length > 0
        ? untouchedSubjects[0]
        : subjectEntries.length > 0
          ? subjectEntries.sort((a, b) => a[1] - b[1])[0][0]
          : "";

    // Count by day
    const dayCounts: Record<number, number> = {};
    weeklySessions.forEach((s) => {
      const day = parseISO(s.timestamp).getDay();
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });
    const bestDayNum = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    const bestDay = bestDayNum ? getDayName(parseInt(bestDayNum, 10)) : "—";

    // XP earned this week
    const xpEarned = weeklySessions.reduce((sum, s) => sum + s.xpEarned, 0);

    // Resources completed this week (approximate from sessions)
    const resourcesCompleted = weeklySessions.length;

    // Low confidence chapters
    const lowConfidenceChapters = chapters
      .filter((ch) => ch.confidence === 1 && ch.sessionsCount > 0)
      .map((ch) => ch.id);

    return {
      weekNumber: getWeek(now),
      totalSessions: weeklySessions.length,
      subjectsTouched: Object.keys(subjectCounts).length,
      mostActiveSubjectId,
      weakestSubjectId,
      bestDay,
      resourcesCompleted,
      xpEarned,
      currentStreak,
      lowConfidenceChapters,
    };
  }, [weeklyReport, sessions, chapters, currentStreak]);

  /**
   * Get chapter names for low confidence chapters
   */
  const lowConfidenceChapterNames = useMemo(() => {
    return stats.lowConfidenceChapters
      .slice(0, 5)
      .map((chId) => {
        const chapter = chapters.find((c) => c.id === chId);
        return chapter
          ? { name: chapter.name, subjectId: chapter.subjectId }
          : null;
      })
      .filter(Boolean) as Array<{ name: string; subjectId: string }>;
  }, [stats.lowConfidenceChapters, chapters]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-lg bg-purple-500/10">
          <BarChart3 size={16} className="text-purple-400" />
        </div>
        <h3 className="font-semibold text-zinc-100">
          📊 WEEK {stats.weekNumber} REPORT
        </h3>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Total Sessions */}
        <div className="p-3 rounded-lg bg-zinc-800/50">
          <div className="flex items-center gap-1.5 mb-1">
            <Target size={12} className="text-zinc-500" />
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
              Sessions
            </span>
          </div>
          <p className="text-xl font-bold text-zinc-100">{stats.totalSessions}</p>
        </div>

        {/* Subjects Touched */}
        <div className="p-3 rounded-lg bg-zinc-800/50">
          <div className="flex items-center gap-1.5 mb-1">
            <Calendar size={12} className="text-zinc-500" />
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
              Subjects
            </span>
          </div>
          <p className="text-xl font-bold text-zinc-100">{stats.subjectsTouched}/6</p>
        </div>

        {/* Most Active Subject */}
        <div className="p-3 rounded-lg bg-zinc-800/50">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp size={12} className="text-emerald-500" />
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
              Most Active
            </span>
          </div>
          <p
            className="text-sm font-bold truncate"
            style={{ color: getSubjectColor(stats.mostActiveSubjectId) }}
          >
            {stats.mostActiveSubjectId ? getSubjectName(stats.mostActiveSubjectId) : "—"}
          </p>
        </div>

        {/* Weakest Subject */}
        <div className="p-3 rounded-lg bg-zinc-800/50">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingDown size={12} className="text-red-500" />
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
              Needs Work
            </span>
          </div>
          <p
            className="text-sm font-bold truncate"
            style={{ color: stats.weakestSubjectId ? getSubjectColor(stats.weakestSubjectId) : "#71717a" }}
          >
            {stats.weakestSubjectId ? getSubjectName(stats.weakestSubjectId) : "—"}
          </p>
        </div>

        {/* Best Day */}
        <div className="p-3 rounded-lg bg-zinc-800/50">
          <div className="flex items-center gap-1.5 mb-1">
            <Calendar size={12} className="text-zinc-500" />
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
              Best Day
            </span>
          </div>
          <p className="text-xl font-bold text-zinc-100">{stats.bestDay}</p>
        </div>

        {/* XP Earned */}
        <div className="p-3 rounded-lg bg-zinc-800/50">
          <div className="flex items-center gap-1.5 mb-1">
            <Zap size={12} className="text-amber-500" />
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
              XP Earned
            </span>
          </div>
          <p className="text-xl font-bold text-amber-400">{stats.xpEarned}</p>
        </div>
      </div>

      {/* Current Streak */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 mb-4">
        <div className="flex items-center gap-2">
          <Flame size={20} className="text-orange-400" />
          <span className="text-sm font-medium text-zinc-200">Current Streak</span>
        </div>
        <span className="text-xl font-bold text-orange-400">
          {stats.currentStreak} day{stats.currentStreak !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Divider */}
      <div className="h-px bg-zinc-800 my-4" />

      {/* Low Confidence Chapters */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={14} className="text-amber-400" />
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Chapters Rated ⭐ (Need Redo)
          </span>
        </div>

        {lowConfidenceChapterNames.length > 0 ? (
          <div className="space-y-1.5">
            {lowConfidenceChapterNames.map((chapter, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 text-sm text-zinc-300"
              >
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: getSubjectColor(chapter.subjectId) }}
                />
                <span className="truncate">{chapter.name}</span>
              </div>
            ))}
            {stats.lowConfidenceChapters.length > 5 && (
              <p className="text-xs text-zinc-500 mt-2">
                +{stats.lowConfidenceChapters.length - 5} more
              </p>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 size={16} />
            <span className="text-sm">All chapters solid! 🎉</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default WeeklyReport;

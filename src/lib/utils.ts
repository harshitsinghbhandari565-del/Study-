/**
 * STUDYMAP — Utility Functions
 *
 * Pure helper functions consumed throughout the app.
 * Every function is fully implemented — no placeholders.
 */

import {
  format,
  isToday,
  isYesterday,
  differenceInDays,
  differenceInMonths,
  addDays,
  parseISO,
  startOfDay,
  subDays,
} from "date-fns";

import {
  SUBJECTS,
  RESOURCE_TYPES,
  LEVEL_THRESHOLDS,
  TITLES_BY_LEVEL,
} from "./constants";

import type {
  Subject,
  Chapter,
  StudySession,
  HeatmapDay,
  Goal,
  Test,
  RevisionItem,
  ScheduleDay,
  ScheduleSession,
} from "./types";

// ─── 1. calculateLevel ───────────────────────────────────────────────────────

/**
 * Determine the player's level, title, XP needed to advance, and progress
 * percentage through the current level bracket.
 *
 * @param xp – cumulative XP earned
 * @returns level info object
 */
export function calculateLevel(xp: number): {
  level: number;
  title: string;
  xpToNext: number;
  progressPercent: number;
} {
  let level = 1;

  // Walk the thresholds to find the highest level the XP qualifies for.
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      level = i + 1; // levels are 1-indexed
      break;
    }
  }

  // Title lookup — iterate from highest range downward.
  let title = "Novice";
  for (const entry of TITLES_BY_LEVEL) {
    if (level >= entry.minLevel && level <= entry.maxLevel) {
      title = entry.title;
      break;
    }
  }

  // XP to next level & progress %.
  const currentThreshold = LEVEL_THRESHOLDS[level - 1];

  if (level >= LEVEL_THRESHOLDS.length) {
    // Max level reached.
    return { level, title, xpToNext: 0, progressPercent: 100 };
  }

  const nextThreshold = LEVEL_THRESHOLDS[level]; // level is 0-indexed +1, so index = level
  const xpInBracket = xp - currentThreshold;
  const bracketSize = nextThreshold - currentThreshold;
  const progressPercent =
    bracketSize > 0 ? Math.min(100, Math.round((xpInBracket / bracketSize) * 100)) : 100;
  const xpToNext = nextThreshold - xp;

  return { level, title, xpToNext: Math.max(0, xpToNext), progressPercent };
}

// ─── 2. calculateSubjectProgress ─────────────────────────────────────────────

/**
 * Returns the percentage of completed resources in a chapter (0–100).
 *
 * @param chapter – the chapter to evaluate
 */
export function calculateSubjectProgress(chapter: Chapter): number {
  if (chapter.resources.length === 0) return 0;

  const completed = chapter.resources.filter((r) => r.completed).length;
  return Math.round((completed / chapter.resources.length) * 100);
}

// ─── 3. calculateStreakHistory ────────────────────────────────────────────────

/**
 * Analyses study sessions to compute the current streak and the all-time
 * longest streak.  Freeze dates count as "active" days so the streak isn't
 * broken when a freeze card is used.
 *
 * @param sessions  – all logged study sessions
 * @param freezeDates – ISO date strings (YYYY-MM-DD) where a freeze was used
 */
export function calculateStreakHistory(
  sessions: StudySession[],
  freezeDates: string[]
): {
  currentStreak: number;
  longestStreak: number;
  canUseFreeze: boolean;
} {
  // Build a Set of unique session dates (YYYY-MM-DD).
  const sessionDateSet = new Set<string>();
  for (const s of sessions) {
    const day = format(parseISO(s.timestamp), "yyyy-MM-dd");
    sessionDateSet.add(day);
  }

  const freezeSet = new Set(freezeDates);

  // Walk backwards from today counting consecutive "active" days.
  let currentStreak = 0;
  let cursor = startOfDay(new Date());

  while (true) {
    const key = format(cursor, "yyyy-MM-dd");
    if (sessionDateSet.has(key) || freezeSet.has(key)) {
      currentStreak++;
      cursor = subDays(cursor, 1);
    } else {
      break;
    }
  }

  // Longest streak: walk the full date range of sessions.
  let longestStreak = 0;

  if (sessions.length > 0) {
    // Find the earliest session date.
    const sortedDates = Array.from(sessionDateSet).sort();
    const earliest = parseISO(sortedDates[0]);
    const latest = new Date();
    const totalDays = differenceInDays(latest, earliest) + 1;

    let running = 0;
    for (let i = 0; i < totalDays; i++) {
      const d = addDays(earliest, i);
      const key = format(d, "yyyy-MM-dd");
      if (sessionDateSet.has(key) || freezeSet.has(key)) {
        running++;
        longestStreak = Math.max(longestStreak, running);
      } else {
        running = 0;
      }
    }
  }

  longestStreak = Math.max(longestStreak, currentStreak);

  // A freeze can be used if the user did NOT study today and the streak
  // is still alive (i.e. they studied yesterday or used a freeze yesterday).
  const todayKey = format(new Date(), "yyyy-MM-dd");
  const canUseFreeze = !sessionDateSet.has(todayKey) && currentStreak > 0;

  return { currentStreak, longestStreak, canUseFreeze };
}

// ─── 4. formatStudyDate ──────────────────────────────────────────────────────

/**
 * Returns a human-friendly string for a date:
 *   - "Today" / "Yesterday"
 *   - "Mon, 12 Jun" for dates within the last 3 months
 *   - "3 months ago" for older dates
 *
 * @param date – ISO date string or Date object
 */
export function formatStudyDate(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;

  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";

  const monthsAgo = differenceInMonths(new Date(), d);
  if (monthsAgo >= 3) {
    return monthsAgo === 1 ? "1 month ago" : `${monthsAgo} months ago`;
  }

  return format(d, "EEE, d MMM");
}

// ─── 5. generateHeatmapData ──────────────────────────────────────────────────

/**
 * Build 365 days of heatmap entries from study sessions.
 *
 * Intensity buckets:
 *   0 = 0 sessions
 *   1 = 1 session
 *   2 = 2 sessions
 *   3 = 3–4 sessions
 *   4 = 5+ sessions
 *
 * @param sessions – all logged study sessions
 */
export function generateHeatmapData(sessions: StudySession[]): HeatmapDay[] {
  // Count sessions per day.
  const counts = new Map<string, number>();
  for (const s of sessions) {
    const key = format(parseISO(s.timestamp), "yyyy-MM-dd");
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const today = startOfDay(new Date());
  const days: HeatmapDay[] = [];

  for (let i = 364; i >= 0; i--) {
    const d = subDays(today, i);
    const key = format(d, "yyyy-MM-dd");
    const count = counts.get(key) ?? 0;

    let intensity: 0 | 1 | 2 | 3 | 4;
    if (count === 0) intensity = 0;
    else if (count === 1) intensity = 1;
    else if (count === 2) intensity = 2;
    else if (count <= 4) intensity = 3;
    else intensity = 4;

    days.push({ date: key, count, intensity });
  }

  return days;
}

// ─── 6. generateRevisionSchedule ─────────────────────────────────────────────

/**
 * Returns four revision due-dates following a spaced-repetition curve:
 * +3 days, +7 days, +21 days, +45 days from the completed date.
 *
 * @param completedDate – ISO date string when the chapter was first completed
 * @returns array of 4 ISO date strings
 */
export function generateRevisionSchedule(completedDate: string): string[] {
  const base = parseISO(completedDate);
  return [
    format(addDays(base, 3), "yyyy-MM-dd"),
    format(addDays(base, 7), "yyyy-MM-dd"),
    format(addDays(base, 21), "yyyy-MM-dd"),
    format(addDays(base, 45), "yyyy-MM-dd"),
  ];
}

// ─── 7. calculateBossReward ──────────────────────────────────────────────────

/**
 * Boss chapters grant a 3× XP multiplier.
 *
 * @param baseXP – the base XP that would normally be awarded
 * @returns boosted XP value
 */
export function calculateBossReward(baseXP: number): number {
  return baseXP * 3;
}

// ─── 8. calculateGoalPace ────────────────────────────────────────────────────

/**
 * Evaluates whether the student is on pace to meet their goal by the deadline.
 *
 * @param goal  – the Goal to evaluate
 * @param today – optional ISO date string override (defaults to now)
 */
export function calculateGoalPace(
  goal: Goal,
  today?: string
): {
  percent: number;
  daysLeft: number;
  behindPace: boolean;
  pacePercent: number;
} {
  const now = today ? parseISO(today) : new Date();
  const created = parseISO(goal.createdAt);
  const deadline = parseISO(goal.deadline);

  const totalDuration = Math.max(1, differenceInDays(deadline, created));
  const elapsed = Math.max(0, differenceInDays(now, created));
  const daysLeft = Math.max(0, differenceInDays(deadline, now));

  const percent =
    goal.targetCount > 0
      ? Math.round((goal.progressCount / goal.targetCount) * 100)
      : 0;

  const pacePercent = Math.min(
    100,
    Math.round((elapsed / totalDuration) * 100)
  );

  const behindPace = percent < pacePercent;

  return { percent, daysLeft, behindPace, pacePercent };
}

// ─── 9. getSubjectById ───────────────────────────────────────────────────────

/**
 * Look up a subject from the master SUBJECTS list.
 *
 * @param id – subject id
 */
export function getSubjectById(id: string): Subject | undefined {
  return SUBJECTS.find((s) => s.id === id);
}

// ─── 10. getResourceTypeById ─────────────────────────────────────────────────

/**
 * Look up a resource type from the master RESOURCE_TYPES list.
 *
 * @param id – resource type id
 */
export function getResourceTypeById(
  id: string
): (typeof RESOURCE_TYPES)[number] | undefined {
  return RESOURCE_TYPES.find((r) => r.id === id);
}

// ─── 11. cn (class-name joiner) ──────────────────────────────────────────────

/**
 * Joins class-name tokens, filtering out falsy values.
 * A lightweight alternative to clsx + tailwind-merge for simple concatenation.
 *
 * @param inputs – any number of string / undefined / null / false values
 * @returns a single trimmed class string
 */
export function cn(
  ...inputs: (string | undefined | null | false)[]
): string {
  return inputs.filter(Boolean).join(" ");
}

// ─── 12. groupChaptersByUnit ─────────────────────────────────────────────────

/**
 * Groups an array of chapters by their `unit` field.
 * Chapters without a unit are placed under "General".
 *
 * @param chapters – array of chapters to group
 * @returns record mapping unit names to arrays of chapters
 */
export function groupChaptersByUnit(
  chapters: Chapter[]
): Record<string, Chapter[]> {
  return chapters.reduce(
    (acc, chapter) => {
      const unit = chapter.unit || "General";
      if (!acc[unit]) acc[unit] = [];
      acc[unit].push(chapter);
      return acc;
    },
    {} as Record<string, Chapter[]>
  );
}

// ─── 13. calculateTotalHours ─────────────────────────────────────────────────

/**
 * Sum duration across sessions, optionally filtered by subject.
 * Returns hours rounded to 1 decimal.
 */
export function calculateTotalHours(
  sessions: StudySession[],
  subjectId?: string
): number {
  const relevant = subjectId
    ? sessions.filter((s) => s.subjectId === subjectId)
    : sessions;
  const totalMinutes = relevant.reduce((sum, s) => sum + (s.duration || 0), 0);
  return Math.round((totalMinutes / 60) * 10) / 10;
}

// ─── 14. calculateChaptersCompleted ──────────────────────────────────────────

export function calculateChaptersCompleted(chapters: Chapter[], subjectId?: string): number {
  const filtered = subjectId ? chapters.filter((c) => c.subjectId === subjectId) : chapters;
  return filtered.filter((c) => calculateSubjectProgress(c) === 100).length;
}

// ─── 15. calculatePaceStatus ─────────────────────────────────────────────────

export function calculatePaceStatus(
  subjectId: string,
  chapters: Chapter[],
  tests: Test[],
  sessionStartDate: string
): {
  status: "on-track" | "behind" | "critical" | "no-test" | "passed";
  requiredChaptersPerWeek: number;
  pacePercent: number;
  completed: number;
  total: number;
  daysRemaining: number;
  daysElapsed: number;
} {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const subjectChapters = chapters.filter((c) => c.subjectId === subjectId);
  const total = subjectChapters.length;
  const completed = calculateChaptersCompleted(subjectChapters);
  const subjectTest = tests
    .filter((t) => t.subjectId === subjectId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .find((t) => { const d = new Date(t.date); d.setHours(0, 0, 0, 0); return d >= today; });

  if (!subjectTest) {
    return { status: "no-test", requiredChaptersPerWeek: 0, pacePercent: 0, completed, total, daysRemaining: 0, daysElapsed: 0 };
  }
  const testDate = new Date(subjectTest.date); testDate.setHours(0, 0, 0, 0);
  const startDate = new Date(sessionStartDate); startDate.setHours(0, 0, 0, 0);
  const daysElapsed = Math.max(0, Math.floor((today.getTime() - startDate.getTime()) / 86400000));
  const daysRemaining = Math.floor((testDate.getTime() - today.getTime()) / 86400000);
  if (daysRemaining <= 0) {
    return { status: "passed", requiredChaptersPerWeek: 0, pacePercent: 0, completed, total, daysRemaining: 0, daysElapsed };
  }
  const totalDays = daysElapsed + daysRemaining;
  const expectedDone = totalDays > 0 ? total * (daysElapsed / totalDays) : 0;
  const pacePercent = expectedDone > 0 ? (completed / expectedDone) * 100 : 100;
  const reqPerDay = (total - completed) / daysRemaining;
  const requiredChaptersPerWeek = Math.round(reqPerDay * 7 * 10) / 10;
  let status: "on-track" | "behind" | "critical";
  if (pacePercent >= 100) status = "on-track";
  else if (pacePercent >= 70) status = "behind";
  else status = "critical";
  return { status, requiredChaptersPerWeek, pacePercent, completed, total, daysRemaining, daysElapsed };
}

// ─── 16. calculateSubjectReadiness ───────────────────────────────────────────

export function calculateSubjectReadiness(
  subjectId: string,
  chapters: Chapter[],
  revisions: RevisionItem[],
  todayISO: string = new Date().toISOString().split("T")[0]
): {
  totalScore: number;
  completionScore: number;
  confidenceScore: number;
  revisionScore: number;
  completedChapters: number;
  totalChapters: number;
  avgConfidence: number;
  completedRevisions: number;
  totalRevisions: number;
  overdueRevisions: number;
} {
  const sc = chapters.filter((c) => c.subjectId === subjectId);
  const totalChapters = sc.length;
  const completedChapters = calculateChaptersCompleted(sc);
  const completionScore = totalChapters > 0 ? (completedChapters / totalChapters) * 40 : 0;
  const sumConf = sc.reduce((s, c) => s + c.confidence, 0);
  const maxConf = totalChapters * 3;
  const confidenceScore = maxConf > 0 ? (sumConf / maxConf) * 35 : 0;
  const avgConfidence = totalChapters > 0 ? Math.round((sumConf / totalChapters) * 10) / 10 : 0;
  const sr = revisions.filter((r) => r.subjectId === subjectId);
  const totalRevisions = sr.length;
  const completedRevisions = sr.filter((r) => r.completed).length;
  const overdueRevisions = sr.filter((r) => !r.completed && r.dueDate <= todayISO).length;
  const revisionScore = totalRevisions > 0 ? Math.max(0, ((completedRevisions - overdueRevisions) / totalRevisions) * 25) : 0;
  const totalScore = Math.round(completionScore + confidenceScore + revisionScore);
  return { totalScore, completionScore: Math.round(completionScore), confidenceScore: Math.round(confidenceScore), revisionScore: Math.round(revisionScore), completedChapters, totalChapters, avgConfidence, completedRevisions, totalRevisions, overdueRevisions };
}

// ─── 17. getReadinessAdvice ──────────────────────────────────────────────────

export function getReadinessAdvice(readiness: ReturnType<typeof calculateSubjectReadiness>): string {
  const { totalScore, completionScore, overdueRevisions, confidenceScore } = readiness;
  if (totalScore >= 80) return "You're in strong shape. Keep revising and stay sharp.";
  if (completionScore < 15) return "Priority: Complete more chapters. Coverage is your foundation.";
  if (overdueRevisions > 0) return "Priority: Clear overdue revisions. Memory fades without review.";
  if (confidenceScore < 12) return "Priority: Build confidence in completed chapters. Shaky knowledge won't hold.";
  return "Steady progress. Stay consistent and touch every subject weekly.";
}

// ─── 18. buildSchedule ───────────────────────────────────────────────────────

export function buildSchedule(
  chapters: Chapter[],
  subjects: Subject[],
  tests: Test[],
  holidayDates: string[],
  sessionStartDate: string,
  maxSessionsPerDay: number = 3,
  daysToGenerate: number = 7
): ScheduleDay[] {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const schedule: ScheduleDay[] = [];
  const priorityMap: Record<string, number> = { critical: 3, behind: 2, "on-track": 1, "no-test": 0, passed: -1 };

  const subjectQueues = subjects.map((subject) => {
    const incompleteChapters = chapters
      .filter((c) => c.subjectId === subject.id && calculateSubjectProgress(c) < 100)
      .map((c) => ({ ...c }));
    const pace = calculatePaceStatus(subject.id, chapters, tests, sessionStartDate);
    const nearestTest = tests
      .filter((t) => t.subjectId === subject.id)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .find((t) => { const d = new Date(t.date); d.setHours(0, 0, 0, 0); return d >= today; });
    return { subject, incompleteChapters, pace, nearestTest };
  }).filter((sq) => sq.incompleteChapters.length > 0);

  for (let i = 0; i < daysToGenerate; i++) {
    const date = new Date(today); date.setDate(today.getDate() + i);
    const dateISO = date.toISOString().split("T")[0];
    const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
    const isRestDay = holidayDates.includes(dateISO);
    const dayTests = tests.filter((t) => t.date === dateISO);
    const isTestDay = dayTests.length > 0;
    const day: ScheduleDay = { date: dateISO, dayName, sessions: [], isRestDay, isTestDay };

    if (isRestDay || isTestDay) { schedule.push(day); continue; }

    const available = [...subjectQueues]
      .filter((sq) => sq.incompleteChapters.length > 0)
      .sort((a, b) => {
        const priA = priorityMap[a.pace.status] ?? 0;
        const priB = priorityMap[b.pace.status] ?? 0;
        if (priB !== priA) return priB - priA;
        const dateA = a.nearestTest ? new Date(a.nearestTest.date).getTime() : Infinity;
        const dateB = b.nearestTest ? new Date(b.nearestTest.date).getTime() : Infinity;
        return dateA - dateB;
      });

    for (const sq of available) {
      if (day.sessions.length >= maxSessionsPerDay) break;
      const chapter = sq.incompleteChapters[0];
      if (!chapter) continue;
      const sess: ScheduleSession = {
        subjectId: sq.subject.id, subjectName: sq.subject.name, subjectColor: sq.subject.color,
        chapterId: chapter.id, chapterName: chapter.name, unit: chapter.unit, isBoss: chapter.isBoss,
      };
      day.sessions.push(sess);
      sq.incompleteChapters.shift();
    }

    schedule.push(day);
  }

  return schedule;
}

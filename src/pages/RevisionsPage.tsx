"use client";

/**
 * STUDYMAP — Revisions Page
 *
 * Displays all scheduled revisions grouped by due date.
 * Part of the spaced repetition system to reinforce learning.
 */

import { useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCcw, ArrowLeft, CheckCircle2, Calendar, Clock } from "lucide-react";
import { format, parseISO, addDays } from "date-fns";

import { useStudyContext } from "@/contexts/study-context";
import { RevisionAlert } from "@/components/revisions/revision-alert";
import { SUBJECTS } from "@/lib/constants";

// ─── Animation Variants ───────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
    },
  },
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface RevisionsPageProps {
  /** Callback to navigate back */
  onBack: () => void;
}

// ─── Helper Functions ─────────────────────────────────────────────────────────

function getSubjectColor(subjectId: string): string {
  return SUBJECTS.find((s) => s.id === subjectId)?.color || "#71717a";
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * RevisionsPage
 *
 * The main revisions management page with grouped due dates.
 */
export function RevisionsPage({ onBack }: RevisionsPageProps) {
  const { revisions, chapters, markRevisionDone } = useStudyContext();

  /**
   * Get chapter name by ID
   */
  const getChapterName = useCallback(
    (chapterId: string): string => {
      return chapters.find((c) => c.id === chapterId)?.name || "Unknown Chapter";
    },
    [chapters]
  );

  /**
   * Group revisions by status and date
   */
  const groupedRevisions = useMemo(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd");
    const nextWeekEnd = format(addDays(new Date(), 7), "yyyy-MM-dd");

    const dueToday: typeof revisions = [];
    const dueTomorrow: typeof revisions = [];
    const upcoming: typeof revisions = [];
    const completed: typeof revisions = [];
    const overdue: typeof revisions = [];

    revisions.forEach((rev) => {
      if (rev.completed) {
        completed.push(rev);
      } else if (rev.dueDate < today) {
        overdue.push(rev);
      } else if (rev.dueDate === today) {
        dueToday.push(rev);
      } else if (rev.dueDate === tomorrow) {
        dueTomorrow.push(rev);
      } else if (rev.dueDate <= nextWeekEnd) {
        upcoming.push(rev);
      }
    });

    // Sort by due date
    const sortByDate = (a: typeof revisions[0], b: typeof revisions[0]) =>
      a.dueDate.localeCompare(b.dueDate);

    return {
      overdue: overdue.sort(sortByDate),
      dueToday: dueToday.sort(sortByDate),
      dueTomorrow: dueTomorrow.sort(sortByDate),
      upcoming: upcoming.sort(sortByDate),
      completed: completed.slice(0, 10), // Show last 10 completed
    };
  }, [revisions]);

  /**
   * Handle marking revision as done
   */
  const handleMarkDone = useCallback(
    (chapterId: string, revisionNumber: number) => {
      const revisionId = `${chapterId}-${revisionNumber}`;
      markRevisionDone(revisionId);
    },
    [markRevisionDone]
  );

  /**
   * Check if there are any pending revisions
   */
  const hasPendingRevisions =
    groupedRevisions.overdue.length > 0 ||
    groupedRevisions.dueToday.length > 0 ||
    groupedRevisions.dueTomorrow.length > 0 ||
    groupedRevisions.upcoming.length > 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-md mx-auto px-4 py-6 pb-24"
      >
        {/* Header */}
        <header className="mb-6">
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
            <div className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/20">
              <RefreshCcw size={24} className="text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-50">Revisions</h1>
              <p className="text-sm text-zinc-500">Spaced repetition schedule</p>
            </div>
          </div>
        </header>

        {/* Empty State */}
        {!hasPendingRevisions && groupedRevisions.completed.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center"
          >
            <RefreshCcw size={40} className="mx-auto text-zinc-700 mb-3" />
            <p className="text-zinc-500 text-sm mb-1">No revisions scheduled</p>
            <p className="text-zinc-600 text-xs">Complete chapters to start your revision cycle!</p>
          </motion.div>
        )}

        {/* All Caught Up */}
        {!hasPendingRevisions && groupedRevisions.completed.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 text-center mb-6"
          >
            <CheckCircle2 size={40} className="mx-auto text-emerald-400 mb-3" />
            <p className="text-emerald-400 font-semibold mb-1">All caught up! 🎉</p>
            <p className="text-zinc-500 text-sm">No pending revisions right now.</p>
          </motion.div>
        )}

        {/* Overdue Section */}
        {groupedRevisions.overdue.length > 0 && (
          <section className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={14} className="text-red-400" />
              <h2 className="text-xs uppercase tracking-wider text-red-400 font-semibold">
                Overdue ({groupedRevisions.overdue.length})
              </h2>
            </div>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-2"
            >
              <AnimatePresence mode="popLayout">
                {groupedRevisions.overdue.map((rev) => (
                  <motion.div
                    key={`${rev.chapterId}-${rev.revisionNumber}`}
                    variants={itemVariants}
                    layout
                  >
                    <RevisionAlert
                      revisionNumber={rev.revisionNumber}
                      subjectColor={getSubjectColor(rev.subjectId)}
                      chapterName={getChapterName(rev.chapterId)}
                      onMarkDone={() => handleMarkDone(rev.chapterId, rev.revisionNumber)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </section>
        )}

        {/* Due Today Section */}
        {groupedRevisions.dueToday.length > 0 && (
          <section className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Calendar size={14} className="text-amber-400" />
              <h2 className="text-xs uppercase tracking-wider text-amber-400 font-semibold">
                Due Today ({groupedRevisions.dueToday.length})
              </h2>
            </div>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-2"
            >
              <AnimatePresence mode="popLayout">
                {groupedRevisions.dueToday.map((rev) => (
                  <motion.div
                    key={`${rev.chapterId}-${rev.revisionNumber}`}
                    variants={itemVariants}
                    layout
                  >
                    <RevisionAlert
                      revisionNumber={rev.revisionNumber}
                      subjectColor={getSubjectColor(rev.subjectId)}
                      chapterName={getChapterName(rev.chapterId)}
                      onMarkDone={() => handleMarkDone(rev.chapterId, rev.revisionNumber)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </section>
        )}

        {/* Due Tomorrow Section */}
        {groupedRevisions.dueTomorrow.length > 0 && (
          <section className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Calendar size={14} className="text-zinc-400" />
              <h2 className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">
                Tomorrow ({groupedRevisions.dueTomorrow.length})
              </h2>
            </div>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-2"
            >
              {groupedRevisions.dueTomorrow.map((rev) => (
                <motion.div
                  key={`${rev.chapterId}-${rev.revisionNumber}`}
                  variants={itemVariants}
                >
                  <RevisionAlert
                    revisionNumber={rev.revisionNumber}
                    subjectColor={getSubjectColor(rev.subjectId)}
                    chapterName={getChapterName(rev.chapterId)}
                    onMarkDone={() => handleMarkDone(rev.chapterId, rev.revisionNumber)}
                  />
                </motion.div>
              ))}
            </motion.div>
          </section>
        )}

        {/* Upcoming Section */}
        {groupedRevisions.upcoming.length > 0 && (
          <section className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Calendar size={14} className="text-zinc-500" />
              <h2 className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">
                Upcoming This Week ({groupedRevisions.upcoming.length})
              </h2>
            </div>
            <div className="space-y-2 opacity-70">
              {groupedRevisions.upcoming.map((rev) => (
                <div
                  key={`${rev.chapterId}-${rev.revisionNumber}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/50"
                >
                  <RefreshCcw size={16} className="text-zinc-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-400 truncate">
                      {getChapterName(rev.chapterId)}
                    </p>
                    <p className="text-xs text-zinc-600">
                      R{rev.revisionNumber} • {format(parseISO(rev.dueDate), "EEE, MMM d")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Completed Section */}
        {groupedRevisions.completed.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 size={14} className="text-emerald-500" />
              <h2 className="text-xs uppercase tracking-wider text-zinc-600 font-semibold">
                Recently Completed
              </h2>
            </div>
            <div className="space-y-2 opacity-50">
              {groupedRevisions.completed.map((rev) => (
                <RevisionAlert
                  key={`${rev.chapterId}-${rev.revisionNumber}`}
                  revisionNumber={rev.revisionNumber}
                  subjectColor={getSubjectColor(rev.subjectId)}
                  chapterName={getChapterName(rev.chapterId)}
                  onMarkDone={() => {}}
                  isCompleted={true}
                />
              ))}
            </div>
          </section>
        )}

        {/* Revision Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800/50"
        >
          <h3 className="text-xs font-semibold text-zinc-400 mb-2">📚 Revision Schedule</h3>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Revisions are scheduled at +3, +7, +21, and +45 days after completing a chapter.
            This spaced repetition pattern helps solidify long-term memory.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default RevisionsPage;

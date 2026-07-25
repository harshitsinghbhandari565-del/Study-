"use client";

/**
 * STUDYMAP — Boss Tracker
 *
 * Tracks progress on boss chapters which give 3× XP rewards.
 * Shows completion status and remaining resources for each boss.
 */

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Skull, Gift, CheckCircle2, Swords } from "lucide-react";

import { SUBJECTS, RESOURCE_TYPES } from "@/lib/constants";
import { calculateSubjectProgress, calculateBossReward } from "@/lib/utils";
import { BossBadge } from "@/components/ui/boss-badge";
import type { Chapter, Subject } from "@/lib/types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface BossTrackerProps {
  /** All chapters from context */
  chapters: Chapter[];
  /** Subjects for color lookup */
  subjects?: Subject[];
}

// ─── Helper Functions ─────────────────────────────────────────────────────────

/**
 * Get subject by ID
 */
function getSubject(subjectId: string): Subject | undefined {
  return SUBJECTS.find((s) => s.id === subjectId);
}

/**
 * Calculate total potential XP for a boss chapter
 */
function calculateBossRewardTotal(chapter: Chapter): number {
  const baseXP = chapter.resources.reduce((sum, r) => {
    const resourceType = RESOURCE_TYPES.find((rt) => rt.id === r.typeId);
    return sum + (resourceType?.xpValue || 0);
  }, 0);
  return calculateBossReward(baseXP);
}

// ─── Animation Variants ───────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
    },
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * BossTracker
 *
 * Renders a list of boss chapters with progress and reward information.
 */
export function BossTracker({ chapters }: BossTrackerProps) {
  /**
   * Filter boss chapters
   */
  const bossChapters = useMemo(() => {
    return chapters.filter((ch) => ch.isBoss);
  }, [chapters]);

  /**
   * Calculate stats for each boss
   */
  const bossStats = useMemo(() => {
    return bossChapters.map((chapter) => {
      const subject = getSubject(chapter.subjectId);
      const progress = calculateSubjectProgress(chapter);
      const totalResources = chapter.resources.length;
      const completedResources = chapter.resources.filter((r) => r.completed).length;
      const isCompleted = completedResources === totalResources;
      const potentialReward = calculateBossRewardTotal(chapter);

      return {
        chapter,
        subject,
        progress,
        totalResources,
        completedResources,
        isCompleted,
        potentialReward,
      };
    });
  }, [bossChapters]);

  /**
   * Count completed bosses
   */
  const completedCount = useMemo(() => {
    return bossStats.filter((b) => b.isCompleted).length;
  }, [bossStats]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-red-500/10">
            <Skull size={16} className="text-red-400" />
          </div>
          <h3 className="font-semibold text-zinc-100">Boss Tracker</h3>
        </div>
        <span className="text-xs text-zinc-500">
          {completedCount}/{bossChapters.length} slain
        </span>
      </div>

      {/* Boss List */}
      {bossChapters.length === 0 ? (
        <div className="text-center py-6">
          <Swords size={32} className="mx-auto text-zinc-700 mb-3" />
          <p className="text-sm text-zinc-500">No bosses marked yet</p>
          <p className="text-xs text-zinc-600 mt-1">
            Mark chapters as bosses for 3× XP rewards
          </p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          {bossStats.map(({
            chapter,
            subject,
            progress,
            totalResources,
            completedResources,
            isCompleted,
            potentialReward,
          }) => (
            <motion.div
              key={chapter.id}
              variants={itemVariants}
              className={`
                p-3 rounded-xl border transition-all
                ${isCompleted
                  ? "bg-emerald-500/10 border-emerald-500/30"
                  : "bg-zinc-800/50 border-zinc-700/50"
                }
              `}
            >
              <div className="flex items-start gap-3">
                {/* Boss Badge */}
                <div className="shrink-0 mt-0.5">
                  <BossBadge size="sm" pulse={!isCompleted} />
                </div>

                {/* Boss Info */}
                <div className="flex-1 min-w-0">
                  {/* Name Row */}
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: subject?.color || "#71717a" }}
                    />
                    <span className="font-medium text-zinc-100 truncate text-sm">
                      {chapter.name}
                    </span>
                    {isCompleted && (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded font-semibold shrink-0">
                        <CheckCircle2 size={10} />
                        SLAIN
                      </span>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="h-2 bg-zinc-700 rounded-full overflow-hidden mb-1.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: isCompleted
                          ? "#10b981" // emerald-500
                          : subject?.color || "#71717a",
                      }}
                    />
                  </div>

                  {/* Stats Row */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-500">
                      {completedResources}/{totalResources} resources
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-amber-400 font-medium">
                      <Gift size={10} />
                      {potentialReward} XP
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Completion Reward Info */}
      {bossChapters.length > 0 && completedCount < bossChapters.length && (
        <div className="mt-4 pt-3 border-t border-zinc-800">
          <p className="text-[10px] text-zinc-500 text-center">
            🎯 Complete all resources in a boss chapter to slay it and earn 3× XP!
          </p>
        </div>
      )}

      {/* All Bosses Slain Message */}
      {bossChapters.length > 0 && completedCount === bossChapters.length && (
        <div className="mt-4 pt-3 border-t border-zinc-800">
          <p className="text-sm text-emerald-400 text-center font-medium">
            🏆 All bosses slain! You're a legend!
          </p>
        </div>
      )}
    </motion.div>
  );
}

export default BossTracker;

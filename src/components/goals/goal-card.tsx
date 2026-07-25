"use client";

/**
 * STUDYMAP — Goal Card Component
 *
 * Displays a single goal with progress tracking, deadline status,
 * and pace indicators to help students stay on track.
 */

import { useMemo } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, Trash2, Target, Clock } from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";

import { ProgressBar } from "@/components/ui/progress-bar";
import { SUBJECTS } from "@/lib/constants";
import { calculateGoalPace } from "@/lib/utils";
import type { Goal } from "@/lib/types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface GoalCardProps {
  /** The goal to display */
  goal: Goal;
  /** Optional callback to delete the goal */
  onDelete?: () => void;
}

// ─── Helper Functions ─────────────────────────────────────────────────────────

/**
 * Get subject by ID
 */
function getSubject(subjectId: string) {
  return SUBJECTS.find((s) => s.id === subjectId);
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * GoalCard
 *
 * Renders a goal card with progress, deadline, and pace information.
 */
export function GoalCard({ goal, onDelete }: GoalCardProps) {
  const subject = getSubject(goal.subjectId);

  /**
   * Calculate progress percentage
   */
  const progressPercent = useMemo(() => {
    if (goal.targetCount === 0) return 0;
    return Math.min(100, Math.round((goal.progressCount / goal.targetCount) * 100));
  }, [goal.progressCount, goal.targetCount]);

  /**
   * Check if goal is completed
   */
  const isCompleted = progressPercent >= 100;

  /**
   * Calculate days until deadline
   */
  const deadlineInfo = useMemo(() => {
    const today = new Date();
    const deadline = parseISO(goal.deadline);
    const daysLeft = differenceInDays(deadline, today);

    return {
      daysLeft,
      isOverdue: daysLeft < 0,
      deadlineText:
        daysLeft < 0
          ? `Overdue by ${Math.abs(daysLeft)} day${Math.abs(daysLeft) !== 1 ? "s" : ""}`
          : daysLeft === 0
            ? "Due today"
            : daysLeft === 1
              ? "Due tomorrow"
              : `Due in ${daysLeft} days`,
    };
  }, [goal.deadline]);

  /**
   * Calculate pace status
   */
  const paceInfo = useMemo(() => {
    return calculateGoalPace(goal);
  }, [goal]);

  /**
   * Get target type label
   */
  const targetTypeLabel = useMemo(() => {
    switch (goal.targetType) {
      case "complete-chapters":
        return "chapters";
      case "complete-resources":
        return "resources";
      case "complete-pyqs":
        return "PYQs";
      default:
        return "items";
    }
  }, [goal.targetType]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`
        bg-zinc-900 border rounded-xl p-4 transition-all
        ${isCompleted
          ? "border-emerald-500/50 bg-emerald-500/5"
          : deadlineInfo.isOverdue
            ? "border-red-500/30"
            : "border-zinc-800"
        }
      `}
    >
      {/* Header Row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          {/* Goal Description */}
          <h3 className="font-semibold text-zinc-100 mb-2 leading-tight">
            {goal.description || `Complete ${goal.targetCount} ${targetTypeLabel}`}
          </h3>

          {/* Subject Tag */}
          {subject && (
            <span
              className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: `${subject.color}20`,
                color: subject.color,
              }}
            >
              {subject.name}
            </span>
          )}
        </div>

        {/* Completed Badge or Delete */}
        <div className="flex items-center gap-2 shrink-0">
          {isCompleted ? (
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/20 px-2 py-1 rounded-lg">
              <CheckCircle2 size={14} />
              Completed
            </span>
          ) : onDelete ? (
            <button
              onClick={onDelete}
              className="p-2 text-zinc-600 hover:text-red-400 transition-colors rounded-lg hover:bg-zinc-800"
            >
              <Trash2 size={16} />
            </button>
          ) : null}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <ProgressBar
          progress={progressPercent}
          color={isCompleted ? "#10b981" : subject?.color || "#ffffff"}
          height={8}
          showLabel={false}
          animate={true}
        />
      </div>

      {/* Stats Row */}
      <div className="flex items-center justify-between text-xs mb-2">
        <span className="text-zinc-400">
          {goal.progressCount} / {goal.targetCount} {targetTypeLabel}
        </span>
        <span className="text-zinc-300 font-medium">{progressPercent}%</span>
      </div>

      {/* Deadline & Pace Row */}
      {!isCompleted && (
        <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
          {/* Deadline */}
          <div className="flex items-center gap-1.5">
            <Clock size={12} className={deadlineInfo.isOverdue ? "text-red-400" : "text-zinc-500"} />
            <span
              className={`text-xs font-medium ${
                deadlineInfo.isOverdue ? "text-red-400" : "text-zinc-500"
              }`}
            >
              {deadlineInfo.deadlineText}
            </span>
          </div>

          {/* Pace Indicator */}
          <div className="flex items-center gap-1.5">
            {paceInfo.behindPace ? (
              <>
                <AlertTriangle size={12} className="text-amber-400" />
                <span className="text-xs font-medium text-amber-400">Behind pace</span>
              </>
            ) : (
              <>
                <Target size={12} className="text-emerald-400" />
                <span className="text-xs font-medium text-emerald-400">On track</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Completed Date */}
      {isCompleted && (
        <div className="pt-2 border-t border-emerald-500/20">
          <p className="text-xs text-emerald-400/70 text-center">
            🎉 Goal achieved!
          </p>
        </div>
      )}
    </motion.div>
  );
}

export default GoalCard;

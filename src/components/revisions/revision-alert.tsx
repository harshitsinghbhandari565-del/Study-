"use client";

/**
 * STUDYMAP — Revision Alert Component
 *
 * A compact row/card for displaying a due revision with a mark done action.
 * Part of the spaced repetition system.
 */

import { motion } from "framer-motion";
import { RefreshCcw, Check } from "lucide-react";

// ─── Props ────────────────────────────────────────────────────────────────────

interface RevisionAlertProps {
  /** The revision number (1-4) */
  revisionNumber: 1 | 2 | 3 | 4;
  /** The subject color as hex string */
  subjectColor: string;
  /** The name of the chapter to revise */
  chapterName: string;
  /** Callback when the revision is marked as done */
  onMarkDone: () => void;
  /** Whether this revision is completed */
  isCompleted?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * RevisionAlert
 *
 * A compact card showing a revision that needs to be done with a CTA button.
 */
export function RevisionAlert({
  revisionNumber,
  subjectColor,
  chapterName,
  onMarkDone,
  isCompleted = false,
}: RevisionAlertProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className={`
        flex items-center gap-3 p-3 rounded-lg border transition-all
        ${isCompleted
          ? "bg-emerald-500/10 border-emerald-500/30 opacity-60"
          : "bg-zinc-900 border-zinc-800"
        }
      `}
    >
      {/* Revision Icon */}
      <div
        className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0"
        style={{ backgroundColor: `${subjectColor}20` }}
      >
        <RefreshCcw
          size={18}
          style={{ color: subjectColor }}
          className={isCompleted ? "opacity-50" : ""}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={`font-medium text-sm truncate ${
            isCompleted ? "text-zinc-500 line-through" : "text-zinc-100"
          }`}
        >
          {chapterName}
        </p>
        <p className="text-xs text-zinc-500">
          Revision #{revisionNumber}
          {isCompleted && " • Completed"}
        </p>
      </div>

      {/* Action Button */}
      {!isCompleted ? (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onMarkDone}
          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-500 transition-colors min-h-[36px] shrink-0"
        >
          <Check size={14} />
          Done
        </motion.button>
      ) : (
        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-emerald-500/20 shrink-0">
          <Check size={16} className="text-emerald-400" />
        </div>
      )}
    </motion.div>
  );
}

export default RevisionAlert;

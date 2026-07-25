"use client";

/**
 * STUDYMAP — Chapter Card Component
 *
 * A rich, expandable card displaying chapter progress, resources,
 * and confidence rating. Supports resource toggling and session logging.
 */

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Check,
  Play,
} from "lucide-react";

import { ProgressBar } from "@/components/ui/progress-bar";
import { BossBadge } from "@/components/ui/boss-badge";
import { ConfidenceRating } from "@/components/ui/confidence-rating";

import { formatStudyDate, getResourceTypeById, calculateSubjectProgress } from "@/lib/utils";
import type { Chapter, ConfidenceLevel } from "@/lib/types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ChapterCardProps {
  /** The chapter data to display */
  chapter: Chapter;
  /** Subject color as hex string for styling */
  subjectColor: string;
  /** Callback when a resource is toggled */
  onToggleResource: (resourceId: string) => void;
  /** Callback when confidence is set */
  onSetConfidence: (confidence: ConfidenceLevel) => void;
  /** Callback to log a session with a specific resource */
  onLogSession: (resourceId: string) => void;
}

// ─── Animation Variants ───────────────────────────────────────────────────────

const expandVariants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: {
      height: { duration: 0.3, ease: "easeInOut" as const },
      opacity: { duration: 0.2 },
    },
  },
  expanded: {
    height: "auto",
    opacity: 1,
    transition: {
      height: { duration: 0.3, ease: "easeInOut" as const },
      opacity: { duration: 0.3, delay: 0.1 },
    },
  },
};

const checkboxVariants = {
  unchecked: { scale: 1 },
  checked: { scale: [1, 1.2, 1] },
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * ChapterCard
 *
 * A collapsible card that shows chapter overview in collapsed state
 * and full resource checklist in expanded state.
 */
export function ChapterCard({
  chapter,
  subjectColor,
  onToggleResource,
  onSetConfidence,
  onLogSession,
}: ChapterCardProps) {
  // Auto-expand if low confidence or boss chapter
  const shouldAutoExpand = chapter.confidence === 1 || chapter.isBoss;
  const [isExpanded, setIsExpanded] = useState(shouldAutoExpand);

  /**
   * Calculate chapter progress percentage
   */
  const progress = useMemo(() => {
    return calculateSubjectProgress(chapter);
  }, [chapter]);

  /**
   * Get the first uncompleted resource for quick logging
   */
  const firstUncompletedResource = useMemo(() => {
    return chapter.resources.find((r) => !r.completed);
  }, [chapter.resources]);

  /**
   * Count completed resources
   */
  const completedCount = useMemo(() => {
    return chapter.resources.filter((r) => r.completed).length;
  }, [chapter.resources]);

  /**
   * Handle card header click to toggle expansion
   */
  const handleToggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  /**
   * Handle resource checkbox toggle
   */
  const handleResourceToggle = useCallback(
    (resourceId: string) => {
      onToggleResource(resourceId);
    },
    [onToggleResource]
  );

  /**
   * Handle quick log session
   */
  const handleQuickLog = useCallback(() => {
    if (firstUncompletedResource) {
      onLogSession(firstUncompletedResource.id);
    } else if (chapter.resources.length > 0) {
      // If all completed, log with the last resource
      onLogSession(chapter.resources[chapter.resources.length - 1].id);
    }
  }, [firstUncompletedResource, chapter.resources, onLogSession]);

  /**
   * Handle confidence change
   */
  const handleConfidenceChange = useCallback(
    (value: ConfidenceLevel) => {
      onSetConfidence(value);
    },
    [onSetConfidence]
  );

  return (
    <motion.div
      layout
      className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden"
    >
      {/* ─── Card Header (Always Visible) ─────────────────────────────────── */}
      <button
        onClick={handleToggleExpand}
        className="w-full p-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-zinc-600 min-h-[80px]"
      >
        {/* Top Row: Name, Boss Badge, Chevron */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <h3 className="font-semibold text-zinc-100 truncate">
              {chapter.name}
            </h3>
            {chapter.isBoss && <BossBadge size="sm" pulse={!isExpanded} />}
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="shrink-0 ml-2"
          >
            <ChevronDown size={20} className="text-zinc-500" />
          </motion.div>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <ProgressBar
            progress={progress}
            color={subjectColor}
            height={6}
            showLabel={false}
            animate={true}
          />
        </div>

        {/* Metadata Row */}
        <div className="flex items-center flex-wrap gap-x-3 gap-y-1">
          {/* Sessions Count */}
          <span className="text-xs text-zinc-500">
            Sessions: <span className="text-zinc-400">{chapter.sessionsCount}</span>
          </span>

          {/* Last Studied */}
          {chapter.lastStudied && (
            <>
              <span className="text-zinc-700">·</span>
              <span className="text-xs text-zinc-500">
                Last: <span className="text-zinc-400">{formatStudyDate(chapter.lastStudied)}</span>
              </span>
            </>
          )}

          {/* XP Earned */}
          <span className="text-zinc-700">·</span>
          <span className="text-xs text-zinc-500">
            XP: <span className="text-zinc-400">{chapter.xpEarned}</span>
          </span>

          {/* Confidence Rating (Read-only) */}
          <div className="ml-auto">
            <ConfidenceRating value={chapter.confidence} size="sm" readOnly />
          </div>
        </div>
      </button>

      {/* ─── Expanded Content ─────────────────────────────────────────────── */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="content"
            variants={expandVariants}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0 space-y-4 border-t border-zinc-800">
              {/* Resource Progress Summary */}
              <div className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Resources
                  </span>
                  <span className="text-xs text-zinc-400">
                    {completedCount}/{chapter.resources.length} completed
                  </span>
                </div>
              </div>

              {/* Resource Checklist */}
              <div className="space-y-1">
                {chapter.resources.map((resource) => {
                  const resourceType = getResourceTypeById(resource.typeId);
                  const resourceName = resourceType?.name || "Unknown Resource";
                  const xpValue = resourceType?.xpValue || 0;
                  const finalXP = chapter.isBoss ? xpValue * 3 : xpValue;

                  return (
                    <motion.button
                      key={resource.id}
                      onClick={() => handleResourceToggle(resource.id)}
                      whileTap={{ scale: 0.98 }}
                      className={`
                        w-full flex items-center gap-3 p-3 rounded-lg
                        transition-colors min-h-[52px]
                        ${resource.completed
                          ? "bg-emerald-500/10"
                          : "bg-zinc-800/50 hover:bg-zinc-800"
                        }
                      `}
                    >
                      {/* Checkbox */}
                      <motion.div
                        variants={checkboxVariants}
                        animate={resource.completed ? "checked" : "unchecked"}
                        className={`
                          flex items-center justify-center w-6 h-6 rounded-md
                          shrink-0 transition-colors
                          ${resource.completed
                            ? "bg-emerald-500"
                            : "bg-zinc-800 border border-zinc-700"
                          }
                        `}
                      >
                        {resource.completed && (
                          <Check size={14} className="text-white" strokeWidth={3} />
                        )}
                      </motion.div>

                      {/* Resource Name */}
                      <span
                        className={`
                          flex-1 text-left text-sm font-medium truncate
                          ${resource.completed ? "text-zinc-400 line-through" : "text-zinc-200"}
                        `}
                      >
                        {resourceName}
                      </span>

                      {/* XP Value */}
                      <span
                        className={`
                          text-xs shrink-0 tabular-nums
                          ${resource.completed ? "text-zinc-600" : "text-zinc-500"}
                        `}
                      >
                        +{finalXP} XP
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Log Session Button */}
              <motion.button
                onClick={handleQuickLog}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-white text-zinc-900 font-semibold min-h-[48px] hover:bg-zinc-100 transition-colors"
              >
                <Play size={18} fill="currentColor" />
                Log a Session
              </motion.button>

              {/* Confidence Rating Section */}
              <div className="pt-2 border-t border-zinc-800">
                <div className="flex flex-col items-center gap-3 py-2">
                  <span className="text-xs text-zinc-500">
                    How well do you know this?
                  </span>
                  <ConfidenceRating
                    value={chapter.confidence}
                    onChange={handleConfidenceChange}
                    size="lg"
                    readOnly={false}
                  />
                </div>
              </div>

              {/* Boss Chapter Bonus Info */}
              {chapter.isBoss && (
                <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <span className="text-sm text-red-400 font-medium">
                    🔥 Boss Chapter — All XP rewards are 3×!
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default ChapterCard;

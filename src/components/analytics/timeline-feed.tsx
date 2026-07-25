"use client";

/**
 * STUDYMAP — Timeline Feed
 *
 * A reverse-chronological feed of study sessions grouped by day.
 * Shows session details including subject, chapter, resource, XP, and confidence.
 */

import { useMemo } from "react";
import { motion } from "framer-motion";
import { BookOpen, Flame, Clock } from "lucide-react";
import { format, parseISO, isToday, isYesterday } from "date-fns";

import { ConfidenceRating } from "@/components/ui/confidence-rating";
import { SUBJECTS, RESOURCE_TYPES } from "@/lib/constants";
import type { StudySession, Subject } from "@/lib/types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface TimelineFeedProps {
  /** Array of study sessions from context */
  sessions: StudySession[];
  /** Current streak count to determine streak days */
  currentStreak?: number;
}

// ─── Helper Functions ─────────────────────────────────────────────────────────

/**
 * Format a date string for group headers
 */
function formatDateHeader(dateStr: string): string {
  const date = parseISO(dateStr);

  if (isToday(date)) {
    return "Today";
  }
  if (isYesterday(date)) {
    return "Yesterday";
  }

  return format(date, "EEEE, d MMM");
}

/**
 * Get subject by ID
 */
function getSubject(subjectId: string): Subject | undefined {
  return SUBJECTS.find((s) => s.id === subjectId);
}

/**
 * Get resource type name by ID
 */
function getResourceTypeName(resourceId: string): string {
  // Extract resource type from ID (e.g., "physics-0-resource-8" -> index 8)
  const parts = resourceId.split("-");
  const resourceIndex = parseInt(parts[parts.length - 1], 10);

  if (!isNaN(resourceIndex) && RESOURCE_TYPES[resourceIndex]) {
    return RESOURCE_TYPES[resourceIndex].name;
  }

  // Try matching by typeId
  const resourceType = RESOURCE_TYPES.find((rt) =>
    resourceId.includes(rt.id) || resourceId.endsWith(rt.id)
  );

  return resourceType?.name || "Study Session";
}

// ─── Animation Variants ───────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.2,
    },
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * TimelineFeed
 *
 * Renders a chronological feed of study sessions grouped by day.
 */
export function TimelineFeed({ sessions, currentStreak = 0 }: TimelineFeedProps) {
  /**
   * Group sessions by date (YYYY-MM-DD)
   */
  const groupedSessions = useMemo(() => {
    const groups: Map<string, StudySession[]> = new Map();

    // Sort sessions by timestamp (newest first)
    const sorted = [...sessions].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    sorted.forEach((session) => {
      const dateKey = format(parseISO(session.timestamp), "yyyy-MM-dd");
      const existing = groups.get(dateKey) || [];
      groups.set(dateKey, [...existing, session]);
    });

    return Array.from(groups.entries());
  }, [sessions]);

  /**
   * Determine if a date is part of the current streak
   * (simplified: assume last N days where N = currentStreak)
   */
  const isStreakDay = useMemo(() => {
    const streakDays = new Set<string>();
    const today = new Date();

    for (let i = 0; i < currentStreak; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      streakDays.add(format(date, "yyyy-MM-dd"));
    }

    return (dateStr: string) => streakDays.has(dateStr);
  }, [currentStreak]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-lg bg-indigo-500/10">
          <Clock size={16} className="text-indigo-400" />
        </div>
        <h3 className="font-semibold text-zinc-100">Session Timeline</h3>
        <span className="ml-auto text-xs text-zinc-500">
          {sessions.length} total
        </span>
      </div>

      {/* Timeline Content */}
      <div className="max-h-[400px] overflow-y-auto pr-1 -mr-1">
        {groupedSessions.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
              <BookOpen size={28} className="text-zinc-600" />
            </div>
            <p className="text-zinc-500 text-sm">No sessions yet.</p>
            <p className="text-zinc-600 text-xs mt-1">Start grinding!</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {groupedSessions.map(([dateKey, daySessions]) => {
              const streakActive = isStreakDay(dateKey);

              return (
                <div key={dateKey}>
                  {/* Date Header */}
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                      {formatDateHeader(dateKey)}
                    </h4>
                    {streakActive && (
                      <Flame size={12} className="text-orange-400" />
                    )}
                    <div className="flex-1 h-px bg-zinc-800" />
                    <span className="text-[10px] text-zinc-600">
                      {daySessions.length} session{daySessions.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Session Cards */}
                  <div className="space-y-2">
                    {daySessions.map((session) => {
                      const subject = getSubject(session.subjectId);
                      const resourceName = getResourceTypeName(session.resourceId);

                      return (
                        <motion.div
                          key={session.id}
                          variants={itemVariants}
                          className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800/80 transition-colors"
                        >
                          {/* Subject Color Indicator */}
                          <div
                            className="w-1 h-full min-h-[50px] rounded-full shrink-0"
                            style={{ backgroundColor: subject?.color || "#71717a" }}
                          />

                          {/* Session Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="font-medium text-zinc-200 text-sm truncate">
                                  {subject?.name || "Unknown Subject"}
                                </p>
                                <p className="text-xs text-zinc-500 truncate">
                                  {resourceName}
                                </p>
                              </div>

                              {/* XP Badge */}
                              <span
                                className="text-xs font-semibold shrink-0 px-2 py-0.5 rounded"
                                style={{
                                  backgroundColor: `${subject?.color || "#71717a"}20`,
                                  color: subject?.color || "#71717a",
                                }}
                              >
                                +{session.xpEarned} XP
                              </span>
                            </div>

                            {/* Bottom Row: Time + Confidence */}
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-[10px] text-zinc-600">
                                {format(parseISO(session.timestamp), "h:mm a")}
                              </span>
                              <ConfidenceRating
                                value={session.confidence}
                                size="sm"
                                readOnly
                              />
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default TimelineFeed;

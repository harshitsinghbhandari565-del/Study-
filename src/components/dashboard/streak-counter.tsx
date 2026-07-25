"use client";

/**
 * STUDYMAP — Streak Counter Component
 *
 * Displays the user's current study streak with flame animation,
 * freeze cards status, and best streak indicator.
 */

import { motion } from "framer-motion";
import { Flame, Snowflake, Trophy } from "lucide-react";
import { STREAK_FREEZE_MAX } from "@/lib/constants";

interface StreakCounterProps {
  /** Current consecutive day streak */
  currentStreak: number;
  /** Number of freeze cards remaining this month */
  freezeCardsLeft: number;
  /** All-time longest streak */
  longestStreak: number;
}

/**
 * StreakCounter
 *
 * A visually engaging component showing the user's streak progress.
 * Features animated flame icon, freeze card indicators, and best streak badge.
 */
export function StreakCounter({
  currentStreak,
  freezeCardsLeft,
  longestStreak,
}: StreakCounterProps) {
  const isNewBest = currentStreak >= longestStreak && currentStreak > 0;
  const dayText = currentStreak === 1 ? "Day" : "Days";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full bg-zinc-900 rounded-xl p-4 border border-zinc-800"
    >
      {/* Main Streak Display */}
      <div className="flex items-center justify-center gap-3 mb-3">
        {/* Animated Flame Icon */}
        <motion.div
          animate={
            currentStreak > 0
              ? {
                  scale: [1, 1.15, 1],
                }
              : {}
          }
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative"
        >
          <Flame
            size={40}
            className={
              currentStreak > 0
                ? "text-orange-500 fill-orange-500/50"
                : "text-zinc-600"
            }
          />
          {/* Glow effect for active streaks */}
          {currentStreak > 0 && (
            <div className="absolute inset-0 blur-lg bg-orange-500/30 rounded-full -z-10" />
          )}
        </motion.div>

        {/* Streak Number and Text */}
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-2">
            <span className="text-4xl font-bold text-zinc-50 tabular-nums">
              {currentStreak}
            </span>
            {/* Best Streak Badge */}
            {isNewBest && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1 bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full text-xs font-semibold"
              >
                <Trophy size={12} />
                Best
              </motion.div>
            )}
          </div>
          <span className="text-sm text-zinc-400">
            {dayText} Streak
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-zinc-800 my-3" />

      {/* Freeze Cards Section */}
      <div className="flex items-center justify-center gap-2">
        <div className="flex items-center gap-1">
          {/* Render freeze card icons */}
          {Array.from({ length: STREAK_FREEZE_MAX }).map((_, index) => {
            const isAvailable = index < freezeCardsLeft;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Snowflake
                  size={18}
                  className={
                    isAvailable
                      ? "text-cyan-400"
                      : "text-zinc-600"
                  }
                  strokeWidth={isAvailable ? 2 : 1.5}
                />
              </motion.div>
            );
          })}
        </div>
        <span className="text-sm text-zinc-500">
          Freeze Cards: {freezeCardsLeft}/{STREAK_FREEZE_MAX}
        </span>
      </div>

      {/* Streak Milestone Indicator */}
      {currentStreak > 0 && currentStreak < 7 && (
        <div className="mt-3 text-center">
          <p className="text-xs text-zinc-500">
            {7 - currentStreak} more {7 - currentStreak === 1 ? "day" : "days"} until 7-day bonus! 🎯
          </p>
        </div>
      )}

      {currentStreak >= 7 && currentStreak < 30 && (
        <div className="mt-3 text-center">
          <p className="text-xs text-emerald-400">
            🔥 7-day streak unlocked! Next: 30-day bonus
          </p>
        </div>
      )}

      {currentStreak >= 30 && (
        <div className="mt-3 text-center">
          <p className="text-xs text-amber-400">
            🏆 Legendary streak! Keep the fire burning!
          </p>
        </div>
      )}
    </motion.div>
  );
}

export default StreakCounter;

"use client";

/**
 * STUDYMAP — Badge Grid
 *
 * A grid display of achievement badges showing earned and locked status.
 * Badges represent milestones like streak keeping, boss slaying, etc.
 */

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Sword,
  Flame,
  Calendar,
  Scale,
  Zap,
  Star,
  Crown,
  Target,
  Award,
} from "lucide-react";
import { format, parseISO } from "date-fns";

import type { Badge } from "@/lib/types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface BadgeGridProps {
  /** Array of badges from context */
  badges: Badge[];
}

// ─── Icon Mapping ─────────────────────────────────────────────────────────────

/**
 * Map badge icon names to Lucide components
 */
const BADGE_ICONS: Record<
  string,
  React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: number | string }>
> = {
  Sword,
  Flame,
  Calendar,
  Scale,
  Zap,
  Star,
  Crown,
  Target,
  Award,
  Trophy,
};

function getBadgeIcon(iconName: string) {
  return BADGE_ICONS[iconName] || Award;
}

// ─── Animation Variants ───────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut" as const,
    },
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * BadgeGrid
 *
 * Renders a grid of achievement badges with earned/locked states.
 */
export function BadgeGrid({ badges }: BadgeGridProps) {
  /**
   * Sort badges: earned first, then by name
   */
  const sortedBadges = useMemo(() => {
    return [...badges].sort((a, b) => {
      if (a.earned && !b.earned) return -1;
      if (!a.earned && b.earned) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [badges]);

  /**
   * Count earned badges
   */
  const earnedCount = useMemo(() => {
    return badges.filter((b) => b.earned).length;
  }, [badges]);

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
          <div className="p-1.5 rounded-lg bg-amber-500/10">
            <Trophy size={16} className="text-amber-400" />
          </div>
          <h3 className="font-semibold text-zinc-100">Achievements</h3>
        </div>
        <span className="text-xs text-zinc-500">
          {earnedCount}/{badges.length} unlocked
        </span>
      </div>

      {/* Badge Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-3 sm:grid-cols-4 gap-2"
      >
        {sortedBadges.map((badge) => {
          const IconComponent = getBadgeIcon(badge.icon);
          const isEarned = badge.earned;

          return (
            <motion.div
              key={badge.id}
              variants={itemVariants}
              className={`
                relative flex flex-col items-center justify-center p-3 rounded-xl
                min-h-[100px] transition-all
                ${isEarned
                  ? "bg-zinc-800 ring-1 ring-amber-400/30"
                  : "bg-zinc-800/50 opacity-50"
                }
              `}
            >
              {/* Icon */}
              <div
                className={`
                  p-2 rounded-lg mb-2
                  ${isEarned ? "bg-amber-500/20" : "bg-zinc-700/50"}
                `}
              >
                <IconComponent
                  size={24}
                  className={isEarned ? "text-amber-400" : "text-zinc-600"}
                />
              </div>

              {/* Name */}
              <p
                className={`
                  text-xs font-semibold text-center leading-tight
                  ${isEarned ? "text-zinc-100" : "text-zinc-500"}
                `}
              >
                {badge.name}
              </p>

              {/* Description */}
              <p className="text-[9px] text-zinc-500 text-center mt-1 leading-tight">
                {badge.description}
              </p>

              {/* Earned Date */}
              {isEarned && badge.earnedAt && (
                <p className="text-[9px] text-amber-400/70 mt-1">
                  {format(parseISO(badge.earnedAt), "MMM d")}
                </p>
              )}

              {/* Locked Indicator */}
              {!isEarned && (
                <div className="absolute top-2 right-2">
                  <div className="w-4 h-4 rounded-full bg-zinc-700 flex items-center justify-center">
                    <span className="text-[8px] text-zinc-500">🔒</span>
                  </div>
                </div>
              )}

              {/* Earned Glow Effect */}
              {isEarned && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-amber-500/5 to-transparent pointer-events-none" />
              )}
            </motion.div>
          );
        })}
      </motion.div>

      {/* Empty State */}
      {badges.length === 0 && (
        <div className="text-center py-8">
          <Trophy size={32} className="mx-auto text-zinc-700 mb-3" />
          <p className="text-sm text-zinc-500">No badges available yet</p>
        </div>
      )}
    </motion.div>
  );
}

export default BadgeGrid;

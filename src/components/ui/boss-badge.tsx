"use client";

/**
 * STUDYMAP — Boss Badge Component
 *
 * A visual indicator for Boss chapters that grant 3× XP bonus.
 * Features a skull icon with optional pulse animation.
 */

import { motion } from "framer-motion";
import { Skull } from "lucide-react";

interface BossBadgeProps {
  /** Whether to show the pulsing glow animation. Default: true */
  pulse?: boolean;
  /** Size variant. Default: "md" */
  size?: "sm" | "md" | "lg";
}

/**
 * Size configuration mapping
 */
const SIZE_CONFIG = {
  sm: {
    iconSize: 12,
    fontSize: "text-[10px]",
    paddingX: "px-1.5",
    paddingY: "py-0.5",
    gap: "gap-0.5",
    borderRadius: "rounded-md",
  },
  md: {
    iconSize: 16,
    fontSize: "text-xs",
    paddingX: "px-2",
    paddingY: "py-1",
    gap: "gap-1",
    borderRadius: "rounded-lg",
  },
  lg: {
    iconSize: 20,
    fontSize: "text-sm",
    paddingX: "px-3",
    paddingY: "py-1.5",
    gap: "gap-1.5",
    borderRadius: "rounded-lg",
  },
} as const;

/**
 * BossBadge
 *
 * Renders an inline badge with a skull icon and "BOSS" text.
 * - Red-500 icon and text on dark background.
 * - Red border for emphasis.
 * - Optional infinite pulse glow animation.
 * - Designed to fit inline within flex rows.
 */
export function BossBadge({ pulse = true, size = "md" }: BossBadgeProps) {
  const config = SIZE_CONFIG[size];

  // Pulse animation variants
  const pulseVariants = {
    initial: {
      boxShadow: "0 0 0 0 rgba(239, 68, 68, 0)",
    },
    pulse: {
      boxShadow: [
        "0 0 0 0 rgba(239, 68, 68, 0.4)",
        "0 0 8px 2px rgba(239, 68, 68, 0.3)",
        "0 0 0 0 rgba(239, 68, 68, 0)",
      ],
    },
  };

  // Scale pulse animation for the skull icon
  const iconPulseVariants = {
    initial: { scale: 1 },
    pulse: {
      scale: [1, 1.1, 1],
    },
  };

  const BadgeContent = () => (
    <>
      {/* Skull icon */}
      <motion.div
        variants={pulse ? iconPulseVariants : undefined}
        initial="initial"
        animate={pulse ? "pulse" : "initial"}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="flex items-center justify-center"
      >
        <Skull
          size={config.iconSize}
          className="text-red-500"
          strokeWidth={2.5}
        />
      </motion.div>

      {/* BOSS text */}
      <span
        className={`${config.fontSize} font-bold tracking-wider text-red-500 uppercase`}
      >
        BOSS
      </span>
    </>
  );

  // Render with or without pulse animation wrapper
  if (pulse) {
    return (
      <motion.div
        className={`
          inline-flex items-center
          ${config.gap}
          ${config.paddingX} ${config.paddingY}
          ${config.borderRadius}
          bg-zinc-900/90
          border border-red-500/50
          backdrop-blur-sm
        `}
        variants={pulseVariants}
        initial="initial"
        animate="pulse"
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        aria-label="Boss chapter - 3x XP bonus"
        role="status"
      >
        <BadgeContent />
      </motion.div>
    );
  }

  // Static version without animation
  return (
    <div
      className={`
        inline-flex items-center
        ${config.gap}
        ${config.paddingX} ${config.paddingY}
        ${config.borderRadius}
        bg-zinc-900/90
        border border-red-500/50
      `}
      aria-label="Boss chapter - 3x XP bonus"
      role="status"
    >
      <BadgeContent />
    </div>
  );
}

/**
 * BossBadgeCompact
 *
 * A minimal version showing just the skull icon with tooltip-like behavior.
 * Useful for tight spaces like table cells.
 */
export function BossBadgeCompact({
  pulse = true,
  size = "sm",
}: BossBadgeProps) {
  const config = SIZE_CONFIG[size];

  const iconPulseVariants = {
    initial: { scale: 1, opacity: 0.9 },
    pulse: {
      scale: [1, 1.15, 1],
      opacity: [0.9, 1, 0.9],
    },
  };

  if (pulse) {
    return (
      <motion.div
        className="inline-flex items-center justify-center p-1 rounded-md bg-red-500/10"
        variants={iconPulseVariants}
        initial="initial"
        animate="pulse"
        transition={{
          duration: 1.8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        title="Boss Chapter - 3x XP"
        aria-label="Boss chapter"
      >
        <Skull size={config.iconSize} className="text-red-500" strokeWidth={2.5} />
      </motion.div>
    );
  }

  return (
    <div
      className="inline-flex items-center justify-center p-1 rounded-md bg-red-500/10"
      title="Boss Chapter - 3x XP"
      aria-label="Boss chapter"
    >
      <Skull size={config.iconSize} className="text-red-500" strokeWidth={2.5} />
    </div>
  );
}

/**
 * BossBadge3X
 *
 * Variant that emphasizes the 3X multiplier.
 */
export function BossBadge3X({ pulse = true, size = "md" }: BossBadgeProps) {
  const config = SIZE_CONFIG[size];

  const glowVariants = {
    initial: {
      opacity: 0.7,
    },
    pulse: {
      opacity: [0.7, 1, 0.7],
    },
  };

  return (
    <motion.div
      className={`
        inline-flex items-center
        ${config.gap}
        ${config.paddingX} ${config.paddingY}
        ${config.borderRadius}
        bg-gradient-to-r from-red-950/80 to-orange-950/80
        border border-red-500/60
      `}
      variants={pulse ? glowVariants : undefined}
      initial="initial"
      animate={pulse ? "pulse" : "initial"}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      style={{
        boxShadow: "0 0 12px rgba(239, 68, 68, 0.2)",
      }}
      aria-label="Boss chapter - 3x XP bonus"
      role="status"
    >
      {/* Skull icon */}
      <Skull
        size={config.iconSize}
        className="text-red-400"
        strokeWidth={2.5}
      />

      {/* 3X text */}
      <span
        className={`${config.fontSize} font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400`}
      >
        3X
      </span>
    </motion.div>
  );
}

export default BossBadge;

"use client";

/**
 * STUDYMAP — Progress Bar Component
 *
 * A reusable, animated progress bar with customizable color, height,
 * optional glow effect, and percentage label.
 */

import { motion } from "framer-motion";

interface ProgressBarProps {
  /** Current progress value from 0 to 100 */
  progress: number;
  /** Hex color string for the filled portion, e.g., "#3B82F6" */
  color: string;
  /** Height of the bar in pixels. Default: 12 */
  height?: number;
  /** Whether to show the percentage label. Default: true */
  showLabel?: boolean;
  /** Whether to animate the width change. Default: true */
  animate?: boolean;
  /** Whether to apply a glow effect when progress >= 100. Default: false */
  glow?: boolean;
}

/**
 * ProgressBar
 *
 * Renders a horizontal progress bar with Framer Motion animation.
 * - Clamps progress between 0 and 100.
 * - Shows a minimum 2% sliver when progress is 0 to indicate activity.
 * - Applies a colored box-shadow glow when glow=true and progress >= 100.
 */
export function ProgressBar({
  progress,
  color,
  height = 12,
  showLabel = true,
  animate = true,
  glow = false,
}: ProgressBarProps) {
  // Clamp progress between 0 and 100
  const clampedProgress = Math.max(0, Math.min(100, progress));

  // Show a tiny sliver (2%) when progress is 0 so the bar is visible
  const displayProgress = clampedProgress === 0 ? 2 : clampedProgress;

  // Determine if glow should be active (progress complete and glow enabled)
  const isGlowing = glow && clampedProgress >= 100;

  // Calculate appropriate font size based on bar height
  const fontSize = height >= 16 ? 12 : height >= 12 ? 10 : 8;

  // Determine if label fits inside the bar or should be outside
  const labelInside = height >= 14 && displayProgress >= 20;

  return (
    <div className="w-full flex items-center gap-2">
      {/* Progress bar container */}
      <div
        className="relative flex-1 rounded-full overflow-hidden bg-zinc-800"
        style={{ height: `${height}px` }}
        role="progressbar"
        aria-valuenow={clampedProgress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progress: ${clampedProgress}%`}
      >
        {/* Filled portion */}
        <motion.div
          className="absolute top-0 left-0 h-full rounded-full flex items-center justify-end"
          style={{
            backgroundColor: color,
            boxShadow: isGlowing
              ? `0 0 12px ${color}, 0 0 24px ${color}40`
              : "none",
          }}
          initial={animate ? { width: 0 } : { width: `${displayProgress}%` }}
          animate={{ width: `${displayProgress}%` }}
          transition={
            animate
              ? {
                  duration: 0.8,
                  ease: [0.32, 0.72, 0, 1], // Custom easing for smooth animation
                }
              : { duration: 0 }
          }
        >
          {/* Label inside the bar (for larger bars with enough progress) */}
          {showLabel && labelInside && (
            <span
              className="px-2 font-semibold text-white drop-shadow-sm"
              style={{ fontSize: `${fontSize}px` }}
            >
              {clampedProgress}%
            </span>
          )}
        </motion.div>

        {/* Ghost bar indicator when progress is 0 */}
        {clampedProgress === 0 && (
          <motion.div
            className="absolute top-0 left-0 h-full rounded-full opacity-40"
            style={{ backgroundColor: color, width: "2%" }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
      </div>

      {/* Label outside the bar (for smaller bars or low progress) */}
      {showLabel && !labelInside && (
        <span
          className="font-semibold text-zinc-300 tabular-nums min-w-[3ch] text-right"
          style={{ fontSize: `${fontSize + 2}px` }}
        >
          {clampedProgress}%
        </span>
      )}
    </div>
  );
}

export default ProgressBar;

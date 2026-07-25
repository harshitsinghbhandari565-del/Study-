"use client";

/**
 * STUDYMAP — Confidence Rating Component
 *
 * A three-star rating system for students to indicate their confidence
 * level with a chapter or topic. Supports read-only display and interactive mode.
 */

import { Star } from "lucide-react";
import type { ConfidenceLevel } from "@/lib/types";

interface ConfidenceRatingProps {
  /** Current confidence level: 0 (none), 1 (shaky), 2 (okay), 3 (solid) */
  value: ConfidenceLevel;
  /** Callback when user changes the rating. If undefined, component is read-only. */
  onChange?: (value: ConfidenceLevel) => void;
  /** Size variant for the stars */
  size?: "sm" | "md" | "lg";
  /** If true, disables interaction regardless of onChange presence */
  readOnly?: boolean;
}

/**
 * Size configuration mapping
 */
const SIZE_CONFIG = {
  sm: {
    starSize: 18,
    touchTarget: 32,
    gap: 4,
    labelSize: "text-xs",
  },
  md: {
    starSize: 24,
    touchTarget: 44,
    gap: 6,
    labelSize: "text-sm",
  },
  lg: {
    starSize: 32,
    touchTarget: 52,
    gap: 8,
    labelSize: "text-base",
  },
} as const;

/**
 * Confidence level labels
 */
const CONFIDENCE_LABELS: Record<ConfidenceLevel, string> = {
  0: "",
  1: "Shaky",
  2: "Okay",
  3: "Solid",
};

/**
 * ConfidenceRating
 *
 * Renders 3 stars horizontally that represent confidence level.
 * - Tapping a star sets the value to that star's index + 1.
 * - Tapping the same star again clears the rating (sets to 0).
 * - Displays a label below the stars when value > 0.
 * - Touch targets are at least 44px for accessibility.
 */
export function ConfidenceRating({
  value,
  onChange,
  size = "md",
  readOnly = false,
}: ConfidenceRatingProps) {
  const config = SIZE_CONFIG[size];
  const isInteractive = !readOnly && onChange !== undefined;

  /**
   * Handle star click/tap
   * If clicking the same value, clear to 0
   * Otherwise, set to the clicked star's value
   */
  const handleStarClick = (starIndex: number) => {
    if (!isInteractive || !onChange) return;

    const newValue = (starIndex + 1) as ConfidenceLevel;

    // If clicking the same star, toggle off (set to 0)
    if (newValue === value) {
      onChange(0);
    } else {
      onChange(newValue);
    }
  };

  /**
   * Handle keyboard interaction for accessibility
   */
  const handleKeyDown = (
    event: React.KeyboardEvent,
    starIndex: number
  ) => {
    if (!isInteractive) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleStarClick(starIndex);
    }
  };

  /**
   * Get the color for a star based on its position and current value
   */
  const getStarColor = (starIndex: number): string => {
    if (value >= starIndex + 1) {
      return "#fbbf24"; // amber-400
    }
    return "#52525b"; // zinc-600
  };

  /**
   * Check if a star should be filled
   */
  const isStarFilled = (starIndex: number): boolean => {
    return value >= starIndex + 1;
  };

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Stars container */}
      <div
        className="flex items-center"
        style={{ gap: `${config.gap}px` }}
        role="group"
        aria-label={`Confidence rating: ${value} out of 3 stars`}
      >
        {[0, 1, 2].map((starIndex) => {
          const filled = isStarFilled(starIndex);
          const starColor = getStarColor(starIndex);
          const ariaLabel = `${starIndex + 1} star${starIndex === 0 ? "" : "s"}: ${
            CONFIDENCE_LABELS[(starIndex + 1) as ConfidenceLevel]
          }`;

          return (
            <button
              key={starIndex}
              type="button"
              onClick={() => handleStarClick(starIndex)}
              onKeyDown={(e) => handleKeyDown(e, starIndex)}
              disabled={!isInteractive}
              className={`
                flex items-center justify-center
                transition-all duration-150 ease-out
                rounded-lg
                focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50
                ${isInteractive ? "cursor-pointer hover:scale-110 active:scale-95" : "cursor-default"}
                ${!isInteractive ? "opacity-90" : ""}
              `}
              style={{
                width: `${config.touchTarget}px`,
                height: `${config.touchTarget}px`,
                minWidth: `${config.touchTarget}px`,
                minHeight: `${config.touchTarget}px`,
              }}
              aria-label={ariaLabel}
              aria-pressed={filled}
              tabIndex={isInteractive ? 0 : -1}
            >
              <Star
                size={config.starSize}
                className={`
                  transition-colors duration-150
                  ${filled ? "fill-current" : "fill-transparent"}
                `}
                style={{ color: starColor }}
                strokeWidth={filled ? 0 : 2}
              />
            </button>
          );
        })}
      </div>

      {/* Confidence label - only shown when value > 0 */}
      {value > 0 && (
        <span
          className={`${config.labelSize} text-zinc-400 font-medium transition-opacity duration-200`}
        >
          {CONFIDENCE_LABELS[value]}
        </span>
      )}
    </div>
  );
}

/**
 * Compact inline variant for use in lists/tables
 */
export function ConfidenceRatingInline({
  value,
  size = "sm",
}: Pick<ConfidenceRatingProps, "value" | "size">) {
  const config = SIZE_CONFIG[size];

  return (
    <div
      className="flex items-center"
      style={{ gap: `${config.gap / 2}px` }}
      role="img"
      aria-label={`Confidence: ${CONFIDENCE_LABELS[value] || "Not rated"}`}
    >
      {[0, 1, 2].map((starIndex) => {
        const filled = value >= starIndex + 1;
        const starColor = filled ? "#fbbf24" : "#52525b";

        return (
          <Star
            key={starIndex}
            size={config.starSize * 0.75}
            className={filled ? "fill-current" : "fill-transparent"}
            style={{ color: starColor }}
            strokeWidth={filled ? 0 : 2}
          />
        );
      })}
    </div>
  );
}

export default ConfidenceRating;

"use client";

/**
 * STUDYMAP — XP Toast Component
 *
 * A floating notification that appears when the user earns XP.
 * Slides up with a spring animation, displays for 2 seconds, then dismisses.
 */

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap } from "lucide-react";

interface XPToastProps {
  /** Amount of XP earned */
  amount: number;
  /** Subject color as hex string for accent styling */
  subjectColor: string;
  /** Whether the toast is visible */
  visible: boolean;
  /** Callback when the exit animation completes */
  onComplete: () => void;
}

/**
 * XPToast
 *
 * Renders an animated toast notification showing XP earned.
 * - Springs in from below with scale pop effect.
 * - Auto-dismisses after 2 seconds.
 * - Uses subject color for accent border/glow.
 * - Calls onComplete when fully unmounted.
 */
export function XPToast({
  amount,
  subjectColor,
  visible,
  onComplete,
}: XPToastProps) {
  // Timer ref for auto-dismiss
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Set up auto-dismiss timer when visible becomes true
  useEffect(() => {
    if (visible) {
      // Clear any existing timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // Set new timer for auto-dismiss (2 seconds)
      timerRef.current = setTimeout(() => {
        onComplete();
      }, 2000);
    }

    // Cleanup on unmount or when visible changes
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [visible, onComplete]);

  return (
    <AnimatePresence mode="wait" onExitComplete={onComplete}>
      {visible && (
        <motion.div
          key="xp-toast"
          className="fixed bottom-20 left-0 right-0 mx-auto w-fit z-50 pointer-events-none"
          initial={{
            opacity: 0,
            y: 40,
            scale: 0.85,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            y: -20,
            scale: 0.9,
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 25,
            mass: 0.8,
          }}
        >
          {/* Toast card */}
          <div
            className="relative flex items-center gap-3 px-5 py-3 rounded-2xl bg-zinc-900/95 backdrop-blur-sm border border-zinc-700/50 shadow-2xl"
            style={{
              borderLeftWidth: "4px",
              borderLeftColor: subjectColor,
              boxShadow: `0 0 20px ${subjectColor}30, 0 8px 32px rgba(0, 0, 0, 0.5)`,
            }}
          >
            {/* Lightning bolt icon with subject color */}
            <motion.div
              className="flex items-center justify-center w-10 h-10 rounded-xl"
              style={{ backgroundColor: `${subjectColor}20` }}
              animate={{
                scale: [1, 1.15, 1],
                rotate: [0, -5, 5, 0],
              }}
              transition={{
                duration: 0.6,
                ease: "easeInOut",
              }}
            >
              <Zap
                size={22}
                className="fill-current"
                style={{ color: subjectColor }}
              />
            </motion.div>

            {/* XP text */}
            <div className="flex flex-col">
              <motion.span
                className="text-2xl font-bold tracking-tight text-zinc-50"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 20,
                  delay: 0.1,
                }}
              >
                +{amount.toLocaleString()}
                <span
                  className="ml-1 text-lg font-semibold"
                  style={{ color: subjectColor }}
                >
                  XP
                </span>
              </motion.span>
              <span className="text-xs text-zinc-500">Experience earned!</span>
            </div>

            {/* Animated sparkle effect */}
            <motion.div
              className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
              style={{ backgroundColor: subjectColor }}
              animate={{
                scale: [0, 1.5, 0],
                opacity: [0, 0.8, 0],
              }}
              transition={{
                duration: 0.8,
                ease: "easeOut",
                delay: 0.2,
              }}
            />
            <motion.div
              className="absolute top-2 right-3 w-2 h-2 rounded-full"
              style={{ backgroundColor: subjectColor }}
              animate={{
                scale: [0, 1.2, 0],
                opacity: [0, 0.6, 0],
              }}
              transition={{
                duration: 0.7,
                ease: "easeOut",
                delay: 0.35,
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default XPToast;

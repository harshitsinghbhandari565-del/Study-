"use client";

/**
 * STUDYMAP — Page Transition Wrapper
 *
 * Wraps page content in a Framer Motion container that provides
 * smooth enter/exit animations when navigating between views.
 */

import { type ReactNode } from "react";
import { motion } from "framer-motion";

// ─── Props ────────────────────────────────────────────────────────────────────

interface PageTransitionProps {
  /** The page content to animate */
  children: ReactNode;
  /** Unique key for AnimatePresence to track mount/unmount */
  pageKey?: string;
}

// ─── Animation Configuration ──────────────────────────────────────────────────

const pageVariants = {
  initial: {
    opacity: 0,
    y: 12,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -12,
  },
};

const pageTransition = {
  duration: 0.25,
  ease: "easeOut" as const,
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * PageTransition
 *
 * Wraps children in a motion.div that fades and slides on mount/unmount.
 * Use inside an AnimatePresence with a unique key for each page.
 */
export function PageTransition({ children, pageKey }: PageTransitionProps) {
  return (
    <motion.div
      key={pageKey}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
      className="w-full min-h-screen"
    >
      {children}
    </motion.div>
  );
}

export default PageTransition;

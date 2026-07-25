"use client";

/**
 * STUDYMAP — Goal Form Modal
 *
 * A modal form for creating new study goals with subject selection,
 * target type, count, deadline, and optional description.
 */

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Target, Calendar, Hash, FileText } from "lucide-react";
import { format, addDays } from "date-fns";

import { SUBJECTS } from "@/lib/constants";
import type { Goal, GoalTargetType } from "@/lib/types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface GoalFormProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Callback when a goal is added */
  onAddGoal: (goal: Goal) => void;
}

// ─── Target Type Options ──────────────────────────────────────────────────────

const TARGET_TYPES: { value: GoalTargetType; label: string }[] = [
  { value: "complete-chapters", label: "Complete Chapters" },
  { value: "complete-resources", label: "Complete Resources" },
  { value: "complete-pyqs", label: "Finish PYQs" },
];

// ─── Animation Variants ───────────────────────────────────────────────────────

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      damping: 25,
      stiffness: 300,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.15 },
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * GoalForm
 *
 * A modal form for creating new study goals.
 */
export function GoalForm({ isOpen, onClose, onAddGoal }: GoalFormProps) {
  // Form state
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [targetType, setTargetType] = useState<GoalTargetType>("complete-chapters");
  const [targetCount, setTargetCount] = useState<number>(1);
  const [deadline, setDeadline] = useState<string>(() =>
    format(addDays(new Date(), 7), "yyyy-MM-dd")
  );
  const [description, setDescription] = useState<string>("");
  const [error, setError] = useState<string>("");

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setSelectedSubject("");
    setTargetType("complete-chapters");
    setTargetCount(1);
    setDeadline(format(addDays(new Date(), 7), "yyyy-MM-dd"));
    setDescription("");
    setError("");
  }, []);

  /**
   * Validate form
   */
  const isValid = useMemo(() => {
    if (!selectedSubject) return false;
    if (!targetType) return false;
    if (targetCount < 1) return false;
    if (!deadline) return false;

    // Check if deadline is in future
    const deadlineDate = new Date(deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (deadlineDate < today) return false;

    return true;
  }, [selectedSubject, targetType, targetCount, deadline]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(() => {
    if (!isValid) {
      setError("Please fill in all required fields with valid values.");
      return;
    }

    const newGoal: Goal = {
      id: `goal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      subjectId: selectedSubject,
      targetType,
      targetCount,
      deadline,
      description: description.trim() || `Complete ${targetCount} ${targetType.replace("complete-", "")}`,
      progressCount: 0,
      createdAt: new Date().toISOString(),
    };

    onAddGoal(newGoal);
    resetForm();
    onClose();
  }, [isValid, selectedSubject, targetType, targetCount, deadline, description, onAddGoal, resetForm, onClose]);

  /**
   * Handle close
   */
  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  /**
   * Handle backdrop click
   */
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        handleClose();
      }
    },
    [handleClose]
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={handleBackdropClick}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/20">
                  <Target size={16} className="text-indigo-400" />
                </div>
                <h2 className="font-semibold text-zinc-100">New Goal</h2>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-zinc-800 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <X size={20} className="text-zinc-400" />
              </button>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* Subject Selection */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Subject *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {SUBJECTS.map((subject) => (
                    <button
                      key={subject.id}
                      onClick={() => setSelectedSubject(subject.id)}
                      className={`
                        p-3 rounded-xl border text-left transition-all min-h-[52px]
                        ${selectedSubject === subject.id
                          ? "border-white bg-zinc-800"
                          : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
                        }
                      `}
                    >
                      <span
                        className="text-sm font-medium"
                        style={{ color: selectedSubject === subject.id ? subject.color : "#d4d4d8" }}
                      >
                        {subject.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Type */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Target Type *
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {TARGET_TYPES.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setTargetType(type.value)}
                      className={`
                        p-3 rounded-xl border text-left transition-all min-h-[48px]
                        ${targetType === type.value
                          ? "border-white bg-zinc-800 text-zinc-100"
                          : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700"
                        }
                      `}
                    >
                      <span className="text-sm font-medium">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Count */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  <Hash size={14} className="inline mr-1" />
                  Target Count *
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={targetCount}
                  onChange={(e) => setTargetCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 text-lg font-semibold focus:outline-none focus:border-zinc-600 transition-colors"
                />
              </div>

              {/* Deadline */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  <Calendar size={14} className="inline mr-1" />
                  Deadline *
                </label>
                <input
                  type="date"
                  value={deadline}
                  min={format(new Date(), "yyyy-MM-dd")}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 focus:outline-none focus:border-zinc-600 transition-colors [color-scheme:dark]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  <FileText size={14} className="inline mr-1" />
                  Description (optional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Finish all Physics PYQs before midterms"
                  className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-zinc-800 space-y-2">
              <motion.button
                whileTap={isValid ? { scale: 0.98 } : {}}
                onClick={handleSubmit}
                disabled={!isValid}
                className={`
                  w-full min-h-[56px] flex items-center justify-center gap-2 rounded-xl font-bold text-lg transition-all
                  ${isValid
                    ? "bg-white text-zinc-900 hover:bg-zinc-100"
                    : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                  }
                `}
              >
                <Target size={20} />
                Add Goal
              </motion.button>

              <button
                onClick={handleClose}
                className="w-full py-2 text-zinc-500 text-sm font-medium hover:text-zinc-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default GoalForm;

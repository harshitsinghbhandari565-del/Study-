"use client";

/**
 * STUDYMAP — Morning Checklist Component
 *
 * A morning intention setter that helps students plan their study day.
 * Shows streak, challenges, revisions due, and allows setting 1-3 study plans.
 */

import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Sun, Flame, Zap, RefreshCcw, ChevronDown, Sparkles } from "lucide-react";

import { useStudyContext } from "@/contexts/study-context";
import { SUBJECTS } from "@/lib/constants";

// ─── Props ────────────────────────────────────────────────────────────────────

interface MorningChecklistProps {
  /** Callback when the plan is submitted */
  onSubmit: (plan: Array<{ subjectId: string; chapterId: string }>) => void;
}

// ─── Plan Slot Component ──────────────────────────────────────────────────────

interface PlanSlotProps {
  index: number;
  selectedSubject: string;
  selectedChapter: string;
  onSubjectChange: (subjectId: string) => void;
  onChapterChange: (chapterId: string) => void;
  chapters: Array<{ id: string; name: string; subjectId: string }>;
}

function PlanSlot({
  index,
  selectedSubject,
  selectedChapter,
  onSubjectChange,
  onChapterChange,
  chapters,
}: PlanSlotProps) {
  const filteredChapters = useMemo(() => {
    return chapters.filter((ch) => ch.subjectId === selectedSubject);
  }, [chapters, selectedSubject]);

  const selectedSubjectData = SUBJECTS.find((s) => s.id === selectedSubject);

  return (
    <div className="p-3 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
      <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">
        Plan {index + 1}
      </p>
      <div className="grid grid-cols-2 gap-2">
        {/* Subject Select */}
        <div className="relative">
          <select
            value={selectedSubject}
            onChange={(e) => {
              onSubjectChange(e.target.value);
              onChapterChange(""); // Reset chapter when subject changes
            }}
            className="w-full appearance-none px-3 py-2.5 pr-8 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 transition-colors min-h-[44px]"
            style={{
              borderColor: selectedSubjectData ? `${selectedSubjectData.color}40` : undefined,
            }}
          >
            <option value="">Subject...</option>
            {SUBJECTS.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
          />
        </div>

        {/* Chapter Select */}
        <div className="relative">
          <select
            value={selectedChapter}
            onChange={(e) => onChapterChange(e.target.value)}
            disabled={!selectedSubject}
            className="w-full appearance-none px-3 py-2.5 pr-8 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none focus:border-zinc-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
          >
            <option value="">Chapter...</option>
            {filteredChapters.map((chapter) => (
              <option key={chapter.id} value={chapter.id}>
                {chapter.name}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * MorningChecklist
 *
 * A morning planning component that helps students set their study intentions.
 */
export function MorningChecklist({ onSubmit }: MorningChecklistProps) {
  const { chapters, currentStreak, revisionsDueToday } = useStudyContext();

  // State for 3 plan slots
  const [plans, setPlans] = useState<Array<{ subject: string; chapter: string }>>([
    { subject: "", chapter: "" },
    { subject: "", chapter: "" },
    { subject: "", chapter: "" },
  ]);

  /**
   * Update a specific plan slot
   */
  const updatePlan = useCallback((index: number, field: "subject" | "chapter", value: string) => {
    setPlans((prev) => {
      const newPlans = [...prev];
      newPlans[index] = { ...newPlans[index], [field]: value };
      return newPlans;
    });
  }, []);

  /**
   * Check if any plan is set
   */
  const hasAnyPlan = useMemo(() => {
    return plans.some((p) => p.subject && p.chapter);
  }, [plans]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(() => {
    const validPlans = plans
      .filter((p) => p.subject && p.chapter)
      .map((p) => ({ subjectId: p.subject, chapterId: p.chapter }));

    if (validPlans.length > 0) {
      onSubmit(validPlans);
    }
  }, [plans, onSubmit]);

  /**
   * Get greeting based on time of day
   */
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-2xl p-5 overflow-hidden relative"
    >
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full blur-2xl" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-amber-500/20">
            <Sun size={20} className="text-amber-400" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-zinc-100">
              🌅 {greeting}
              {currentStreak > 0 && (
                <span className="text-amber-400 ml-2">— Day {currentStreak}</span>
              )}
            </h2>
            <p className="text-xs text-zinc-500">Set your plan for today</p>
          </div>
        </div>

        {/* Plan Slots */}
        <div className="space-y-2 mb-4">
          {plans.map((plan, index) => (
            <PlanSlot
              key={index}
              index={index}
              selectedSubject={plan.subject}
              selectedChapter={plan.chapter}
              onSubjectChange={(v) => updatePlan(index, "subject", v)}
              onChapterChange={(v) => updatePlan(index, "chapter", v)}
              chapters={chapters.map((c) => ({ id: c.id, name: c.name, subjectId: c.subjectId }))}
            />
          ))}
        </div>

        {/* Info Row */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {/* Streak Info */}
          <div className="flex items-center gap-2 p-2.5 bg-zinc-800/50 rounded-lg">
            <Zap size={14} className="text-amber-400" />
            <span className="text-xs text-zinc-400">
              {currentStreak > 0 ? (
                <span className="text-amber-400">🔥 {currentStreak} day streak</span>
              ) : (
                "Start your streak!"
              )}
            </span>
          </div>

          {/* Revisions Due */}
          <div className="flex items-center gap-2 p-2.5 bg-zinc-800/50 rounded-lg">
            <RefreshCcw size={14} className="text-cyan-400" />
            <span className="text-xs text-zinc-400">
              {revisionsDueToday.length > 0 ? (
                <span className="text-cyan-400">{revisionsDueToday.length} due today</span>
              ) : (
                "No revisions"
              )}
            </span>
          </div>
        </div>

        {/* Streak Display */}
        {currentStreak > 0 && (
          <div className="flex items-center justify-center gap-2 p-2.5 bg-orange-500/10 border border-orange-500/20 rounded-lg mb-4">
            <Flame size={16} className="text-orange-400" />
            <span className="text-sm font-medium text-orange-400">
              {currentStreak} day streak — Keep it going!
            </span>
          </div>
        )}

        {/* Submit Button */}
        <motion.button
          whileTap={hasAnyPlan ? { scale: 0.98 } : {}}
          onClick={handleSubmit}
          disabled={!hasAnyPlan}
          className={`
            w-full min-h-[56px] flex items-center justify-center gap-2 rounded-xl font-bold text-lg transition-all
            ${hasAnyPlan
              ? "bg-white text-zinc-900 hover:bg-zinc-100 shadow-lg shadow-white/10"
              : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
            }
          `}
        >
          <Sparkles size={20} />
          Set Today's Plan
        </motion.button>

        {/* Helper Text */}
        {!hasAnyPlan && (
          <p className="text-center text-xs text-zinc-600 mt-2">
            Select at least one subject and chapter to continue
          </p>
        )}
      </div>
    </motion.div>
  );
}

export default MorningChecklist;

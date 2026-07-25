"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Plus, ArrowLeft, CheckCircle2, LayoutList, CalendarDays } from "lucide-react";

import { useStudyContext } from "@/contexts/study-context";
import { GoalCard } from "@/components/goals/goal-card";
import { GoalForm } from "@/components/goals/goal-form";
import { CalendarView } from "@/components/goals/calendar-view";
import type { Goal } from "@/lib/types";

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

interface GoalsPageProps { onBack: () => void; }

export function GoalsPage({ onBack }: GoalsPageProps) {
  const { goals, addGoal, completeGoal } = useStudyContext();
  const [showForm, setShowForm] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");

  const { activeGoals, completedGoals } = useMemo(() => {
    const active: Goal[] = []; const completed: Goal[] = [];
    goals.forEach((g) => { (g.progressCount >= g.targetCount ? completed : active).push(g); });
    active.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    completed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return { activeGoals: active, completedGoals: completed };
  }, [goals]);

  const handleAddGoal = useCallback((goal: Goal) => addGoal(goal), [addGoal]);
  const handleToggleGoal = useCallback((goalId: string) => completeGoal(goalId), [completeGoal]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md mx-auto px-4 py-6 pb-24">
        <header className="mb-6">
          <button onClick={onBack} className="flex items-center gap-1 text-zinc-400 hover:text-zinc-200 transition-colors mb-4 -ml-1 min-h-[44px]">
            <ArrowLeft size={20} /><span className="text-sm font-medium">Back</span>
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/20"><Target size={24} className="text-indigo-400" /></div>
              <div><h1 className="text-2xl font-bold">Goals</h1><p className="text-sm text-zinc-500">Set targets, track progress</p></div>
            </div>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowForm(true)} className="flex items-center gap-1 px-3 py-2 bg-white text-zinc-900 font-semibold text-sm rounded-lg">
              <Plus size={16} />New
            </motion.button>
          </div>
        </header>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-zinc-900 rounded-lg p-1 mb-4 border border-zinc-800">
          <button onClick={() => setViewMode("list")} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-medium transition-colors ${viewMode === "list" ? "bg-zinc-800 text-zinc-100" : "text-zinc-500"}`}>
            <LayoutList size={14} />List
          </button>
          <button onClick={() => setViewMode("calendar")} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-medium transition-colors ${viewMode === "calendar" ? "bg-zinc-800 text-zinc-100" : "text-zinc-500"}`}>
            <CalendarDays size={14} />Calendar
          </button>
        </div>

        {/* Calendar View */}
        {viewMode === "calendar" && (
          <div className="mb-6">
            <CalendarView goals={goals} onToggleGoal={handleToggleGoal} />
          </div>
        )}

        {/* List View */}
        {viewMode === "list" && (
          <>
            <section className="mb-6">
              <h2 className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-3">Active Goals ({activeGoals.length})</h2>
              {activeGoals.length === 0 ? (
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
                  <Target size={40} className="mx-auto text-zinc-700 mb-3" />
                  <p className="text-zinc-500 text-sm mb-1">No active goals</p><p className="text-zinc-600 text-xs">Set one and chase it!</p>
                </div>
              ) : (
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {activeGoals.map((goal) => (<motion.div key={goal.id} variants={itemVariants} layout><GoalCard goal={goal} /></motion.div>))}
                  </AnimatePresence>
                </motion.div>
              )}
            </section>

            {completedGoals.length > 0 && (
              <section>
                <button onClick={() => setShowCompleted(!showCompleted)} className="flex items-center justify-between w-full text-left mb-3">
                  <h2 className="text-xs uppercase tracking-wider text-zinc-500 font-semibold flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" />Completed ({completedGoals.length})</h2>
                  <span className="text-xs text-zinc-600">{showCompleted ? "Hide" : "Show"}</span>
                </button>
                <AnimatePresence>
                  {showCompleted && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-3 overflow-hidden">
                      {completedGoals.map((goal) => (<div key={goal.id} className="opacity-60"><GoalCard goal={goal} /></div>))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>
            )}
          </>
        )}

        {/* Stats */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-6 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div><p className="text-2xl font-bold text-zinc-100">{goals.length}</p><p className="text-[10px] text-zinc-500 uppercase tracking-wider">Total</p></div>
            <div><p className="text-2xl font-bold text-zinc-100">{activeGoals.length}</p><p className="text-[10px] text-zinc-500 uppercase tracking-wider">Active</p></div>
            <div><p className="text-2xl font-bold text-emerald-400">{completedGoals.length}</p><p className="text-[10px] text-zinc-500 uppercase tracking-wider">Done</p></div>
          </div>
        </motion.div>
      </motion.div>

      <GoalForm isOpen={showForm} onClose={() => setShowForm(false)} onAddGoal={handleAddGoal} />
    </div>
  );
}

export default GoalsPage;

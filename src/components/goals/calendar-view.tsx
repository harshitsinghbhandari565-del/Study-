"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isToday, isSameDay, addMonths, subMonths } from "date-fns";

import { SUBJECTS } from "@/lib/constants";
import type { Goal } from "@/lib/types";

interface CalendarViewProps {
  goals: Goal[];
  onToggleGoal: (goalId: string) => void;
}

const DAY_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export function CalendarView({ goals, onToggleGoal }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const days: Date[] = [];
    let day = calStart;
    while (day <= calEnd) { days.push(day); day = addDays(day, 1); }
    return days;
  }, [currentMonth]);

  const goalsByDate = useMemo(() => {
    const map = new Map<string, Goal[]>();
    goals.forEach((g) => {
      const key = g.deadline.split("T")[0];
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(g);
    });
    return map;
  }, [goals]);

  const selectedGoals = useMemo(() => {
    if (!selectedDate) return [];
    const key = format(selectedDate, "yyyy-MM-dd");
    return goalsByDate.get(key) || [];
  }, [selectedDate, goalsByDate]);

  return (
    <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 min-w-[44px] min-h-[44px] flex items-center justify-center">
          <ChevronLeft size={20} />
        </button>
        <h3 className="font-semibold text-zinc-100">{format(currentMonth, "MMMM yyyy")}</h3>
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 min-w-[44px] min-h-[44px] flex items-center justify-center">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Day Labels */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAY_LABELS.map((d) => <div key={d} className="text-center text-[10px] text-zinc-600 font-medium py-1">{d}</div>)}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const dayGoals = goalsByDate.get(key) || [];
          const inMonth = isSameMonth(day, currentMonth);
          const today = isToday(day);
          const selected = selectedDate ? isSameDay(day, selectedDate) : false;

          return (
            <button
              key={key}
              onClick={() => setSelectedDate(day)}
              className={`relative flex flex-col items-center justify-center py-1.5 rounded-lg min-h-[40px] transition-colors
                ${!inMonth ? "text-zinc-700" : today ? "bg-indigo-500/20 text-indigo-400 font-bold" : "text-zinc-300 hover:bg-zinc-800"}
                ${selected ? "ring-1 ring-white" : ""}
              `}
            >
              <span className="text-xs">{format(day, "d")}</span>
              {dayGoals.length > 0 && (
                <div className="flex gap-0.5 mt-0.5">
                  {dayGoals.slice(0, 3).map((g) => {
                    const subj = SUBJECTS.find((s) => s.id === g.subjectId);
                    return <div key={g.id} className="w-1 h-1 rounded-full" style={{ backgroundColor: subj?.color || "#71717a" }} />;
                  })}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Day Goals */}
      {selectedDate && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 pt-4 border-t border-zinc-800">
          <p className="text-xs text-zinc-500 mb-2 font-semibold">{format(selectedDate, "EEEE, MMMM d")}</p>
          {selectedGoals.length === 0 ? (
            <p className="text-xs text-zinc-600">No goals due this day</p>
          ) : (
            <div className="space-y-2">
              {selectedGoals.map((g) => {
                const subj = SUBJECTS.find((s) => s.id === g.subjectId);
                const done = g.progressCount >= g.targetCount;
                return (
                  <div key={g.id} className="flex items-center gap-3 p-2 rounded-lg bg-zinc-800/50">
                    <button onClick={() => onToggleGoal(g.id)} className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${done ? "bg-emerald-500 border-emerald-500 text-white" : "border-zinc-600"}`}>
                      {done && <span className="text-xs">✓</span>}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${done ? "line-through text-zinc-500" : "text-zinc-200"}`}>{g.description}</p>
                      {subj && <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: `${subj.color}20`, color: subj.color }}>{subj.name}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

export default CalendarView;

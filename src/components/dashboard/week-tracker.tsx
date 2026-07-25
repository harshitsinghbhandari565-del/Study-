"use client";

import { useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Pencil, Check } from "lucide-react";
import { differenceInDays, parseISO, format } from "date-fns";

interface WeekTrackerProps {
  startDate: string;
  onChangeStartDate: (date: string) => void;
}

export function WeekTracker({ startDate, onChangeStartDate }: WeekTrackerProps) {
  const [editing, setEditing] = useState(false);
  const [tempDate, setTempDate] = useState(startDate);

  const info = useMemo(() => {
    const today = new Date();
    const start = parseISO(startDate);
    const diff = differenceInDays(today, start);
    if (diff < 0) return { started: false, daysUntil: Math.abs(diff), week: 0 };
    return { started: true, daysUntil: 0, week: Math.floor(diff / 7) + 1 };
  }, [startDate]);

  const handleSave = useCallback(() => {
    onChangeStartDate(tempDate);
    setEditing(false);
  }, [tempDate, onChangeStartDate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900 rounded-xl p-4 border border-zinc-800"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/10">
            <Calendar size={18} className="text-indigo-400" />
          </div>
          <div>
            {info.started ? (
              <>
                <p className="text-2xl font-bold text-zinc-50">Week {info.week}</p>
                <p className="text-xs text-zinc-500">of your journey</p>
              </>
            ) : (
              <>
                <p className="text-lg font-bold text-zinc-50">Starts in {info.daysUntil} days</p>
                <p className="text-xs text-zinc-500">Your journey begins {format(parseISO(startDate), "MMM d, yyyy")}</p>
              </>
            )}
          </div>
        </div>
        <button
          onClick={() => { setTempDate(startDate); setEditing(!editing); }}
          className="p-2 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-500 hover:text-zinc-300"
        >
          <Pencil size={14} />
        </button>
      </div>

      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-zinc-800">
              <input
                type="date"
                value={tempDate}
                onChange={(e) => setTempDate(e.target.value)}
                className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 focus:outline-none [color-scheme:dark]"
              />
              <button onClick={handleSave} className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors">
                <Check size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default WeekTracker;

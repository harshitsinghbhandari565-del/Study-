"use client";

/**
 * STUDYMAP — Weekly Mini Heatmap Component
 *
 * Displays a compact 7-day activity visualization showing session counts.
 * Uses color intensity to represent activity levels.
 */

import { useMemo } from "react";
import { format, startOfWeek, addDays } from "date-fns";
import type { HeatmapDay } from "@/lib/types";

interface WeeklyMiniHeatmapProps {
  /** Full heatmap data from context (365 days) */
  heatmapData: HeatmapDay[];
}

/**
 * Day labels for the week (Monday to Sunday)
 */
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/**
 * Get the intensity class based on session count.
 * 0 sessions = zinc-800 (base)
 * 1 session = emerald-500/30
 * 2 sessions = emerald-500/60
 * 3+ sessions = emerald-500 (full)
 */
function getIntensityStyle(count: number): { backgroundColor: string } {
  if (count === 0) {
    return { backgroundColor: "rgb(39 39 42)" }; // zinc-800
  }
  if (count === 1) {
    return { backgroundColor: "rgba(16, 185, 129, 0.3)" }; // emerald-500/30
  }
  if (count === 2) {
    return { backgroundColor: "rgba(16, 185, 129, 0.6)" }; // emerald-500/60
  }
  return { backgroundColor: "rgb(16, 185, 129)" }; // emerald-500
}

/**
 * WeeklyMiniHeatmap
 *
 * Renders a single row of 7 squares representing the current week's activity.
 * Each square shows session count through color intensity.
 */
export function WeeklyMiniHeatmap({ heatmapData }: WeeklyMiniHeatmapProps) {
  /**
   * Compute the last 7 days (current week, Mon-Sun)
   */
  const weekData = useMemo(() => {
    const today = new Date();
    // Get the start of the current week (Monday)
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });

    // Create a map of date strings to counts for quick lookup
    const heatmapMap = new Map<string, number>();
    heatmapData.forEach((day) => {
      heatmapMap.set(day.date, day.count);
    });

    // Generate 7 days of data
    const days: Array<{ date: string; dayLabel: string; count: number; isToday: boolean }> = [];

    for (let i = 0; i < 7; i++) {
      const date = addDays(weekStart, i);
      const dateStr = format(date, "yyyy-MM-dd");
      const todayStr = format(today, "yyyy-MM-dd");
      const count = heatmapMap.get(dateStr) ?? 0;

      days.push({
        date: dateStr,
        dayLabel: DAY_LABELS[i],
        count,
        isToday: dateStr === todayStr,
      });
    }

    return days;
  }, [heatmapData]);

  /**
   * Total sessions this week
   */
  const weekTotal = useMemo(() => {
    return weekData.reduce((sum, day) => sum + day.count, 0);
  }, [weekData]);

  return (
    <div className="w-full bg-zinc-900 rounded-xl p-4 border border-zinc-800">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">
          This Week
        </h3>
        <span className="text-xs text-zinc-400">
          {weekTotal} {weekTotal === 1 ? "session" : "sessions"}
        </span>
      </div>

      {/* Heatmap Squares */}
      <div className="flex justify-between gap-1.5">
        {weekData.map((day) => (
          <div key={day.date} className="flex flex-col items-center gap-1.5">
            {/* Square */}
            <div
              title={`${format(new Date(day.date), "MMM d")}: ${day.count} ${day.count === 1 ? "session" : "sessions"}`}
              className={`
                w-8 h-8 rounded-md transition-all duration-200
                ${day.isToday ? "ring-2 ring-zinc-500 ring-offset-1 ring-offset-zinc-900" : ""}
              `}
              style={getIntensityStyle(day.count)}
            >
              {/* Show count inside square if there are sessions */}
              {day.count > 0 && (
                <span className="flex items-center justify-center h-full text-xs font-semibold text-white/90">
                  {day.count}
                </span>
              )}
            </div>

            {/* Day Label */}
            <span
              className={`
                text-[10px] font-medium
                ${day.isToday ? "text-zinc-300" : "text-zinc-500"}
              `}
            >
              {day.dayLabel}
            </span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-1.5 mt-4 pt-3 border-t border-zinc-800">
        <span className="text-[10px] text-zinc-500">Less</span>
        <div className="flex gap-1">
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: "rgb(39 39 42)" }}
          />
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: "rgba(16, 185, 129, 0.3)" }}
          />
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: "rgba(16, 185, 129, 0.6)" }}
          />
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: "rgb(16, 185, 129)" }}
          />
        </div>
        <span className="text-[10px] text-zinc-500">More</span>
      </div>
    </div>
  );
}

export default WeeklyMiniHeatmap;

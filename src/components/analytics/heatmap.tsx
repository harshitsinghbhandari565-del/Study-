"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { format, subDays, startOfWeek, addDays, getMonth } from "date-fns";
import { useTheme } from "@/contexts/theme-context";
import type { HeatmapDay } from "@/lib/types";

interface HeatmapProps { heatmapData: HeatmapDay[]; holidayDates?: string[]; }

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function getIntensityStyle(intensity: number, isDark: boolean): string {
  if (isDark) {
    switch (intensity) { case 1: return "bg-emerald-900/60"; case 2: return "bg-emerald-700"; case 3: return "bg-emerald-500"; case 4: return "bg-emerald-300"; default: return ""; }
  }
  switch (intensity) { case 1: return "bg-emerald-200"; case 2: return "bg-emerald-400"; case 3: return "bg-emerald-500"; case 4: return "bg-emerald-600"; default: return ""; }
}

export function Heatmap({ heatmapData, holidayDates = [] }: HeatmapProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const holidaySet = useMemo(() => new Set(holidayDates), [holidayDates]);
  const dataMap = useMemo(() => { const m = new Map<string, HeatmapDay>(); heatmapData.forEach((d) => m.set(d.date, d)); return m; }, [heatmapData]);

  const weeks = useMemo(() => {
    const today = new Date(); const wa: Array<Array<{ date: string; data: HeatmapDay | null; month: number }>> = [];
    const sd = startOfWeek(subDays(today, 364), { weekStartsOn: 1 });
    let cd = sd; let cw: typeof wa[0] = [];
    while (cd <= today) {
      const ds = format(cd, "yyyy-MM-dd"); const dow = cd.getDay(); const adj = dow === 0 ? 6 : dow - 1;
      if (adj === 0 && cw.length > 0) { wa.push(cw); cw = []; }
      cw.push({ date: ds, data: dataMap.get(ds) || null, month: getMonth(cd) }); cd = addDays(cd, 1);
    }
    if (cw.length > 0) wa.push(cw); return wa;
  }, [dataMap]);

  const monthLabels = useMemo(() => { const l: Array<{ month: string; weekIndex: number }> = []; let lm = -1; weeks.forEach((w, wi) => { const fm = w[0]?.month; if (fm !== undefined && fm !== lm) { l.push({ month: MONTH_LABELS[fm], weekIndex: wi }); lm = fm; } }); return l; }, [weeks]);
  const totalSessions = useMemo(() => heatmapData.reduce((s, d) => s + d.count, 0), [heatmapData]);

  const emptyBg = isDark ? "bg-zinc-800" : "bg-zinc-200";
  const restBg = isDark ? "bg-red-900/30 ring-1 ring-red-500/50" : "bg-red-100 ring-1 ring-red-400/50";

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="rounded-xl p-4 border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2"><div className="p-1.5 rounded-lg bg-orange-500/10"><Flame size={16} className="text-orange-400" /></div><h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>Your Study Heatmap</h3></div>
        <span className="text-xs" style={{ color: "var(--text-faint)" }}>{totalSessions} sessions this year</span>
      </div>

      <div className="overflow-x-auto pb-2"><div className="min-w-[700px]">
        <div className="flex mb-1 ml-8">{monthLabels.map((l, i) => (<div key={i} className="text-[10px]" style={{ color: "var(--text-faint)", position: "relative", left: `${l.weekIndex * 14}px`, marginRight: i < monthLabels.length - 1 ? `${((monthLabels[i + 1]?.weekIndex || 0) - l.weekIndex - 1) * 14}px` : 0 }}>{l.month}</div>))}</div>
        <div className="flex">
          <div className="flex flex-col gap-[2px] mr-2">{DAY_LABELS.map((d, i) => (<div key={d} className="h-[12px] flex items-center" style={{ visibility: i % 2 === 0 ? "visible" : "hidden" }}><span className="text-[10px] w-6" style={{ color: "var(--text-faint)" }}>{d}</span></div>))}</div>
          <div className="flex gap-[2px]">{weeks.map((w, wi) => (
            <div key={wi} className="flex flex-col gap-[2px]">
              {wi === 0 && w.length < 7 && Array.from({ length: 7 - w.length }).map((_, i) => (<div key={`e-${i}`} className="w-[12px] h-[12px] rounded-sm bg-transparent" />))}
              {w.map((day) => {
                const intensity = day.data?.intensity || 0;
                const count = day.data?.count || 0;
                const isHoliday = holidaySet.has(day.date);
                const bgClass = isHoliday && intensity === 0 ? restBg : intensity === 0 ? emptyBg : getIntensityStyle(intensity, isDark);
                const extraRing = isHoliday && intensity > 0 ? "ring-1 ring-red-500/50" : "";
                return (
                  <div key={day.date} title={`${format(new Date(day.date), "MMM d, yyyy")}: ${count} session${count !== 1 ? "s" : ""}${isHoliday ? " (Rest Day)" : ""}`}
                    className={`w-[12px] h-[12px] rounded-sm cursor-default hover:ring-1 hover:ring-zinc-500 ${bgClass} ${extraRing}`} />
                );
              })}
            </div>
          ))}</div>
        </div>
      </div></div>

      <div className="flex items-center justify-end gap-2 mt-4 pt-3" style={{ borderTopColor: "var(--border-color)", borderTopWidth: "1px" }}>
        <span className="text-[10px]" style={{ color: "var(--text-faint)" }}>Less</span>
        <div className="flex gap-[3px]">{[0,1,2,3,4].map((i) => (<div key={i} className={`w-[12px] h-[12px] rounded-sm ${i === 0 ? emptyBg : getIntensityStyle(i, isDark)}`} />))}</div>
        <span className="text-[10px]" style={{ color: "var(--text-faint)" }}>More</span>
        <div className="w-px h-3 mx-1" style={{ backgroundColor: "var(--border-color)" }} />
        <div className={`w-[12px] h-[12px] rounded-sm ${restBg}`} />
        <span className="text-[10px]" style={{ color: "var(--text-faint)" }}>Rest</span>
      </div>
    </motion.div>
  );
}
export default Heatmap;

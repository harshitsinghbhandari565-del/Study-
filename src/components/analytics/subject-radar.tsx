"use client";

import { useMemo } from "react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { Target } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import type { Subject } from "@/lib/types";

interface SubjectProgress { subject: Subject; progress: number; level: number; xp: number; isLow?: boolean; }
interface SubjectRadarProps { subjectsProgress: SubjectProgress[]; }

export function SubjectRadar({ subjectsProgress }: SubjectRadarProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const radarData = useMemo(() => subjectsProgress.map((sp) => ({ subject: sp.subject.name, progress: sp.progress, fullMark: 100 })), [subjectsProgress]);
  const allZero = useMemo(() => subjectsProgress.every((sp) => sp.progress === 0), [subjectsProgress]);
  const radarColor = "#10b981";

  const gridStroke = isDark ? "#3f3f46" : "#d4d4d8";
  const labelFill = isDark ? "#d4d4d8" : "#3f3f46";
  const axisFill = isDark ? "#71717a" : "#a1a1aa";
  const dotStroke = isDark ? "#18181b" : "#ffffff";
  const fillOpacity = isDark ? 0.3 : 0.4;
  const emptyBorder = isDark ? "border-zinc-700" : "border-zinc-300";
  const emptyIcon = isDark ? "text-zinc-700" : "text-zinc-400";
  const emptyText = isDark ? "text-zinc-500" : "text-zinc-400";

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="rounded-xl p-4 border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}>
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-lg bg-emerald-500/10"><Target size={16} className="text-emerald-400" /></div>
        <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>Subject Balance</h3>
      </div>

      <div className="min-h-[300px] h-[300px] w-full">
        {allZero ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className={`w-32 h-32 rounded-full border-2 border-dashed ${emptyBorder} flex items-center justify-center mb-4`}>
              <Target size={40} className={emptyIcon} />
            </div>
            <p className={`text-sm max-w-[200px] ${emptyText}`}>Start logging sessions to see your subject balance</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke={gridStroke} strokeDasharray="3 3" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: labelFill, fontSize: 11, fontWeight: 500 }} tickLine={false} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: axisFill, fontSize: 10 }} tickCount={5} axisLine={false} />
              <Radar name="Progress" dataKey="progress" stroke={radarColor} fill={radarColor} fillOpacity={fillOpacity} strokeWidth={2} dot={{ r: 4, fill: radarColor, stroke: dotStroke, strokeWidth: 2 }} animationDuration={1000} animationEasing="ease-out" />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </div>

      {!allZero && (
        <div className="mt-4 pt-4" style={{ borderTopColor: "var(--border-color)", borderTopWidth: "1px" }}>
          <div className="flex flex-wrap gap-2 justify-center">
            {subjectsProgress.map((sp) => (
              <div key={sp.subject.id} className="flex items-center gap-1.5 text-xs">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sp.subject.color }} />
                <span style={{ color: "var(--text-muted)" }}>{sp.subject.name}:</span>
                <span className="font-medium" style={{ color: "var(--text-secondary)" }}>{sp.progress}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
export default SubjectRadar;

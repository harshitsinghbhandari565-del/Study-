"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { User, Settings, Trophy, TrendingUp, Clock, Flame, BookOpen, Sword, ArrowLeft } from "lucide-react";

import { useStudyContext } from "@/contexts/study-context";
import { calculateLevel, calculateTotalHours, calculateChaptersCompleted, calculateSubjectProgress } from "@/lib/utils";
import { SUBJECTS } from "@/lib/constants";

import { SubjectLevels } from "@/components/game-hub/subject-levels";
import { BadgeGrid } from "@/components/game-hub/badge-grid";
import { BossTracker } from "@/components/game-hub/boss-tracker";
import { StudyHours } from "@/components/analytics/study-hours";
import { WallOfProofPreview } from "@/components/profile/wall-of-proof-preview";
import { WallOfProofModal } from "@/components/profile/wall-of-proof-modal";
import { ShareButton } from "@/components/profile/share-button";

const cV = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const iV = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

interface ProfilePageProps { onBack: () => void; onNavigate?: (view: string) => void; }

export function ProfilePage({ onBack, onNavigate }: ProfilePageProps) {
  const { totalXP, sessions, chapters, badges, subjectsWithProgress, streakData, currentStreak, userName } = useStudyContext();
  const [wallOpen, setWallOpen] = useState(false);

  const levelInfo = useMemo(() => calculateLevel(totalXP), [totalXP]);
  const totalHours = useMemo(() => calculateTotalHours(sessions), [sessions]);
  const completedChapters = useMemo(() => calculateChaptersCompleted(chapters), [chapters]);
  const bossSlain = useMemo(() => chapters.filter((c) => c.isBoss && c.resources.every((r) => r.completed)).length, [chapters]);
  const earnedBadges = useMemo(() => badges.filter((b) => b.earned).length, [badges]);

  const shareStats = useMemo(() => ({
    level: levelInfo.level, totalXP, totalHours, currentStreak, longestStreak: streakData.longestStreak,
    totalSessions: sessions.length, completedChapters, bossSlain, badgesEarned: earnedBadges,
    subjectProgress: SUBJECTS.map((s) => {
      const chs = chapters.filter((c) => c.subjectId === s.id);
      const prog = chs.length > 0 ? Math.round(chs.reduce((sum, c) => sum + calculateSubjectProgress(c), 0) / chs.length) : 0;
      return { name: s.name, percent: prog };
    }),
  }), [levelInfo, totalXP, totalHours, currentStreak, streakData, sessions, completedChapters, bossSlain, earnedBadges, chapters]);

  const statCards = [
    { icon: Trophy, label: "Level", value: `${levelInfo.level}`, sub: levelInfo.title },
    { icon: TrendingUp, label: "Total XP", value: totalXP.toLocaleString() },
    { icon: Clock, label: "Hours", value: totalHours.toFixed(1) },
    { icon: Flame, label: "Streak", value: `${currentStreak}d`, sub: `best ${streakData.longestStreak}` },
    { icon: BookOpen, label: "Sessions", value: `${sessions.length}` },
    { icon: Sword, label: "Bosses", value: `${bossSlain} slain` },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}>
      <motion.div variants={cV} initial="hidden" animate="visible" className="max-w-md mx-auto px-4 py-6 pb-24 space-y-6">
        {/* Header */}
        <motion.header variants={iV}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <button onClick={onBack} className="min-h-[44px] min-w-[44px] flex items-center justify-center -ml-2" style={{ color: "var(--text-muted)" }}><ArrowLeft size={20} /></button>
              <User size={16} style={{ color: "var(--text-muted)" }} />
              <span className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Profile</span>
            </div>
            {onNavigate && (
              <button onClick={() => onNavigate("settings")} className="w-9 h-9 flex items-center justify-center rounded-lg border transition-colors" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", color: "var(--text-muted)" }}>
                <Settings size={18} />
              </button>
            )}
          </div>
          <h2 className="text-3xl font-bold mt-1">{userName || "Student"}</h2>
          {userName && <p className="text-xs mt-0.5" style={{ color: "var(--text-faint)" }}>Your study universe</p>}
        </motion.header>

        {/* Level Hero */}
        <motion.div variants={iV} className="rounded-2xl p-6 text-center border relative overflow-hidden" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}>
          <motion.p initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-5xl font-black bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400 bg-clip-text text-transparent mb-1">Lv.{levelInfo.level}</motion.p>
          <p className="text-lg font-bold text-amber-400 mb-3">{levelInfo.title}</p>
          <div className="h-2.5 rounded-full overflow-hidden mb-1" style={{ backgroundColor: "var(--bg-tertiary)" }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${levelInfo.progressPercent}%` }} transition={{ duration: 1 }} className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" />
          </div>
          <p className="text-xs" style={{ color: "var(--text-faint)" }}>{levelInfo.xpToNext > 0 ? `${levelInfo.xpToNext} XP to next level` : "MAX LEVEL!"}</p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={iV} className="grid grid-cols-2 gap-3">
          {statCards.map(({ icon: Icon, label, value, sub }) => (
            <div key={label} className="rounded-xl p-3 flex flex-col gap-1 border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}>
              <div className="flex items-center gap-1.5"><Icon size={14} style={{ color: "var(--text-muted)" }} /><span className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{label}</span></div>
              <p className="text-xl font-bold">{value}</p>
              {sub && <p className="text-[10px]" style={{ color: "var(--text-faint)" }}>{sub}</p>}
            </div>
          ))}
        </motion.div>

        {/* Share */}
        <motion.div variants={iV}><ShareButton stats={shareStats} /></motion.div>

        {/* Subject Levels */}
        <motion.div variants={iV}><SubjectLevels subjectsWithProgress={subjectsWithProgress} chapters={chapters} /></motion.div>

        {/* Study Hours */}
        <motion.div variants={iV}><StudyHours sessions={sessions} subjects={SUBJECTS} /></motion.div>

        {/* Boss Tracker */}
        <motion.div variants={iV}><BossTracker chapters={chapters} /></motion.div>

        {/* Badges */}
        <motion.div variants={iV}><BadgeGrid badges={badges} /></motion.div>

        {/* Wall of Proof Preview */}
        <motion.div variants={iV}>
          <WallOfProofPreview sessions={sessions} />
          <button onClick={() => setWallOpen(true)} className="w-full h-12 rounded-xl font-medium text-sm flex items-center justify-center gap-2 mt-2 border transition-colors" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}>
            View Full Wall
          </button>
        </motion.div>

        <motion.footer variants={iV} className="text-center py-4 text-xs" style={{ color: "var(--text-faint)" }}>Level up, slay bosses, earn badges! 🎮</motion.footer>
      </motion.div>

      <WallOfProofModal sessions={sessions} isOpen={wallOpen} onClose={() => setWallOpen(false)} />
    </div>
  );
}
export default ProfilePage;

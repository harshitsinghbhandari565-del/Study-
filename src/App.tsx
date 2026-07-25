"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollText, Plus, RefreshCcw, Trophy, Sparkles, Target, Sun, Moon } from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";

import { StudyProvider, useStudyContext } from "@/contexts/study-context";
import { ThemeProvider, useTheme } from "@/contexts/theme-context";
import { calculateLevel } from "@/lib/utils";
import { SUBJECTS } from "@/lib/constants";

import { BottomNav } from "@/components/bottom-nav";
import { PageTransition } from "@/components/page-transition";
import { ConnectionStatus } from "@/components/ui/connection-status";
import { StreakCounter } from "@/components/dashboard/streak-counter";
import { WeekTracker } from "@/components/dashboard/week-tracker";
import { TestCountdown } from "@/components/dashboard/test-countdown";
import { StudyVsRemaining } from "@/components/dashboard/study-vs-remaining";
import { ReflectionPrompt } from "@/components/dashboard/reflection-prompt";
import { SubjectOverview } from "@/components/dashboard/subject-overview";
import { WeeklyMiniHeatmap } from "@/components/dashboard/weekly-mini-heatmap";
import { FocusWeekBanner } from "@/components/dashboard/focus-week-banner";
import { FinalRevisionList } from "@/components/dashboard/final-revision-list";
import { OtherSubjectsDrawer } from "@/components/dashboard/other-subjects-drawer";
import { PaceTracker } from "@/components/dashboard/pace-tracker";
import { SubjectReadiness } from "@/components/dashboard/subject-readiness";
import { Reminders } from "@/components/dashboard/reminders";
import { XPToast } from "@/components/ui/xp-toast";
import { SubjectsPage } from "@/pages/SubjectsPage";
import { SubjectDetailPage } from "@/pages/SubjectDetailPage";
import { SessionLogger } from "@/components/session-logger";
import { AnalyticsPage } from "@/pages/AnalyticsPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { GoalsPage } from "@/pages/GoalsPage";
import { RevisionsPage } from "@/pages/RevisionsPage";
import { TestsPage } from "@/pages/TestsPage";
import { PlannerPage } from "@/pages/PlannerPage";
import { MorningChecklist } from "@/components/morning-checklist";
import { PreTestRitual } from "@/components/dashboard/pre-test-ritual";
import { BackupControls } from "@/components/dashboard/backup-controls";
import { DailyChecklist } from "@/components/dashboard/daily-checklist";
import { SettingsPage } from "@/pages/SettingsPage";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";

type AppView =
  | { type: "dashboard" } | { type: "subjects" } | { type: "subject-detail"; subjectId: string }
  | { type: "analytics" } | { type: "profile" } | { type: "goals" } | { type: "revisions" }
  | { type: "tests" } | { type: "planner" } | { type: "settings" };

const cV = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } } };
const iV = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } } };

function DashboardContent({ onNavigate, onOpenLogger }: { onNavigate: (v: AppView) => void; onOpenLogger: () => void }) {
  const {
    chapters, sessions, streakData, heatmap, xpToasts, revisionsDueToday, revisions,
    subjectsWithProgress, totalXP, currentStreak, freezeCardsLeft,
    markRevisionDone, dismissToast, userStats, setSessionStartDate,
    tests, nearestTest, addTestReflection,
    lastBackupAt, exportData, importData,
    userName, onboardingCompleted, completeOnboarding,
  } = useStudyContext();
  const { theme, toggleTheme } = useTheme();

  const [morningDone, setMorningDone] = useState(false);
  const levelInfo = useMemo(() => calculateLevel(totalXP), [totalXP]);
  const spd = useMemo(() => subjectsWithProgress.map((sp) => ({ subject: SUBJECTS.find((s) => s.id === sp.id) || sp, progress: sp.progress, level: sp.level, xp: sp.totalXP, isLow: sp.progress < 20 && sessions.some((s) => s.subjectId === sp.id) })), [subjectsWithProgress, sessions]);

  const focusWeekInfo = useMemo(() => {
    if (!nearestTest) return null;
    const dl = differenceInDays(parseISO(nearestTest.date), new Date());
    if (dl > 7 || dl < 0) return null;
    const subject = SUBJECTS.find((s) => s.id === nearestTest.subjectId);
    const sp = subjectsWithProgress.find((s) => s.id === nearestTest.subjectId);
    if (!subject) return null;
    return { daysLeft: dl, subject, progress: sp?.progress || 0 };
  }, [nearestTest, subjectsWithProgress]);

  const isFocusWeek = focusWeekInfo !== null;

  const Header = (
    <motion.header variants={iV} className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          {userName && <p className="text-[10px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Welcome back</p>}
          {userName ? <p className="text-lg font-bold">{userName}</p> : <h1 className="text-2xl font-bold tracking-tight"><span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">STUDYMAP</span></h1>}
        </div>
        <div className="flex items-center gap-2">
          <BackupControls lastBackupAt={lastBackupAt} onExport={exportData} onImport={importData} />
          <button onClick={toggleTheme} className="w-9 h-9 flex items-center justify-center rounded-full border transition-colors" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}>
            {theme === "dark" ? <Moon size={16} style={{ color: "var(--text-muted)" }} /> : <Sun size={16} style={{ color: "var(--text-muted)" }} />}
          </button>
          <motion.div whileTap={{ scale: 0.95 }} className="flex items-center gap-1 bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-full"><Trophy size={14} /><span className="text-xs font-semibold">{totalXP} XP</span></motion.div>
        </div>
      </div>
      <div className="rounded-xl p-4 border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2"><Sparkles size={16} className="text-purple-400" /><span className="font-semibold" style={{ color: "var(--text-primary)" }}>Level {levelInfo.level}</span><span style={{ color: "var(--text-faint)" }}>·</span><span className="text-sm" style={{ color: "var(--text-muted)" }}>{levelInfo.title}</span></div>
          <span className="text-xs" style={{ color: "var(--text-faint)" }}>{levelInfo.xpToNext > 0 ? `${levelInfo.xpToNext} XP to next` : "MAX"}</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "var(--bg-tertiary)" }}><motion.div initial={{ width: 0 }} animate={{ width: `${levelInfo.progressPercent}%` }} transition={{ duration: 1 }} className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" /></div>
      </div>
    </motion.header>
  );

  const RevisionsCard = (
    <motion.section variants={iV}>
      <div className="rounded-xl p-4 border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}>
        <div className="flex items-center gap-2 mb-3"><div className="p-1.5 rounded-lg bg-cyan-500/10"><ScrollText size={16} className="text-cyan-400" /></div><h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>Revisions Due</h3>{revisionsDueToday.length > 0 && <span className="ml-auto text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full font-medium">{revisionsDueToday.length}</span>}</div>
        {revisionsDueToday.length > 0 ? (
          <div className="space-y-2">{revisionsDueToday.slice(0, 3).map((r) => { const ch = chapters.find((c) => c.id === r.chapterId); const rid = `${r.chapterId}-${r.revisionNumber}`; return (<div key={rid} className="flex items-center justify-between p-2 rounded-lg" style={{ backgroundColor: "var(--bg-tertiary)" }}><div className="flex items-center gap-2"><span className="text-sm">🔁</span><span className="text-sm truncate max-w-[180px]" style={{ color: "var(--text-secondary)" }}>{ch?.name || "Unknown"}</span><span className="text-[10px]" style={{ color: "var(--text-faint)" }}>R{r.revisionNumber}</span></div><button onClick={() => markRevisionDone(rid)} className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs font-medium rounded-md hover:bg-cyan-500/30">Revise</button></div>); })}{revisionsDueToday.length > 3 && <p className="text-xs text-center pt-1" style={{ color: "var(--text-faint)" }}>+{revisionsDueToday.length - 3} more</p>}</div>
        ) : <p className="text-sm text-emerald-400">All caught up! 🎉</p>}
      </div>
    </motion.section>
  );

  const LogButton = (
    <motion.section variants={iV}>
      <motion.button onClick={onOpenLogger} whileTap={{ scale: 0.98 }} className="w-full min-h-[56px] flex items-center justify-center gap-2 font-bold text-lg rounded-xl shadow-lg" style={{ backgroundColor: "var(--btn-primary-bg)", color: "var(--btn-primary-text)" }}><Plus size={22} strokeWidth={2.5} />LOG A SESSION</motion.button>
    </motion.section>
  );

  if (!onboardingCompleted) {
    return <OnboardingFlow onComplete={completeOnboarding} onOpenLogger={onOpenLogger} />;
  }

  return (
    <>
      {xpToasts.map((t) => <XPToast key={t.id} amount={t.amount} subjectColor={t.subjectColor} visible onComplete={() => dismissToast(t.id)} />)}

      <motion.div variants={cV} initial="hidden" animate="visible" className="max-w-md mx-auto px-4 py-6 pb-24 space-y-5">
        {/* Reminders */}
        <Reminders />

        {!morningDone && <motion.section variants={iV}><MorningChecklist onSubmit={() => setMorningDone(true)} /></motion.section>}
        {morningDone && <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center justify-center gap-2 py-2 px-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl"><span className="text-sm text-emerald-400 font-medium">✅ Plan set for today</span></motion.div>}

        {Header}

        {isFocusWeek && nearestTest && focusWeekInfo ? (
          <>
            <motion.section variants={iV}><FocusWeekBanner test={nearestTest} subject={focusWeekInfo.subject} subjectProgress={focusWeekInfo.progress} testDate={nearestTest.date} /></motion.section>
            <motion.section variants={iV}><PreTestRitual tests={tests} sessions={sessions} subjects={SUBJECTS} /></motion.section>
            <motion.section variants={iV}><StreakCounter currentStreak={currentStreak} freezeCardsLeft={freezeCardsLeft} longestStreak={streakData.longestStreak} /></motion.section>
            <motion.section variants={iV}><DailyChecklist /></motion.section>
            <motion.section variants={iV}><WeekTracker startDate={userStats.sessionStartDate} onChangeStartDate={setSessionStartDate} /></motion.section>
            <motion.section variants={iV}><TestCountdown nearestTest={nearestTest} /></motion.section>
            <motion.section variants={iV}><FinalRevisionList subjectId={nearestTest.subjectId} chapters={chapters} subjectColor={focusWeekInfo.subject.color} onSelectChapter={() => onOpenLogger()} /></motion.section>
            {LogButton}
            <motion.section variants={iV}>
              <OtherSubjectsDrawer subjectsProgress={spd} activeSubjectId={nearestTest.subjectId}>
                <SubjectOverview subjectsProgress={spd.filter((s) => s.subject.id !== nearestTest.subjectId)} />
              </OtherSubjectsDrawer>
            </motion.section>
            <motion.section variants={iV}><PaceTracker chapters={chapters} tests={tests} subjects={SUBJECTS} sessionStartDate={userStats.sessionStartDate} /></motion.section>
            <motion.section variants={iV}><SubjectReadiness chapters={chapters} revisions={revisions} subjects={SUBJECTS} tests={tests} /></motion.section>
            <motion.section variants={iV}><WeeklyMiniHeatmap heatmapData={heatmap} /></motion.section>
          </>
        ) : (
          <>
            <motion.section variants={iV}><PreTestRitual tests={tests} sessions={sessions} subjects={SUBJECTS} /></motion.section>
            <motion.section variants={iV}><ReflectionPrompt tests={tests} onSubmitReflection={addTestReflection} /></motion.section>
            <motion.section variants={iV}><StreakCounter currentStreak={currentStreak} freezeCardsLeft={freezeCardsLeft} longestStreak={streakData.longestStreak} /></motion.section>
            <motion.section variants={iV}><DailyChecklist /></motion.section>
            <motion.section variants={iV}><WeekTracker startDate={userStats.sessionStartDate} onChangeStartDate={setSessionStartDate} /></motion.section>
            <motion.section variants={iV}><TestCountdown nearestTest={nearestTest} /></motion.section>
            <motion.section variants={iV}><PaceTracker chapters={chapters} tests={tests} subjects={SUBJECTS} sessionStartDate={userStats.sessionStartDate} /></motion.section>
            <motion.section variants={iV}><StudyVsRemaining sessions={sessions} nearestTest={nearestTest} /></motion.section>
            <motion.section variants={iV}><SubjectReadiness chapters={chapters} revisions={revisions} subjects={SUBJECTS} tests={tests} /></motion.section>
            {RevisionsCard}
            <motion.section variants={iV}>
              <button onClick={() => onNavigate({ type: "subjects" })} className="w-full text-left"><SubjectOverview subjectsProgress={spd} /></button>
              <p className="text-center text-xs mt-2" style={{ color: "var(--text-faint)" }}>Tap to view all subjects →</p>
            </motion.section>
            {LogButton}
            <motion.section variants={iV}>
              <div className="grid grid-cols-2 gap-3">
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => onNavigate({ type: "goals" })} className="flex items-center gap-2 p-3 rounded-xl border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}><div className="p-2 rounded-lg bg-indigo-500/10"><Target size={18} className="text-indigo-400" /></div><div className="text-left"><p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Goals</p><p className="text-[10px]" style={{ color: "var(--text-faint)" }}>Track targets</p></div></motion.button>
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => onNavigate({ type: "revisions" })} className="flex items-center gap-2 p-3 rounded-xl border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}><div className="p-2 rounded-lg bg-cyan-500/10"><RefreshCcw size={18} className="text-cyan-400" /></div><div className="text-left"><p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Revisions</p><p className="text-[10px]" style={{ color: "var(--text-faint)" }}>Spaced review</p></div></motion.button>
              </div>
            </motion.section>
            <motion.section variants={iV}><WeeklyMiniHeatmap heatmapData={heatmap} /></motion.section>
            <motion.section variants={iV}>
              <div className="rounded-xl p-4 border" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}>
                <h3 className="text-xs uppercase tracking-wider font-semibold mb-3" style={{ color: "var(--text-faint)" }}>Quick Stats</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center"><p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{sessions.length}</p><p className="text-[10px]" style={{ color: "var(--text-faint)" }}>Sessions</p></div>
                  <div className="text-center"><p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{chapters.filter((c) => c.sessionsCount > 0).length}</p><p className="text-[10px]" style={{ color: "var(--text-faint)" }}>Started</p></div>
                  <div className="text-center"><p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{chapters.filter((c) => c.resources.every((r) => r.completed)).length}</p><p className="text-[10px]" style={{ color: "var(--text-faint)" }}>Done</p></div>
                </div>
              </div>
            </motion.section>
          </>
        )}

        <motion.footer variants={iV} className="text-center py-4 text-xs" style={{ color: "var(--text-faint)" }}>STUDYMAP v1.0 · Level up your learning 🚀</motion.footer>
      </motion.div>
    </>
  );
}

function AppContent() {
  const [cv, setCv] = useState<AppView>({ type: "dashboard" });
  const [lo, setLo] = useState(false);
  const { isHydrated } = useStudyContext();
  const nav = useCallback((v: AppView) => { setCv(v); window.scrollTo({ top: 0 }); }, []);
  const tc = useCallback((t: string) => nav({ type: t } as AppView), [nav]);

  if (!isHydrated) return (<div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--bg-primary)" }}><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-3"><motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="w-8 h-8 border-2 border-t-indigo-500 rounded-full" style={{ borderColor: "var(--border-color)", borderTopColor: "#6366f1" }} /><span className="text-sm" style={{ color: "var(--text-faint)" }}>Loading STUDYMAP...</span></motion.div></div>);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}>
      <AnimatePresence mode="wait">
        {cv.type === "dashboard" && <PageTransition pageKey="dashboard"><DashboardContent onNavigate={nav} onOpenLogger={() => setLo(true)} /></PageTransition>}
        {cv.type === "subjects" && <PageTransition pageKey="subjects"><SubjectsPage onSelectSubject={(id) => nav({ type: "subject-detail", subjectId: id })} onBack={() => nav({ type: "dashboard" })} /></PageTransition>}
        {cv.type === "subject-detail" && <PageTransition pageKey={`s-${cv.subjectId}`}><SubjectDetailPage subjectId={cv.subjectId} onBack={() => nav({ type: "subjects" })} /></PageTransition>}
        {cv.type === "analytics" && <PageTransition pageKey="analytics"><AnalyticsPage onBack={() => nav({ type: "dashboard" })} /></PageTransition>}
        {cv.type === "profile" && <PageTransition pageKey="profile"><ProfilePage onBack={() => nav({ type: "dashboard" })} onNavigate={(v) => nav({ type: v } as AppView)} /></PageTransition>}
        {cv.type === "goals" && <PageTransition pageKey="goals"><GoalsPage onBack={() => nav({ type: "dashboard" })} /></PageTransition>}
        {cv.type === "revisions" && <PageTransition pageKey="revisions"><RevisionsPage onBack={() => nav({ type: "dashboard" })} /></PageTransition>}
        {cv.type === "tests" && <PageTransition pageKey="tests"><TestsPage onBack={() => nav({ type: "dashboard" })} /></PageTransition>}
        {cv.type === "planner" && <PageTransition pageKey="planner"><PlannerPage onBack={() => nav({ type: "dashboard" })} /></PageTransition>}
        {cv.type === "settings" && <PageTransition pageKey="settings"><SettingsPage onBack={() => nav({ type: "profile" })} /></PageTransition>}
      </AnimatePresence>
      <SessionLogger isOpen={lo} onClose={() => setLo(false)} />
      <BottomNav activeTab={cv.type} onTabChange={tc} />
    </div>
  );
}

export default function App() {
  // Register service worker
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(console.error);
    }
  }, []);

  return (
    <ThemeProvider>
      <StudyProvider>
        <ConnectionStatus />
        <AppContent />
      </StudyProvider>
    </ThemeProvider>
  );
}

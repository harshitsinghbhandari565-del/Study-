"use client";

import { createContext, useContext, useReducer, useEffect, useMemo, useCallback, useRef, useState, type ReactNode } from "react";
import { format, parseISO, startOfWeek, endOfWeek, isWithinInterval, differenceInDays } from "date-fns";
import { STREAK_FREEZE_MAX, SUBJECTS } from "@/lib/constants";
import type { Chapter, StudySession, Goal, RevisionItem, Badge, UserStats, StreakData, WeeklyReport, HeatmapDay, SessionMood, ConfidenceLevel, Subject, Test, TestReflection, ScheduleDay, AppSettings } from "@/lib/types";
import { calculateLevel, calculateSubjectProgress, generateHeatmapData, generateRevisionSchedule, calculateBossReward, getResourceTypeById, calculateTotalHours, buildSchedule as buildScheduleUtil } from "@/lib/utils";
import { createFreshState } from "@/lib/seed-data";

const STORAGE_KEY = "studymap-state";
const BACKUP_META_KEY = "studymap-backup-meta";
const SETTINGS_KEY = "studymap-settings";
const PROFILE_KEY = "studymap-user-profile";
interface XPToast { id: string; amount: number; subjectColor: string; }

const DEFAULT_SETTINGS: AppSettings = { maxSessionsPerDay: 3, moodLogging: true, freezeCardLimit: 2, reminderBanners: true, backupReminderFrequency: "weekly" };

interface StudyState {
  chapters: Chapter[]; sessions: StudySession[]; goals: Goal[]; streakData: StreakData;
  badges: Badge[]; weeklyReports: WeeklyReport[]; userStats: UserStats; revisions: RevisionItem[];
  tests: Test[]; xpToasts: XPToast[]; schedule: ScheduleDay[] | null; isHydrated: boolean;
}

type StudyAction =
  | { type: "HYDRATE"; payload: Partial<StudyState> } | { type: "SET_HYDRATED" }
  | { type: "LOG_SESSION"; payload: { session: StudySession; chapterUpdate: Partial<Chapter>; chapterId: string; resourceId: string; xpEarned: number; subjectColor: string; revisionSchedule: string[] } }
  | { type: "TOGGLE_RESOURCE"; payload: { chapterId: string; resourceId: string; completed: boolean } }
  | { type: "SET_CONFIDENCE"; payload: { chapterId: string; confidence: ConfidenceLevel } }
  | { type: "SET_BOSS"; payload: { chapterId: string; isBoss: boolean } }
  | { type: "ADD_GOAL"; payload: Goal } | { type: "COMPLETE_GOAL"; payload: string }
  | { type: "MARK_REVISION_DONE"; payload: string } | { type: "DISMISS_TOAST"; payload: string }
  | { type: "USE_FREEZE_CARD" } | { type: "ADD_WEEKLY_REPORT"; payload: WeeklyReport }
  | { type: "UNLOCK_BADGE"; payload: string } | { type: "UPDATE_STREAK"; payload: Partial<StreakData> }
  | { type: "UPDATE_STATS"; payload: Partial<UserStats> } | { type: "ADD_TOAST"; payload: XPToast }
  | { type: "ADD_TEST"; payload: Test } | { type: "DELETE_TEST"; payload: string }
  | { type: "ADD_TEST_REFLECTION"; payload: { testId: string; reflection: TestReflection } }
  | { type: "SET_START_DATE"; payload: string } | { type: "TOGGLE_HOLIDAY"; payload: string }
  | { type: "UPDATE_SESSION_DURATION"; payload: { sessionId: string; duration: number } }
  | { type: "SET_MAX_SESSIONS"; payload: number } | { type: "SET_SCHEDULE"; payload: ScheduleDay[] | null }
  | { type: "EDIT_GOAL"; payload: { goalId: string; updates: Partial<Goal> } }
  | { type: "ARCHIVE_GOAL"; payload: string }
  | { type: "IMPORT_STATE"; payload: Partial<StudyState> } | { type: "RESET_DATA" };

function studyReducer(state: StudyState, action: StudyAction): StudyState {
  switch (action.type) {
    case "HYDRATE": return { ...state, ...action.payload, isHydrated: true };
    case "SET_HYDRATED": return { ...state, isHydrated: true };
    case "LOG_SESSION": { const { session, chapterUpdate, chapterId, resourceId, xpEarned, subjectColor, revisionSchedule } = action.payload; const uc = state.chapters.map((ch) => { if (ch.id !== chapterId) return ch; const ur = ch.resources.map((r) => r.id === resourceId ? { ...r, completed: true, completedAt: new Date().toISOString() } : r); return { ...ch, ...chapterUpdate, resources: ur, completedResources: ur.filter((r) => r.completed).map((r) => r.id), xpEarned: ch.xpEarned + xpEarned }; }); const nr: RevisionItem[] = revisionSchedule.map((d, i) => ({ chapterId, subjectId: session.subjectId, revisionNumber: (i+1) as 1|2|3|4, dueDate: d, completed: false })); return { ...state, chapters: uc, sessions: [session, ...state.sessions], revisions: [...state.revisions, ...nr], xpToasts: [...state.xpToasts, { id: `toast-${Date.now()}`, amount: xpEarned, subjectColor }], userStats: { ...state.userStats, totalXP: state.userStats.totalXP + xpEarned, totalSessions: state.userStats.totalSessions + 1 } }; }
    case "TOGGLE_RESOURCE": { const { chapterId, resourceId, completed } = action.payload; const uc = state.chapters.map((ch) => { if (ch.id !== chapterId) return ch; const rt = ch.resources.find((r) => r.id === resourceId); const ri = rt ? getResourceTypeById(rt.typeId) : null; const xd = (completed ? 1 : -1) * (ri?.xpValue ?? 0); const fd = ch.isBoss ? calculateBossReward(xd) : xd; const ur = ch.resources.map((r) => r.id === resourceId ? { ...r, completed, completedAt: completed ? new Date().toISOString() : null } : r); return { ...ch, resources: ur, completedResources: ur.filter((r) => r.completed).map((r) => r.id), xpEarned: Math.max(0, ch.xpEarned + fd) }; }); return { ...state, chapters: uc }; }
    case "SET_CONFIDENCE": return { ...state, chapters: state.chapters.map((ch) => ch.id === action.payload.chapterId ? { ...ch, confidence: action.payload.confidence } : ch) };
    case "SET_BOSS": return { ...state, chapters: state.chapters.map((ch) => ch.id === action.payload.chapterId ? { ...ch, isBoss: action.payload.isBoss } : ch) };
    case "ADD_GOAL": return { ...state, goals: [...state.goals, action.payload] };
    case "COMPLETE_GOAL": return { ...state, goals: state.goals.map((g) => g.id === action.payload ? { ...g, progressCount: g.targetCount } : g) };
    case "EDIT_GOAL": { const { goalId, updates } = action.payload; return { ...state, goals: state.goals.map((g) => { if (g.id !== goalId || g.progressCount >= g.targetCount) return g; return { ...g, ...updates }; }) }; }
    case "ARCHIVE_GOAL": return { ...state, goals: state.goals.map((g) => g.id === action.payload ? { ...g, progressCount: g.targetCount } : g) };
    case "MARK_REVISION_DONE": return { ...state, revisions: state.revisions.map((r, i) => `${r.chapterId}-${r.revisionNumber}` === action.payload || i.toString() === action.payload ? { ...r, completed: true } : r) };
    case "DISMISS_TOAST": return { ...state, xpToasts: state.xpToasts.filter((t) => t.id !== action.payload) };
    case "USE_FREEZE_CARD": return { ...state, streakData: { ...state.streakData, freezeCardsUsedThisMonth: state.streakData.freezeCardsUsedThisMonth + 1 } };
    case "ADD_WEEKLY_REPORT": return { ...state, weeklyReports: [...state.weeklyReports, action.payload] };
    case "UNLOCK_BADGE": return { ...state, badges: state.badges.map((b) => b.id === action.payload ? { ...b, earned: true, earnedAt: new Date().toISOString() } : b) };
    case "UPDATE_STREAK": return { ...state, streakData: { ...state.streakData, ...action.payload } };
    case "UPDATE_STATS": return { ...state, userStats: { ...state.userStats, ...action.payload } };
    case "ADD_TOAST": return { ...state, xpToasts: [...state.xpToasts, action.payload] };
    case "ADD_TEST": return { ...state, tests: [...state.tests, action.payload] };
    case "DELETE_TEST": return { ...state, tests: state.tests.filter((t) => t.id !== action.payload) };
    case "ADD_TEST_REFLECTION": return { ...state, tests: state.tests.map((t) => t.id === action.payload.testId ? { ...t, reflection: action.payload.reflection } : t) };
    case "SET_START_DATE": return { ...state, userStats: { ...state.userStats, sessionStartDate: action.payload } };
    case "TOGGLE_HOLIDAY": { const d = action.payload; const hd = state.userStats.holidayDates; return { ...state, userStats: { ...state.userStats, holidayDates: hd.includes(d) ? hd.filter((h) => h !== d) : [...hd, d] } }; }
    case "UPDATE_SESSION_DURATION": return { ...state, sessions: state.sessions.map((s) => s.id === action.payload.sessionId ? { ...s, duration: action.payload.duration } : s) };
    case "SET_MAX_SESSIONS": return { ...state, userStats: { ...state.userStats, maxSessionsPerDay: Math.max(2, Math.min(5, action.payload)) } };
    case "SET_SCHEDULE": return { ...state, schedule: action.payload };
    case "IMPORT_STATE": return { ...state, ...action.payload, xpToasts: [], schedule: null, isHydrated: true };
    case "RESET_DATA": { const f = createFreshState(); return { ...f, xpToasts: [], schedule: null, isHydrated: true }; }
    default: return state;
  }
}

function getInitialState(): StudyState { const f = createFreshState(); return { ...f, xpToasts: [], schedule: null, isHydrated: false }; }

interface SubjectWithProgress extends Subject { progress: number; level: number; totalXP: number; }

interface StudyContextValue {
  chapters: Chapter[]; sessions: StudySession[]; goals: Goal[]; streakData: StreakData;
  badges: Badge[]; weeklyReports: WeeklyReport[]; userStats: UserStats; revisions: RevisionItem[];
  tests: Test[]; xpToasts: XPToast[]; heatmap: HeatmapDay[]; schedule: ScheduleDay[] | null; isHydrated: boolean;
  totalXP: number; currentStreak: number; freezeCardsLeft: number; totalHours: number;
  subjectsWithProgress: SubjectWithProgress[]; revisionsDueToday: RevisionItem[];
  weeklySessionCount: number; subjectsTouchedThisWeek: string[]; nearestTest: Test | null;
  lastBackupAt: string | null; settings: AppSettings;
  userName: string; onboardingCompleted: boolean; subjectOrder: string[]; orderedSubjects: Subject[];
  logSession: (subjectId: string, chapterId: string, resourceId: string, mood: SessionMood, confidence: ConfidenceLevel, duration?: number) => void;
  toggleResourceComplete: (chapterId: string, resourceId: string) => void;
  setConfidence: (chapterId: string, confidence: ConfidenceLevel) => void;
  setBossChapter: (chapterId: string, isBoss: boolean) => void;
  addGoal: (goal: Goal) => void; completeGoal: (goalId: string) => void;
  editGoal: (goalId: string, updates: Partial<Goal>) => void; archiveGoal: (goalId: string) => void;
  markRevisionDone: (revisionId: string) => void; dismissToast: (toastId: string) => void;
  useFreezeCard: () => void; generateWeeklyReport: () => void; resetData: () => void;
  addTest: (t: Test) => void; deleteTest: (id: string) => void;
  addTestReflection: (testId: string, reflection: TestReflection) => void;
  setSessionStartDate: (date: string) => void; toggleHoliday: (date: string) => void;
  updateSessionDuration: (sessionId: string, duration: number) => void;
  setMaxSessionsPerDay: (value: number) => void;
  buildSchedule: () => void; clearSchedule: () => void;
  exportData: () => void; importData: (fileContent: string) => boolean;
  updateSetting: (key: keyof AppSettings, value: AppSettings[keyof AppSettings]) => void;
  setUserName: (name: string) => void; completeOnboarding: () => void;
  setSubjectOrder: (order: string[]) => void; reorderSubject: (subjectId: string, direction: "up" | "down") => void;
}

const StudyContext = createContext<StudyContextValue | null>(null);
export function useStudyContext(): StudyContextValue { const c = useContext(StudyContext); if (!c) throw new Error("useStudyContext must be used within StudyProvider"); return c; }

export function StudyProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(studyReducer, undefined, getInitialState);
  const saveRef = useRef<NodeJS.Timeout | null>(null);
  const [lastBackupAt, setLastBackupAt] = useState<string | null>(null);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [userName, setUserNameState] = useState("");
  const [onboardingCompleted, setOnboardingState] = useState(false);
  const [subjectOrder, setSubjectOrderState] = useState<string[]>(SUBJECTS.map((s) => s.id));

  // Load all persisted meta on mount
  useEffect(() => {
    try { const meta = localStorage.getItem(BACKUP_META_KEY); if (meta) { const p = JSON.parse(meta); if (p?.lastBackupAt) setLastBackupAt(p.lastBackupAt); } } catch {}
    try { const s = localStorage.getItem(SETTINGS_KEY); if (s) { const p = JSON.parse(s); setSettings({ ...DEFAULT_SETTINGS, ...p }); } } catch {}
    try { const p = localStorage.getItem(PROFILE_KEY); if (p) { const d = JSON.parse(p); if (d.userName) setUserNameState(d.userName); if (d.onboardingCompleted) setOnboardingState(true); if (Array.isArray(d.subjectOrder) && d.subjectOrder.length === 6) setSubjectOrderState(d.subjectOrder); } } catch {}
  }, []);

  // Save profile on change
  useEffect(() => { try { localStorage.setItem(PROFILE_KEY, JSON.stringify({ userName, onboardingCompleted, subjectOrder })); } catch {} }, [userName, onboardingCompleted, subjectOrder]);

  useEffect(() => { try { const s = localStorage.getItem(STORAGE_KEY); if (s) { const p = JSON.parse(s); if (p && typeof p === "object" && Array.isArray(p.chapters)) dispatch({ type: "HYDRATE", payload: p }); else dispatch({ type: "SET_HYDRATED" }); } else dispatch({ type: "SET_HYDRATED" }); } catch { dispatch({ type: "SET_HYDRATED" }); } }, []);
  useEffect(() => { if (!state.isHydrated) return; if (saveRef.current) clearTimeout(saveRef.current); saveRef.current = setTimeout(() => { try { const { xpToasts: _x, isHydrated: _h, schedule: _s, ...rest } = state; localStorage.setItem(STORAGE_KEY, JSON.stringify(rest)); } catch {} }, 500); return () => { if (saveRef.current) clearTimeout(saveRef.current); }; }, [state]);
  useEffect(() => { try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch {} }, [settings]);

  const totalXP = useMemo(() => state.chapters.reduce((s, ch) => s + ch.xpEarned, 0), [state.chapters]);
  const totalHours = useMemo(() => calculateTotalHours(state.sessions), [state.sessions]);
  const currentStreak = useMemo(() => state.streakData.currentStreak, [state.streakData.currentStreak]);
  const freezeCardsLeft = useMemo(() => Math.max(0, (settings.freezeCardLimit ?? STREAK_FREEZE_MAX) - state.streakData.freezeCardsUsedThisMonth), [state.streakData.freezeCardsUsedThisMonth, settings.freezeCardLimit]);
  const subjectsWithProgress = useMemo((): SubjectWithProgress[] => SUBJECTS.map((sub) => { const chs = state.chapters.filter((ch) => ch.subjectId === sub.id); const xp = chs.reduce((s, ch) => s + ch.xpEarned, 0); const prog = chs.length > 0 ? Math.round(chs.reduce((s, ch) => s + calculateSubjectProgress(ch), 0) / chs.length) : 0; return { ...sub, progress: prog, level: calculateLevel(xp).level, totalXP: xp }; }), [state.chapters]);
  const revisionsDueToday = useMemo(() => { const t = format(new Date(), "yyyy-MM-dd"); return state.revisions.filter((r) => r.dueDate === t && !r.completed); }, [state.revisions]);
  const heatmap = useMemo(() => generateHeatmapData(state.sessions), [state.sessions]);
  const weeklySessionCount = useMemo(() => { const n = new Date(); const ws = startOfWeek(n, { weekStartsOn: 1 }); const we = endOfWeek(n, { weekStartsOn: 1 }); return state.sessions.filter((s) => isWithinInterval(parseISO(s.timestamp), { start: ws, end: we })).length; }, [state.sessions]);
  const subjectsTouchedThisWeek = useMemo(() => { const n = new Date(); const ws = startOfWeek(n, { weekStartsOn: 1 }); const we = endOfWeek(n, { weekStartsOn: 1 }); const t = new Set<string>(); state.sessions.forEach((s) => { if (isWithinInterval(parseISO(s.timestamp), { start: ws, end: we })) t.add(s.subjectId); }); return Array.from(t); }, [state.sessions]);
  const nearestTest = useMemo(() => { const today = format(new Date(), "yyyy-MM-dd"); const u = state.tests.filter((t) => t.date >= today).sort((a, b) => a.date.localeCompare(b.date)); return u[0] || null; }, [state.tests]);
  const orderedSubjects = useMemo(() => { const map = new Map(SUBJECTS.map((s) => [s.id, s])); return subjectOrder.map((id) => map.get(id)).filter(Boolean) as Subject[]; }, [subjectOrder]);

  const logSession = useCallback((subjectId: string, chapterId: string, resourceId: string, mood: SessionMood, confidence: ConfidenceLevel, duration?: number) => {
    const chapter = state.chapters.find((ch) => ch.id === chapterId); if (!chapter) return;
    const resource = chapter.resources.find((r) => r.id === resourceId); if (!resource) return;
    const resourceType = getResourceTypeById(resource.typeId); if (!resourceType) return;
    const subject = SUBJECTS.find((s) => s.id === subjectId); if (!subject) return;
    let xpEarned = resourceType.xpValue; if (chapter.isBoss) xpEarned = calculateBossReward(xpEarned);
    const session: StudySession = { id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, subjectId, chapterId, resourceId, mood, confidence, xpEarned, timestamp: new Date().toISOString(), duration };
    dispatch({ type: "LOG_SESSION", payload: { session, chapterUpdate: { sessionsCount: chapter.sessionsCount + 1, lastStudied: new Date().toISOString(), confidence }, chapterId, resourceId, xpEarned, subjectColor: subject.color, revisionSchedule: generateRevisionSchedule(new Date().toISOString()) } });
    const today = format(new Date(), "yyyy-MM-dd"); const lastDate = state.streakData.lastSessionDate;
    let ns = state.streakData.currentStreak; if (!lastDate) ns = 1; else { const dd = differenceInDays(parseISO(today), parseISO(lastDate)); if (dd === 1) ns++; else if (dd > 1) ns = 1; }
    dispatch({ type: "UPDATE_STREAK", payload: { currentStreak: ns, longestStreak: Math.max(state.streakData.longestStreak, ns), lastSessionDate: today, history: [...state.streakData.history, { date: today, hadSession: true }] } });
    setTimeout(() => {
      if (chapter.isBoss && chapter.resources.every((r) => r.completed || r.id === resourceId)) { const b = state.badges.find((b) => b.id === "boss-slayer"); if (b && !b.earned) dispatch({ type: "UNLOCK_BADGE", payload: "boss-slayer" }); }
      if (ns >= 7) { const b = state.badges.find((b) => b.id === "streak-keeper"); if (b && !b.earned) dispatch({ type: "UNLOCK_BADGE", payload: "streak-keeper" }); }
      if (weeklySessionCount + 1 >= 20) { const b = state.badges.find((b) => b.id === "week-warrior"); if (b && !b.earned) dispatch({ type: "UNLOCK_BADGE", payload: "week-warrior" }); }
      const tw = new Set(subjectsTouchedThisWeek); tw.add(subjectId); if (tw.size >= 6) { const b = state.badges.find((b) => b.id === "balanced-scholar"); if (b && !b.earned) dispatch({ type: "UNLOCK_BADGE", payload: "balanced-scholar" }); }
      if (resource.typeId === "hots") { const hc = state.sessions.filter((s) => { const c = state.chapters.find((c) => c.id === s.chapterId); return c?.resources.find((r) => r.id === s.resourceId)?.typeId === "hots"; }).length; if (hc + 1 >= 10) { const b = state.badges.find((b) => b.id === "hot-grinder"); if (b && !b.earned) dispatch({ type: "UNLOCK_BADGE", payload: "hot-grinder" }); } }
    }, 100);
  }, [state.chapters, state.badges, state.streakData, state.sessions, weeklySessionCount, subjectsTouchedThisWeek]);

  const toggleResourceComplete = useCallback((chapterId: string, resourceId: string) => { const ch = state.chapters.find((c) => c.id === chapterId); if (!ch) return; const r = ch.resources.find((r) => r.id === resourceId); if (!r) return; dispatch({ type: "TOGGLE_RESOURCE", payload: { chapterId, resourceId, completed: !r.completed } }); }, [state.chapters]);
  const setConfidence = useCallback((chapterId: string, confidence: ConfidenceLevel) => dispatch({ type: "SET_CONFIDENCE", payload: { chapterId, confidence } }), []);
  const setBossChapter = useCallback((chapterId: string, isBoss: boolean) => dispatch({ type: "SET_BOSS", payload: { chapterId, isBoss } }), []);
  const addGoal = useCallback((goal: Goal) => dispatch({ type: "ADD_GOAL", payload: goal }), []);
  const completeGoal = useCallback((goalId: string) => dispatch({ type: "COMPLETE_GOAL", payload: goalId }), []);
  const editGoal = useCallback((goalId: string, updates: Partial<Goal>) => dispatch({ type: "EDIT_GOAL", payload: { goalId, updates } }), []);
  const archiveGoal = useCallback((goalId: string) => dispatch({ type: "ARCHIVE_GOAL", payload: goalId }), []);
  const markRevisionDone = useCallback((revisionId: string) => dispatch({ type: "MARK_REVISION_DONE", payload: revisionId }), []);
  const dismissToast = useCallback((toastId: string) => dispatch({ type: "DISMISS_TOAST", payload: toastId }), []);
  const addTest = useCallback((t: Test) => dispatch({ type: "ADD_TEST", payload: t }), []);
  const deleteTest = useCallback((id: string) => dispatch({ type: "DELETE_TEST", payload: id }), []);
  const addTestReflection = useCallback((testId: string, reflection: TestReflection) => dispatch({ type: "ADD_TEST_REFLECTION", payload: { testId, reflection } }), []);
  const setSessionStartDate = useCallback((date: string) => dispatch({ type: "SET_START_DATE", payload: date }), []);
  const toggleHoliday = useCallback((date: string) => { if (/^\d{4}-\d{2}-\d{2}$/.test(date)) dispatch({ type: "TOGGLE_HOLIDAY", payload: date }); }, []);
  const updateSessionDuration = useCallback((sessionId: string, duration: number) => dispatch({ type: "UPDATE_SESSION_DURATION", payload: { sessionId, duration } }), []);
  const setMaxSessionsPerDay = useCallback((value: number) => dispatch({ type: "SET_MAX_SESSIONS", payload: value }), []);
  const buildScheduleAction = useCallback(() => { const sched = buildScheduleUtil(state.chapters, SUBJECTS, state.tests, state.userStats.holidayDates, state.userStats.sessionStartDate, settings.maxSessionsPerDay, 7); dispatch({ type: "SET_SCHEDULE", payload: sched }); }, [state.chapters, state.tests, state.userStats.holidayDates, state.userStats.sessionStartDate, settings.maxSessionsPerDay]);
  const clearSchedule = useCallback(() => dispatch({ type: "SET_SCHEDULE", payload: null }), []);
  const useFreezeCard = useCallback(() => { const today = format(new Date(), "yyyy-MM-dd"); if (freezeCardsLeft > 0 && !state.sessions.some((s) => format(parseISO(s.timestamp), "yyyy-MM-dd") === today)) { dispatch({ type: "USE_FREEZE_CARD" }); dispatch({ type: "UPDATE_STREAK", payload: { history: [...state.streakData.history, { date: today, hadSession: false }] } }); } }, [freezeCardsLeft, state.sessions, state.streakData.history]);
  const generateWeeklyReport = useCallback(() => { const n = new Date(); const ws = startOfWeek(n, { weekStartsOn: 1 }); const we = endOfWeek(n, { weekStartsOn: 1 }); const wS = state.sessions.filter((s) => isWithinInterval(parseISO(s.timestamp), { start: ws, end: we })); const sc: Record<string, number> = {}; wS.forEach((s) => { sc[s.subjectId] = (sc[s.subjectId] || 0) + 1; }); const se = Object.entries(sc); const m = se.length > 0 ? se.sort((a, b) => b[1] - a[1])[0][0] : ""; const w = se.length > 0 ? se.sort((a, b) => a[1] - b[1])[0][0] : ""; const dn = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]; const dc: Record<string, number> = {}; wS.forEach((s) => { const d = dn[parseISO(s.timestamp).getDay()]; dc[d] = (dc[d] || 0) + 1; }); const bd = Object.entries(dc).sort((a, b) => b[1] - a[1])[0]?.[0] ?? ""; const rc = state.chapters.reduce((s, ch) => s + ch.resources.filter((r) => r.completedAt && isWithinInterval(parseISO(r.completedAt), { start: ws, end: we })).length, 0); dispatch({ type: "ADD_WEEKLY_REPORT", payload: { weekNumber: Math.ceil((n.getTime() - new Date(n.getFullYear(), 0, 1).getTime()) / 604800000), totalSessions: wS.length, subjectsTouched: Object.keys(sc).length, mostActiveSubjectId: m, weakestSubjectId: w, bestDay: bd, resourcesCompleted: rc, xpEarned: wS.reduce((s, se) => s + se.xpEarned, 0), currentStreak: state.streakData.currentStreak, lowConfidenceChapters: state.chapters.filter((ch) => ch.confidence <= 1 && ch.sessionsCount > 0).map((ch) => ch.id) } }); }, [state.sessions, state.chapters, state.streakData.currentStreak]);
  const resetData = useCallback(() => { dispatch({ type: "RESET_DATA" }); localStorage.removeItem(STORAGE_KEY); }, []);
  const exportData = useCallback(() => { try { const { xpToasts: _x, isHydrated: _h, schedule: _s, ...exportable } = state; const payload = { version: "studymap-v1", exportedAt: new Date().toISOString(), state: exportable }; const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `studymap-backup-${format(new Date(), "yyyy-MM-dd")}.json`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url); const now = new Date().toISOString(); setLastBackupAt(now); localStorage.setItem(BACKUP_META_KEY, JSON.stringify({ lastBackupAt: now })); } catch (e) { console.error("Export failed:", e); } }, [state]);
  const importData = useCallback((fileContent: string): boolean => { try { const parsed = JSON.parse(fileContent); if (!parsed?.state || !Array.isArray(parsed.state.chapters) || !Array.isArray(parsed.state.sessions)) return false; dispatch({ type: "IMPORT_STATE", payload: parsed.state }); localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed.state)); return true; } catch { return false; } }, []);
  const updateSetting = useCallback((key: keyof AppSettings, value: AppSettings[keyof AppSettings]) => setSettings((prev) => ({ ...prev, [key]: value })), []);

  const setUserName = useCallback((name: string) => setUserNameState(name), []);
  const completeOnboarding = useCallback(() => setOnboardingState(true), []);
  const setSubjectOrder = useCallback((order: string[]) => setSubjectOrderState(order), []);
  const reorderSubject = useCallback((subjectId: string, direction: "up" | "down") => {
    setSubjectOrderState((prev) => {
      const idx = prev.indexOf(subjectId); if (idx === -1) return prev;
      const newIdx = direction === "up" ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const next = [...prev]; [next[idx], next[newIdx]] = [next[newIdx], next[idx]]; return next;
    });
  }, []);

  const val: StudyContextValue = useMemo(() => ({
    chapters: state.chapters, sessions: state.sessions, goals: state.goals, streakData: state.streakData,
    badges: state.badges, weeklyReports: state.weeklyReports, userStats: state.userStats, revisions: state.revisions,
    tests: state.tests, xpToasts: state.xpToasts, heatmap, schedule: state.schedule, isHydrated: state.isHydrated,
    totalXP, totalHours, currentStreak, freezeCardsLeft, subjectsWithProgress, revisionsDueToday, weeklySessionCount, subjectsTouchedThisWeek, nearestTest,
    lastBackupAt, settings, userName, onboardingCompleted, subjectOrder, orderedSubjects,
    logSession, toggleResourceComplete, setConfidence, setBossChapter, addGoal, completeGoal, editGoal, archiveGoal, markRevisionDone,
    dismissToast, useFreezeCard, generateWeeklyReport, resetData, addTest, deleteTest, addTestReflection, setSessionStartDate, toggleHoliday, updateSessionDuration, setMaxSessionsPerDay, buildSchedule: buildScheduleAction, clearSchedule,
    exportData, importData, updateSetting, setUserName, completeOnboarding, setSubjectOrder, reorderSubject,
  }), [state, heatmap, totalXP, totalHours, currentStreak, freezeCardsLeft, subjectsWithProgress, revisionsDueToday, weeklySessionCount, subjectsTouchedThisWeek, nearestTest, lastBackupAt, settings, userName, onboardingCompleted, subjectOrder, orderedSubjects, logSession, toggleResourceComplete, setConfidence, setBossChapter, addGoal, completeGoal, editGoal, archiveGoal, markRevisionDone, dismissToast, useFreezeCard, generateWeeklyReport, resetData, addTest, deleteTest, addTestReflection, setSessionStartDate, toggleHoliday, updateSessionDuration, setMaxSessionsPerDay, buildScheduleAction, clearSchedule, exportData, importData, updateSetting, setUserName, completeOnboarding, setSubjectOrder, reorderSubject]);

  return <StudyContext.Provider value={val}>{children}</StudyContext.Provider>;
}
export default StudyProvider;

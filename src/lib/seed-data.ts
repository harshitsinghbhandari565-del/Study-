/**
 * STUDYMAP — Seed Data (Iteration 5.3 + Demo)
 *
 * Full syllabus, differentiated resources, empty initial state,
 * plus a fully populated demo state for preview.
 */

import { SUBJECTS, RESOURCE_TYPES } from "./constants";
import type {
  Subject, Chapter, Resource, StudySession, Goal, RevisionItem,
  Badge, UserStats, StreakData, WeeklyReport, Test, ScheduleDay,
  SessionMood, ConfidenceLevel,
} from "./types";

interface ChapterBlueprint { unit: string; name: string; isBoss: boolean; }

const LITE_RESOURCE_IDS = ["school-lecture", "ncert", "self-studied", "online-lecture", "pyqs"];
const FULL_RESOURCE_IDS = RESOURCE_TYPES.map((r) => r.id);
const LITE_SUBJECTS = new Set(["computer-science", "physical-education", "english"]);

const SYLLABUS: Record<string, ChapterBlueprint[]> = {
  physics: [
    { unit: "Unit I: Electrostatics", name: "Electric Charges and Fields", isBoss: true },
    { unit: "Unit I: Electrostatics", name: "Electrostatic Potential and Capacitance", isBoss: false },
    { unit: "Unit II: Current Electricity", name: "Current Electricity", isBoss: false },
    { unit: "Unit III: Magnetic Effects of Current and Magnetism", name: "Moving Charges and Magnetism", isBoss: true },
    { unit: "Unit III: Magnetic Effects of Current and Magnetism", name: "Magnetism and Matter", isBoss: false },
    { unit: "Unit IV: Electromagnetic Induction and Alternating Currents", name: "Electromagnetic Induction", isBoss: false },
    { unit: "Unit IV: Electromagnetic Induction and Alternating Currents", name: "Alternating Current", isBoss: false },
    { unit: "Unit V: Electromagnetic Waves", name: "Electromagnetic Waves", isBoss: false },
    { unit: "Unit VI: Optics", name: "Ray Optics and Optical Instruments", isBoss: true },
    { unit: "Unit VI: Optics", name: "Wave Optics", isBoss: false },
    { unit: "Unit VII: Dual Nature of Radiation and Matter", name: "Dual Nature of Radiation and Matter", isBoss: false },
    { unit: "Unit VIII: Atoms and Nuclei", name: "Atoms", isBoss: false },
    { unit: "Unit VIII: Atoms and Nuclei", name: "Nuclei", isBoss: false },
    { unit: "Unit IX: Electronic Devices", name: "Semiconductor Electronics: Materials, Devices and Simple Circuits", isBoss: false },
  ],
  chemistry: [
    { unit: "Solutions", name: "Solutions", isBoss: false },
    { unit: "Electrochemistry", name: "Electrochemistry", isBoss: true },
    { unit: "Chemical Kinetics", name: "Chemical Kinetics", isBoss: false },
    { unit: "d and f Block Elements", name: "d and f Block Elements", isBoss: false },
    { unit: "Coordination Compounds", name: "Coordination Compounds", isBoss: false },
    { unit: "Haloalkanes and Haloarenes", name: "Haloalkanes and Haloarenes", isBoss: false },
    { unit: "Alcohols, Phenols and Ethers", name: "Alcohols, Phenols and Ethers", isBoss: false },
    { unit: "Aldehydes, Ketones and Carboxylic Acids", name: "Aldehydes, Ketones and Carboxylic Acids", isBoss: true },
    { unit: "Amines", name: "Amines", isBoss: false },
    { unit: "Biomolecules", name: "Biomolecules", isBoss: true },
  ],
  maths: [
    { unit: "Unit I: Relations and Functions", name: "Relations and Functions", isBoss: false },
    { unit: "Unit I: Relations and Functions", name: "Inverse Trigonometric Functions", isBoss: false },
    { unit: "Unit II: Algebra", name: "Matrices", isBoss: true },
    { unit: "Unit II: Algebra", name: "Determinants", isBoss: false },
    { unit: "Unit III: Calculus", name: "Continuity and Differentiability", isBoss: true },
    { unit: "Unit III: Calculus", name: "Applications of Derivatives", isBoss: false },
    { unit: "Unit III: Calculus", name: "Integrals", isBoss: false },
    { unit: "Unit III: Calculus", name: "Application of the Integrals", isBoss: false },
    { unit: "Unit III: Calculus", name: "Differential Equations", isBoss: false },
    { unit: "Unit IV: Vectors and Three-Dimensional Geometry", name: "Vectors", isBoss: true },
    { unit: "Unit IV: Vectors and Three-Dimensional Geometry", name: "Three-dimensional Geometry", isBoss: false },
    { unit: "Unit V: Linear Programming", name: "Linear Programming", isBoss: false },
    { unit: "Unit VI: Probability", name: "Probability", isBoss: false },
  ],
  "computer-science": [
    { unit: "Computational Thinking and Programming – 2", name: "Computational Thinking and Programming – 2", isBoss: true },
    { unit: "Computer Networks", name: "Computer Networks", isBoss: false },
    { unit: "Database Management", name: "Database Management", isBoss: false },
  ],
  "physical-education": [
    { unit: "Management of Sporting Events", name: "Management of Sporting Events", isBoss: false },
    { unit: "Children and Women in Sports", name: "Children and Women in Sports", isBoss: false },
    { unit: "Yoga as Preventive Measure for Lifestyle Disease", name: "Yoga as Preventive Measure for Lifestyle Disease", isBoss: false },
    { unit: "Physical Education & Sports for CWSN", name: "Physical Education & Sports for CWSN", isBoss: false },
    { unit: "Sports & Nutrition", name: "Sports & Nutrition", isBoss: false },
    { unit: "Test and Measurement in Sports", name: "Test and Measurement in Sports", isBoss: true },
    { unit: "Physiology & Injuries in Sport", name: "Physiology & Injuries in Sport", isBoss: false },
    { unit: "Biomechanics and Sports", name: "Biomechanics and Sports", isBoss: true },
    { unit: "Psychology and Sports", name: "Psychology and Sports", isBoss: false },
    { unit: "Training in Sports", name: "Training in Sports", isBoss: true },
  ],
  english: [
    { unit: "Reading Skills", name: "Reading Comprehension (Factual)", isBoss: true },
    { unit: "Reading Skills", name: "Reading Comprehension (Descriptive)", isBoss: false },
    { unit: "Reading Skills", name: "Reading Comprehension (Literary)", isBoss: false },
    { unit: "Reading Skills", name: "Case-based Factual Passage", isBoss: false },
    { unit: "Creative Writing Skills", name: "Notice", isBoss: true },
    { unit: "Creative Writing Skills", name: "Invitation & Reply", isBoss: false },
    { unit: "Creative Writing Skills", name: "Letters", isBoss: false },
    { unit: "Creative Writing Skills", name: "Article/Report Writing", isBoss: false },
    { unit: "Flamingo (Prose)", name: "The Last Lesson", isBoss: true },
    { unit: "Flamingo (Prose)", name: "Lost Spring", isBoss: false },
    { unit: "Flamingo (Prose)", name: "Deep Water", isBoss: false },
    { unit: "Flamingo (Prose)", name: "The Rattrap", isBoss: false },
    { unit: "Flamingo (Prose)", name: "Indigo", isBoss: false },
    { unit: "Flamingo (Prose)", name: "Poets and Pancakes", isBoss: false },
    { unit: "Flamingo (Prose)", name: "The Interview", isBoss: false },
    { unit: "Flamingo (Prose)", name: "Going Places", isBoss: false },
    { unit: "Flamingo (Poetry)", name: "My Mother at Sixty-Six", isBoss: false },
    { unit: "Flamingo (Poetry)", name: "Keeping Quiet", isBoss: false },
    { unit: "Flamingo (Poetry)", name: "A Thing of Beauty", isBoss: false },
    { unit: "Flamingo (Poetry)", name: "A Roadside Stand", isBoss: false },
    { unit: "Flamingo (Poetry)", name: "Aunt Jennifer's Tigers", isBoss: false },
    { unit: "Vistas (Supplementary)", name: "The Third Level", isBoss: false },
    { unit: "Vistas (Supplementary)", name: "The Tiger King", isBoss: false },
    { unit: "Vistas (Supplementary)", name: "Journey to the End of the Earth", isBoss: false },
    { unit: "Vistas (Supplementary)", name: "The Enemy", isBoss: false },
    { unit: "Vistas (Supplementary)", name: "On the Face of It", isBoss: false },
    { unit: "Vistas (Supplementary)", name: "Memories of Childhood", isBoss: false },
  ],
};

function genRes(chapterId: string, subjectId: string): Resource[] {
  const ids = LITE_SUBJECTS.has(subjectId) ? LITE_RESOURCE_IDS : FULL_RESOURCE_IDS;
  return ids.map((typeId, i) => ({ id: `${chapterId}-resource-${i}`, typeId, completed: false, completedAt: null }));
}

function generateAllChapters(): Chapter[] {
  const chapters: Chapter[] = [];
  for (const subject of SUBJECTS) {
    const bps = SYLLABUS[subject.id]; if (!bps) continue;
    bps.forEach((bp, i) => { const id = `${subject.id}-${i}`; chapters.push({ id, subjectId: subject.id, name: bp.name, unit: bp.unit, resources: genRes(id, subject.id), isBoss: bp.isBoss, confidence: 0, sessionsCount: 0, lastStudied: null, xpEarned: 0, completedResources: [] }); });
  }
  return chapters;
}

const INITIAL_BADGES: Badge[] = [
  { id: "boss-slayer", name: "Boss Slayer", description: "Complete a Boss Chapter", icon: "Sword", earned: false, earnedAt: null },
  { id: "streak-keeper", name: "Streak Keeper", description: "Maintain a 7-day streak", icon: "Flame", earned: false, earnedAt: null },
  { id: "week-warrior", name: "Week Warrior", description: "Complete 20 sessions in one week", icon: "Calendar", earned: false, earnedAt: null },
  { id: "balanced-scholar", name: "Balanced Scholar", description: "Touch all 6 subjects in one week", icon: "Scale", earned: false, earnedAt: null },
  { id: "hot-grinder", name: "HOT Grinder", description: "Complete 10 HOTs sessions", icon: "Zap", earned: false, earnedAt: null },
];

export interface SeedDataType {
  subjects: Subject[]; chapters: Chapter[]; sessions: StudySession[]; goals: Goal[];
  revisions: RevisionItem[]; badges: Badge[]; userStats: UserStats; streakData: StreakData;
  weeklyReports: WeeklyReport[]; tests: Test[];
}

export function createFreshState(): SeedDataType {
  return {
    subjects: SUBJECTS.map((s) => ({ ...s })), chapters: generateAllChapters(),
    sessions: [], goals: [], revisions: [], badges: INITIAL_BADGES.map((b) => ({ ...b })),
    userStats: { totalXP: 0, totalSessions: 0, subjectsTouchedThisWeek: 0, weeklyXP: 0, bestStudyHour: 0, favoriteSubjectId: "", weakestSubjectId: "", sessionStartDate: "2026-07-01", holidayDates: [], maxSessionsPerDay: 3 },
    streakData: { currentStreak: 0, longestStreak: 0, freezeCardsUsedThisMonth: 0, lastSessionDate: "", history: [] },
    weeklyReports: [], tests: [],
  };
}

export const SEED_DATA: SeedDataType = createFreshState();
export function getSeedChapterById(id: string) { return SEED_DATA.chapters.find((ch) => ch.id === id); }
export function getSeedChaptersBySubject(id: string) { return SEED_DATA.chapters.filter((ch) => ch.subjectId === id); }
export function getSeedChapterCount() { return SEED_DATA.chapters.length; }
export function getSeedBossChapters() { return SEED_DATA.chapters.filter((ch) => ch.isBoss); }

// ═══════════════════════════════════════════════════════════════════════════════
// DEMO STATE — 30 days of realistic populated data
// ═══════════════════════════════════════════════════════════════════════════════

function d(daysAgo: number, hour: number = 19, min: number = 30): string {
  const dt = new Date(); dt.setDate(dt.getDate() - daysAgo); dt.setHours(hour, min, 0, 0); return dt.toISOString();
}
function ds(daysAgo: number): string { const dt = new Date(); dt.setDate(dt.getDate() - daysAgo); return dt.toISOString().split("T")[0]; }
function df(daysFromNow: number): string { const dt = new Date(); dt.setDate(dt.getDate() + daysFromNow); return dt.toISOString().split("T")[0]; }

export function createDemoState(): SeedDataType & {
  schedule: ScheduleDay[] | null;
} {
  const chapters = generateAllChapters();
  const moods: SessionMood[] = ["locked-in","locked-in","locked-in","okay","okay","okay","okay","low","low","low"];
  const confs: ConfidenceLevel[] = [1,1,1,2,2,2,2,3,3,3];

  // Session definitions: [daysAgo, subjectId, chapterIndex, resourceIndex, hour, duration]
  type SD = [number, string, number, number, number, number];
  const defs: SD[] = [
    // Physics (20)
    [29,"physics",0,0,18,60],[28,"physics",0,1,19,90],[27,"physics",0,2,20,60],[26,"physics",0,3,19,90],
    [25,"physics",0,4,18,60],[24,"physics",0,5,19,120],[23,"physics",0,6,20,90],[22,"physics",0,7,19,60],
    [21,"physics",0,8,18,90],[20,"physics",1,0,19,60],[19,"physics",1,1,20,90],[18,"physics",1,2,19,60],
    [17,"physics",3,0,18,120],[16,"physics",3,1,19,90],[15,"physics",3,2,20,60],[14,"physics",3,3,19,90],
    [12,"physics",8,0,18,120],[10,"physics",8,1,19,90],[8,"physics",2,0,20,60],[5,"physics",4,0,19,90],
    // Chemistry (15)
    [28,"chemistry",0,0,7,60],[26,"chemistry",0,1,8,90],[24,"chemistry",0,2,19,60],[22,"chemistry",1,0,18,120],
    [20,"chemistry",1,1,19,90],[18,"chemistry",1,2,20,60],[16,"chemistry",1,3,19,90],[14,"chemistry",1,4,18,60],
    [13,"chemistry",1,5,19,120],[11,"chemistry",7,0,20,90],[9,"chemistry",7,1,19,60],[7,"chemistry",7,2,18,90],
    [6,"chemistry",2,0,19,60],[4,"chemistry",9,0,20,90],[2,"chemistry",9,1,19,60],
    // Maths (22)
    [29,"maths",0,0,7,90],[28,"maths",0,1,19,60],[27,"maths",2,0,18,120],[26,"maths",2,1,19,90],
    [25,"maths",2,2,20,60],[24,"maths",2,3,19,90],[23,"maths",2,4,18,120],[22,"maths",2,5,19,60],
    [21,"maths",2,6,20,90],[20,"maths",2,7,19,120],[19,"maths",2,8,18,60],[18,"maths",4,0,19,90],
    [17,"maths",4,1,20,120],[16,"maths",4,2,19,60],[15,"maths",4,3,18,90],[14,"maths",4,4,19,120],
    [13,"maths",4,5,20,60],[11,"maths",5,0,19,90],[9,"maths",9,0,18,120],[7,"maths",9,1,19,90],
    [3,"maths",3,0,20,60],[1,"maths",6,0,19,90],
    // CS (8)
    [27,"computer-science",0,0,16,60],[23,"computer-science",0,1,17,90],[19,"computer-science",0,2,16,60],
    [15,"computer-science",0,3,17,90],[11,"computer-science",0,4,16,60],[8,"computer-science",1,0,17,90],
    [4,"computer-science",1,1,16,60],[1,"computer-science",1,2,17,90],
    // PE (5)
    [26,"physical-education",5,0,15,30],[20,"physical-education",5,1,15,30],[14,"physical-education",5,2,16,30],
    [8,"physical-education",7,0,15,30],[3,"physical-education",7,1,15,30],
    // English (5)
    [25,"english",0,0,10,60],[19,"english",0,1,10,60],[13,"english",4,0,11,60],
    [7,"english",4,1,10,60],[2,"english",8,0,11,60],
  ];

  const sessions: StudySession[] = [];
  const chapterStats: Record<string, { sc: number; xp: number; last: string; conf: ConfidenceLevel }> = {};

  defs.forEach((def, idx) => {
    const [daysAgo, subjectId, chapterIdx, resIdx, hour, dur] = def;
    const chapterId = `${subjectId}-${chapterIdx}`;
    const ch = chapters.find((c) => c.id === chapterId);
    if (!ch) return;
    const resource = ch.resources[resIdx];
    if (!resource) return;
    const rt = RESOURCE_TYPES.find((r) => r.id === resource.typeId);
    const xp = rt ? (ch.isBoss ? rt.xpValue * 3 : rt.xpValue) : 15;
    const mood = moods[idx % moods.length];
    const conf = confs[idx % confs.length];
    const ts = d(daysAgo, hour, Math.floor(Math.random() * 50));

    // Mark resource completed
    resource.completed = true;
    resource.completedAt = ts;

    if (!chapterStats[chapterId]) chapterStats[chapterId] = { sc: 0, xp: 0, last: ts, conf: 0 };
    chapterStats[chapterId].sc++;
    chapterStats[chapterId].xp += xp;
    chapterStats[chapterId].last = ts;
    chapterStats[chapterId].conf = conf;

    sessions.push({ id: `demo-${idx}`, subjectId, chapterId, resourceId: resource.id, mood, confidence: conf, xpEarned: xp, timestamp: ts, duration: dur });
  });

  // Mark extra resources complete for "100% chapters"
  const fullComplete: string[] = [
    "physics-0","physics-1","physics-3","physics-8",
    "chemistry-0","chemistry-1","chemistry-7",
    "maths-0","maths-2","maths-4","maths-9","maths-5",
    "computer-science-0","computer-science-1",
    "physical-education-5","physical-education-7",
    "english-0","english-4",
  ];
  fullComplete.forEach((cid) => {
    const ch = chapters.find((c) => c.id === cid);
    if (!ch) return;
    ch.resources.forEach((r) => { if (!r.completed) { r.completed = true; r.completedAt = d(Math.floor(Math.random() * 25) + 2, 19); } });
    if (!chapterStats[cid]) chapterStats[cid] = { sc: 0, xp: 0, last: d(2, 19), conf: 3 };
    chapterStats[cid].conf = 3;
    const totalXp = ch.resources.reduce((s, r) => { const rt = RESOURCE_TYPES.find((t) => t.id === r.typeId); return s + (rt ? (ch.isBoss ? rt.xpValue * 3 : rt.xpValue) : 0); }, 0);
    chapterStats[cid].xp = totalXp;
  });

  // Partially complete some chapters
  const partials: Array<[string, number]> = [
    ["physics-2", 5],["physics-4", 3],["physics-9", 4],
    ["chemistry-2", 4],["chemistry-3", 3],["chemistry-5", 2],
    ["maths-1", 5],["maths-3", 4],["maths-6", 3],["maths-10", 2],
    ["english-8", 2],["physical-education-0", 2],
  ];
  partials.forEach(([cid, count]) => {
    const ch = chapters.find((c) => c.id === cid);
    if (!ch) return;
    let done = 0;
    ch.resources.forEach((r) => { if (!r.completed && done < count) { r.completed = true; r.completedAt = d(Math.floor(Math.random() * 20) + 3, 19); done++; } });
    if (!chapterStats[cid]) chapterStats[cid] = { sc: 0, xp: 0, last: d(5, 19), conf: 2 };
    chapterStats[cid].conf = 2;
  });

  // Apply chapter stats
  chapters.forEach((ch) => {
    const st = chapterStats[ch.id];
    if (st) { ch.sessionsCount = st.sc; ch.xpEarned = st.xp; ch.lastStudied = st.last; ch.confidence = st.conf; }
    ch.completedResources = ch.resources.filter((r) => r.completed).map((r) => r.id);
  });

  const totalXP = chapters.reduce((s, ch) => s + ch.xpEarned, 0);

  // Streak history
  const history = [];
  for (let i = 59; i >= 0; i--) {
    const hadSession = i <= 27 || (i >= 31 && i <= 61) ? true : Math.random() > 0.5;
    history.push({ date: ds(i), hadSession: i === 29 ? false : hadSession });
  }

  // Revisions
  const revisions: RevisionItem[] = [
    { chapterId: "physics-0", subjectId: "physics", revisionNumber: 1, dueDate: ds(0), completed: false },
    { chapterId: "maths-2", subjectId: "maths", revisionNumber: 2, dueDate: ds(0), completed: false },
    { chapterId: "chemistry-1", subjectId: "chemistry", revisionNumber: 1, dueDate: df(1), completed: false },
    { chapterId: "physics-3", subjectId: "physics", revisionNumber: 1, dueDate: df(3), completed: false },
    { chapterId: "maths-4", subjectId: "maths", revisionNumber: 2, dueDate: df(5), completed: false },
    { chapterId: "physics-1", subjectId: "physics", revisionNumber: 3, dueDate: ds(3), completed: false }, // overdue
    { chapterId: "chemistry-0", subjectId: "chemistry", revisionNumber: 1, dueDate: ds(7), completed: true },
    { chapterId: "maths-0", subjectId: "maths", revisionNumber: 1, dueDate: ds(10), completed: true },
    { chapterId: "physics-0", subjectId: "physics", revisionNumber: 2, dueDate: ds(14), completed: true },
  ];

  // Tests
  const tests: Test[] = [
    { id: "demo-test-1", subjectId: "physics", name: "Physics Unit Test", date: df(14), type: "board" as const, notes: "Focus on Electrostatics and Optics" },
    { id: "demo-test-2", subjectId: "chemistry", name: "Chemistry Mid-term", date: df(21), type: "mock" as const },
    { id: "demo-test-3", subjectId: "maths", name: "Maths Practice Test", date: df(28), type: "school" as const, notes: "Calculus heavy" },
    { id: "demo-test-4", subjectId: "english", name: "English Assessment", date: df(35), type: "board" as const },
  ];

  // Goals
  const goals: Goal[] = [
    { id: "demo-goal-1", subjectId: "physics", targetType: "complete-pyqs", targetCount: 15, deadline: df(10), description: "Finish Physics PYQs", progressCount: 8, createdAt: d(20, 10) },
    { id: "demo-goal-2", subjectId: "chemistry", targetType: "complete-resources", targetCount: 10, deadline: df(20), description: "Complete Chemistry revision", progressCount: 4, createdAt: d(18, 10) },
    { id: "demo-goal-3", subjectId: "maths", targetType: "complete-chapters", targetCount: 20, deadline: df(25), description: "Maths HOTs grind", progressCount: 12, createdAt: d(22, 10) },
    { id: "demo-goal-4", subjectId: "computer-science", targetType: "complete-resources", targetCount: 5, deadline: ds(30), description: "Finish CS notes", progressCount: 5, createdAt: d(45, 10) },
  ];

  // Badges
  const badges: Badge[] = [
    { id: "boss-slayer", name: "Boss Slayer", description: "Complete a Boss Chapter", icon: "Sword", earned: true, earnedAt: d(14, 19) },
    { id: "streak-keeper", name: "Streak Keeper", description: "Maintain a 7-day streak", icon: "Flame", earned: true, earnedAt: d(21, 19) },
    { id: "week-warrior", name: "Week Warrior", description: "Complete 20 sessions in one week", icon: "Calendar", earned: true, earnedAt: d(7, 19) },
    { id: "balanced-scholar", name: "Balanced Scholar", description: "Touch all 6 subjects in one week", icon: "Scale", earned: false, earnedAt: null },
    { id: "hot-grinder", name: "HOT Grinder", description: "Complete 10 HOTs sessions", icon: "Zap", earned: false, earnedAt: null },
  ];

  // Weekly reports
  const weeklyReports: WeeklyReport[] = [
    { weekNumber: 24, totalSessions: 18, subjectsTouched: 5, mostActiveSubjectId: "physics", weakestSubjectId: "english", bestDay: "Tuesday", resourcesCompleted: 22, xpEarned: 1200, currentStreak: 28, lowConfidenceChapters: ["physics-2", "chemistry-3"] },
    { weekNumber: 23, totalSessions: 15, subjectsTouched: 4, mostActiveSubjectId: "maths", weakestSubjectId: "physical-education", bestDay: "Wednesday", resourcesCompleted: 18, xpEarned: 1000, currentStreak: 21, lowConfidenceChapters: ["maths-10"] },
    { weekNumber: 22, totalSessions: 20, subjectsTouched: 5, mostActiveSubjectId: "maths", weakestSubjectId: "english", bestDay: "Monday", resourcesCompleted: 25, xpEarned: 1400, currentStreak: 14, lowConfidenceChapters: ["chemistry-5", "physics-9"] },
    { weekNumber: 21, totalSessions: 12, subjectsTouched: 3, mostActiveSubjectId: "physics", weakestSubjectId: "computer-science", bestDay: "Thursday", resourcesCompleted: 14, xpEarned: 800, currentStreak: 7, lowConfidenceChapters: ["maths-6"] },
  ];

  // Schedule (7-day)
  const schedule: ScheduleDay[] = [
    { date: df(0), dayName: "Today", sessions: [{ subjectId: "maths", subjectName: "Maths", subjectColor: "#8B5CF6", chapterId: "maths-6", chapterName: "Integrals", isBoss: false }, { subjectId: "physics", subjectName: "Physics", subjectColor: "#3B82F6", chapterId: "physics-5", chapterName: "Electromagnetic Induction", isBoss: false }, { subjectId: "chemistry", subjectName: "Chemistry", subjectColor: "#10B981", chapterId: "chemistry-3", chapterName: "d and f Block Elements", isBoss: false }], isRestDay: false, isTestDay: false },
    { date: df(1), dayName: "Tomorrow", sessions: [{ subjectId: "maths", subjectName: "Maths", subjectColor: "#8B5CF6", chapterId: "maths-7", chapterName: "Application of the Integrals", isBoss: false }, { subjectId: "physics", subjectName: "Physics", subjectColor: "#3B82F6", chapterId: "physics-6", chapterName: "Alternating Current", isBoss: false }], isRestDay: false, isTestDay: false },
    { date: df(2), dayName: "Day 3", sessions: [], isRestDay: true, isTestDay: false },
    { date: df(3), dayName: "Day 4", sessions: [{ subjectId: "chemistry", subjectName: "Chemistry", subjectColor: "#10B981", chapterId: "chemistry-4", chapterName: "Coordination Compounds", isBoss: false }, { subjectId: "english", subjectName: "English", subjectColor: "#EAB308", chapterId: "english-1", chapterName: "Reading Comprehension (Descriptive)", isBoss: false }, { subjectId: "computer-science", subjectName: "Computer Science", subjectColor: "#06B6D4", chapterId: "computer-science-2", chapterName: "Database Management", isBoss: false }], isRestDay: false, isTestDay: false },
    { date: df(4), dayName: "Day 5", sessions: [{ subjectId: "maths", subjectName: "Maths", subjectColor: "#8B5CF6", chapterId: "maths-8", chapterName: "Differential Equations", isBoss: false }, { subjectId: "physics", subjectName: "Physics", subjectColor: "#3B82F6", chapterId: "physics-7", chapterName: "Electromagnetic Waves", isBoss: false }], isRestDay: false, isTestDay: false },
    { date: df(5), dayName: "Day 6", sessions: [], isRestDay: true, isTestDay: false },
    { date: df(6), dayName: "Day 7", sessions: [{ subjectId: "maths", subjectName: "Maths", subjectColor: "#8B5CF6", chapterId: "maths-10", chapterName: "Three-dimensional Geometry", isBoss: false }, { subjectId: "chemistry", subjectName: "Chemistry", subjectColor: "#10B981", chapterId: "chemistry-5", chapterName: "Haloalkanes and Haloarenes", isBoss: false }, { subjectId: "physical-education", subjectName: "Physical Education", subjectColor: "#F97316", chapterId: "physical-education-0", chapterName: "Management of Sporting Events", isBoss: false }], isRestDay: false, isTestDay: false },
  ];

  return {
    subjects: SUBJECTS.map((s) => ({ ...s })),
    chapters,
    sessions: sessions.sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    goals,
    revisions,
    badges,
    userStats: {
      totalXP, totalSessions: sessions.length, subjectsTouchedThisWeek: 5, weeklyXP: 1200,
      bestStudyHour: 20, favoriteSubjectId: "physics", weakestSubjectId: "english",
      sessionStartDate: ds(45), holidayDates: [ds(29), ds(15)], maxSessionsPerDay: 3,
    },
    streakData: {
      currentStreak: 28, longestStreak: 31, freezeCardsUsedThisMonth: 0,
      lastSessionDate: ds(1), history,
    },
    weeklyReports,
    tests,
    schedule,
  };
}

export default SEED_DATA;

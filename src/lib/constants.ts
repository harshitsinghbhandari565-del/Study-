/**
 * STUDYMAP — Constants
 *
 * Central source of truth for subjects, resource types, levelling curves,
 * titles, and streak rules.
 */

import type { Subject } from "./types";

// ─── Subjects ─────────────────────────────────────────────────────────────────

export const SUBJECTS: Subject[] = [
  {
    id: "physics",
    name: "Physics",
    color: "#3B82F6",
    icon: "Atom",
    level: 1,
    totalXP: 0,
  },
  {
    id: "chemistry",
    name: "Chemistry",
    color: "#10B981",
    icon: "FlaskConical",
    level: 1,
    totalXP: 0,
  },
  {
    id: "maths",
    name: "Maths",
    color: "#8B5CF6",
    icon: "Calculator",
    level: 1,
    totalXP: 0,
  },
  {
    id: "computer-science",
    name: "Computer Science",
    color: "#06B6D4",
    icon: "Cpu",
    level: 1,
    totalXP: 0,
  },
  {
    id: "physical-education",
    name: "Physical Education",
    color: "#F97316",
    icon: "Dumbbell",
    level: 1,
    totalXP: 0,
  },
  {
    id: "english",
    name: "English",
    color: "#EAB308",
    icon: "BookOpen",
    level: 1,
    totalXP: 0,
  },
];

// ─── Resource Types ───────────────────────────────────────────────────────────

/**
 * Nine study-resource categories ranked by difficulty / XP reward.
 */
export const RESOURCE_TYPES: readonly {
  id: string;
  name: string;
  xpValue: number;
  difficulty: number;
}[] = [
  { id: "school-lecture", name: "School Lecture", xpValue: 10, difficulty: 1 },
  { id: "ncert", name: "NCERT", xpValue: 10, difficulty: 1 },
  { id: "ncert-exemplar", name: "NCERT Exemplar", xpValue: 15, difficulty: 2 },
  { id: "self-studied", name: "Self Studied", xpValue: 15, difficulty: 2 },
  { id: "coaching-lecture", name: "Coaching Lecture", xpValue: 15, difficulty: 2 },
  { id: "reference-book", name: "Reference Book", xpValue: 20, difficulty: 3 },
  { id: "online-lecture", name: "Online Lecture", xpValue: 20, difficulty: 3 },
  { id: "pyqs", name: "PYQs", xpValue: 25, difficulty: 4 },
  { id: "hots", name: "HOTs", xpValue: 30, difficulty: 5 },
] as const;

// ─── Levelling Curve ──────────────────────────────────────────────────────────

export const LEVEL_THRESHOLDS: readonly number[] = [
  0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700,
  3250, 3850, 4500, 5200, 5950, 6750, 7600, 8500, 9450, 10500,
] as const;

// ─── Level Titles ─────────────────────────────────────────────────────────────

export const TITLES_BY_LEVEL: readonly {
  minLevel: number;
  maxLevel: number;
  title: string;
}[] = [
  { minLevel: 19, maxLevel: 20, title: "Legend" },
  { minLevel: 16, maxLevel: 18, title: "Master" },
  { minLevel: 12, maxLevel: 15, title: "Expert" },
  { minLevel: 8, maxLevel: 11, title: "Scholar" },
  { minLevel: 5, maxLevel: 7, title: "Apprentice" },
  { minLevel: 3, maxLevel: 4, title: "Student" },
  { minLevel: 1, maxLevel: 2, title: "Novice" },
] as const;

// ─── Streak Rules ─────────────────────────────────────────────────────────────

export const STREAK_FREEZE_MAX = 2;

// ─── XP Bonuses ───────────────────────────────────────────────────────────────

export const XP_BONUSES = {
  streak7: 50,
  streak30: 200,
  streak100: 500,
  subject50: 500,
  bossComplete: 0,
} as const;

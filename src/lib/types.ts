/**
 * STUDYMAP — Type Definitions (Debug Run 1)
 */

export interface Subject { id: string; name: string; color: string; icon: string; level: number; totalXP: number; }
export type ConfidenceLevel = 0 | 1 | 2 | 3;
export interface Resource { id: string; typeId: string; completed: boolean; completedAt: string | null; }
export interface Chapter { id: string; subjectId: string; name: string; unit?: string; notes?: string; resources: Resource[]; isBoss: boolean; confidence: ConfidenceLevel; sessionsCount: number; lastStudied: string | null; xpEarned: number; completedResources: string[]; }
export type SessionMood = "locked-in" | "okay" | "low";
export interface StudySession { id: string; subjectId: string; chapterId: string; resourceId: string; mood: SessionMood; confidence: ConfidenceLevel; xpEarned: number; timestamp: string; duration?: number; }
export interface StreakHistoryEntry { date: string; hadSession: boolean; }
export interface StreakData { currentStreak: number; longestStreak: number; freezeCardsUsedThisMonth: number; lastSessionDate: string; history: StreakHistoryEntry[]; }
export interface HeatmapDay { date: string; count: number; intensity: 0 | 1 | 2 | 3 | 4; }
export type GoalTargetType = "complete-chapters" | "complete-resources" | "complete-pyqs";
export interface Goal { id: string; subjectId: string; targetType: GoalTargetType; targetCount: number; deadline: string; description: string; progressCount: number; createdAt: string; }
export interface RevisionItem { chapterId: string; subjectId: string; revisionNumber: 1 | 2 | 3 | 4; dueDate: string; completed: boolean; }
export interface Badge { id: string; name: string; description: string; icon: string; earned: boolean; earnedAt: string | null; }
export interface TestReflection { difficulty: number; surpriseTopics: string; wouldDoDifferently: string; completedAt: string; }
export interface Test { id: string; subjectId: string; name: string; date: string; type: "board" | "mock" | "school"; notes?: string; reflection?: TestReflection; }
export interface UserStats { totalXP: number; totalSessions: number; subjectsTouchedThisWeek: number; weeklyXP: number; bestStudyHour: number; favoriteSubjectId: string; weakestSubjectId: string; sessionStartDate: string; holidayDates: string[]; maxSessionsPerDay: number; }
export interface WeeklyReport { weekNumber: number; totalSessions: number; subjectsTouched: number; mostActiveSubjectId: string; weakestSubjectId: string; bestDay: string; resourcesCompleted: number; xpEarned: number; currentStreak: number; lowConfidenceChapters: string[]; }
export interface ScheduleSession { subjectId: string; subjectName: string; subjectColor: string; chapterId: string; chapterName: string; unit?: string; isBoss: boolean; }
export interface ScheduleDay { date: string; dayName: string; sessions: ScheduleSession[]; isRestDay: boolean; isTestDay: boolean; }

export interface AppSettings {
  maxSessionsPerDay: number;
  moodLogging: boolean;
  freezeCardLimit: number;
  reminderBanners: boolean;
  backupReminderFrequency: "never" | "daily" | "weekly" | "monthly";
}

export interface UserProfile {
  userName: string;
  onboardingCompleted: boolean;
  subjectOrder: string[];
}

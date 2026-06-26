export type ResourceType = "video" | "notes" | "pyq" | "revise"

export interface ChapterResource {
  type: ResourceType
  done: boolean
  at?: string
}

export interface Chapter {
  id: string
  name: string
  isBoss?: boolean
  confidence: 0 | 1 | 2 | 3
  difficulty: "⭐"|"⭐⭐"|"⭐⭐⭐"
  resources: ChapterResource[]
  completedAt?: string
  bossSlainAt?: string
}

export interface Subject {
  id: string
  name: string
  color: string
  icon: string
  chapters: Chapter[]
  xp: number
  level: number
}

export interface SessionLog {
  id: string
  subjectId: string
  chapterId: string
  resourceType: ResourceType
  minutes: number
  mood?: "focus" | "tired" | "distracted" | "flow"
  timestamp: string
  xpEarned: number
}

export interface Goal {
  id: string
  title: string
  subjectId?: string
  targetSessions?: number
  targetDate: string
  progress: number
  done: boolean
  createdAt: string
}

export type BadgeId =
  | "boss_slayer"
  | "streak_warrior"
  | "subject_master"
  | "wall_builder"
  | "goal_crusher"
  | "early_bird"
  | "night_owl"
  | "balanced_scholar"

export interface Badge {
  id: BadgeId
  name: string
  description: string
  emoji: string
  unlockedAt?: string
}

export interface Challenge {
  id: string
  date: string
  text: string
  type: "pyq_cold" | "weak_star" | "weak_subject" | "early_log"
  target?: any
  accepted?: boolean
  skipped?: boolean
  completed?: boolean
  rewardXp: number
  rewardShield: number
}

export interface Revision {
  id: string
  subjectId: string
  chapterId: string
  stage: 1 | 2 | 3 | 4
  dueDate: string
  completedAt?: string
}

export type XpSource = "resource" | "bonus" | "challenge" | "milestone" | "revision" | "boss"

export interface XPTransaction {
  id: string
  amount: number
  source: XpSource
  label: string
  timestamp: string
}

export interface MorningPlanSlot {
  subjectId?: string
  chapterId?: string
  done?: boolean
}

export interface MorningPlan {
  date: string
  slots: MorningPlanSlot[]
}

export interface StudyState {
  subjects: Subject[]
  sessions: SessionLog[]
  goals: Goal[]
  streak: number
  lastStudyDate?: string
  streakShields: number
  totalXp: number
  badges: Badge[]
  challenges: Challenge[]
  revisions: Revision[]
  xpTransactions: XPTransaction[]
  morningPlan?: MorningPlan
  // actions
  logSession: (s: Omit<SessionLog,"id"|"timestamp"|"xpEarned">) => void
  toggleResource: (subjectId: string, chapterId: string, type: ResourceType) => void
  setConfidence: (subjectId:string, chapterId:string, level:0|1|2|3)=>void
  addGoal: (g: Omit<Goal,"id"|"createdAt"|"progress"|"done">)=>void
  toggleGoal: (id:string)=>void
  acceptChallenge: (id:string)=>void
  skipChallenge: (id:string)=>void
  completeRevision: (id:string)=>void
  saveMorningPlan: (slots: MorningPlanSlot[])=>void
  markMorningSlotDone: (index:number, done:boolean)=>void
  _checkBadges: ()=>void
  resetData: ()=>void
}

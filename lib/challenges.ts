import { Challenge, StudyState } from "./types"
import { dayKey, daysAgo } from "./utils"

function randomPick<T>(arr:T[]):T { return arr[Math.floor(Math.random()*arr.length)] }

export function generateDailyChallenge(state: StudyState): Challenge {
  const today = dayKey()
  const recentIds = new Set(
    state.sessions
      .filter(s => new Date(s.timestamp) > daysAgo(3))
      .map(s=>s.subjectId)
  )
  const coldSubjects = state.subjects.filter(s => !recentIds.has(s.id))
  const weakStarChapter = (() => {
    for (const sub of state.subjects) {
      const c = sub.chapters.find(ch => ch.difficulty==="⭐" && ch.confidence < 2)
      if (c) return {sub, c}
    }
    return null
  })()
  const weakestSubject = [...state.subjects].sort((a,b)=> a.xp - b.xp)[0]

  const pool: Omit<Challenge,"id"|"date"|"rewardXp"|"rewardShield">[] = []

  if (coldSubjects.length) {
    pool.push({
      type: "pyq_cold",
      text: `Complete 1 PYQ session in ${coldSubjects[0].name} — you haven't touched it in 3 days`,
      target: { subjectId: coldSubjects[0].id, resourceType: "pyq" }
    })
  }
  if (weakStarChapter) {
    pool.push({
      type: "weak_star",
      text: `Study ${weakStarChapter.c.name} (${weakStarChapter.sub.name}) — rated ⭐ — for 15 minutes`,
      target: { subjectId: weakStarChapter.sub.id, chapterId: weakStarChapter.c.id, minutes: 15 }
    })
  }
  if (weakestSubject) {
    pool.push({
      type: "weak_subject",
      text: `Complete 2 sessions in your weakest subject: ${weakestSubject.name}`,
      target: { subjectId: weakestSubject.id, count: 2 }
    })
  }
  pool.push({
    type: "early_log",
    text: "Log a session before 8 AM",
    target: { beforeHour: 8 }
  })

  const pick = randomPick(pool)
  return {
    id: `ch-${today}-${Math.random().toString(36).slice(2,7)}`,
    date: today,
    rewardXp: 100,
    rewardShield: 1,
    accepted: false,
    ...pick
  }
}

export function getTodaysChallenge(challenges: Challenge[]): Challenge | undefined {
  const today = dayKey()
  return challenges.find(c => c.date === today)
}

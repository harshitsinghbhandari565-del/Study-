"use client"
import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { StudyState, SessionLog, ResourceType, BadgeId, MorningPlanSlot } from "./types"
import { seedSubjects } from "./data"
import { BADGE_DEFS, checkUnlocks } from "./badges"
import { scheduleRevisions } from "./revisions"
import { xpForResource, levelFromXp, makeTx } from "./xp"
import { dayKey } from "./utils"

type Store = StudyState & {
  _bossDefeat?: { subjectName:string, chapterName:string } | null
  _badgePopup?: BadgeId | null
  _hasHydrated: boolean
  setHasHydrated: (v:boolean)=>void
  clearBossPopup: ()=>void
  clearBadgePopup: ()=>void
  resetData: ()=>void
}

const initialState = {
  subjects: seedSubjects,
  sessions: [] as SessionLog[],
  goals: [] as StudyState["goals"],
  streak: 7,
  streakShields: 0,
  lastStudyDate: dayKey(),
  totalXp: seedSubjects.reduce((a,s)=>a+s.xp,0),
  badges: BADGE_DEFS.map(b=> ({...b})),
  challenges: [] as StudyState["challenges"],
  revisions: [] as StudyState["revisions"],
  xpTransactions: [] as StudyState["xpTransactions"],
  morningPlan: undefined as StudyState["morningPlan"],
}

export const useStudyStore = create<Store>()(
  persist(
    (set, get) => ({
      ...initialState,
      _bossDefeat: null,
      _badgePopup: null,
      _hasHydrated: false,
      setHasHydrated: (v)=> set({ _hasHydrated: v }),
      clearBossPopup: ()=> set({ _bossDefeat:null }),
      clearBadgePopup: ()=> set({ _badgePopup:null }),
      resetData: ()=> {
        try { localStorage.removeItem("studymap-v4") } catch {}
        set({ ...initialState, badges: BADGE_DEFS.map(b=>({...b})), _bossDefeat:null, _badgePopup:null, _hasHydrated:true })
        if (typeof window !== "undefined") window.location.reload()
      },

      logSession: ({ subjectId, chapterId, resourceType, minutes, mood }) => {
        const safeMinutes = Math.max(1, Math.min(600, Number(minutes)||25))
        const xp = xpForResource[resourceType] + Math.floor(safeMinutes/10)
        const session: SessionLog = {
          id: Math.random().toString(36).slice(2),
          subjectId, chapterId, resourceType, minutes: safeMinutes, mood,
          timestamp: new Date().toISOString(),
          xpEarned: xp
        }
        set(state => {
          const todayKey = dayKey()
          let streak = state.streak
          let last = state.lastStudyDate
          let shields = state.streakShields
          if (last !== todayKey) {
            const yest = new Date(); yest.setDate(yest.getDate()-1)
            const yestKey = dayKey(yest)
            if (last === yestKey) streak += 1
            else if (shields > 0) { shields -= 1; streak = 1; last = todayKey }
            else streak = 1
            last = todayKey
          }
          const subjects = state.subjects.map(s=>{
            if(s.id!==subjectId) return s
            const newXp = s.xp + xp
            return { ...s, xp:newXp, level: levelFromXp(newXp) }
          })
          const tx = makeTx(xp, "resource", `${resourceType} • ${safeMinutes}m`)
          return {
            sessions: [session, ...state.sessions],
            subjects,
            totalXp: state.totalXp + xp,
            streak,
            lastStudyDate: last,
            streakShields: shields,
            xpTransactions: [tx, ...state.xpTransactions].slice(0,120)
          }
        })
        get()._checkBadges()
        const st = get()
        const chal = st.challenges.find(c=> c.date===dayKey() && c.accepted && !c.completed)
        if (chal) {
          let complete = false
          if (chal.type==="early_log") complete = new Date().getHours() < 8
          else if (chal.type==="pyq_cold") complete = resourceType==="pyq" && subjectId===chal.target?.subjectId
          else if (chal.type==="weak_star") complete = subjectId===chal.target?.subjectId && chapterId===chal.target?.chapterId && safeMinutes>=15
          else if (chal.type==="weak_subject") {
            const todaySessions = st.sessions.filter(s=> s.subjectId===chal.target?.subjectId && s.timestamp.slice(0,10)===dayKey())
            complete = todaySessions.length +1 >= (chal.target?.count||2)
          }
          if (complete) {
            set(s=>({
              challenges: s.challenges.map(c=> c.id===chal.id ? {...c, completed:true}:c),
              totalXp: s.totalXp + chal.rewardXp,
              streakShields: s.streakShields + chal.rewardShield,
              xpTransactions: [makeTx(chal.rewardXp,"challenge","Daily Grind completed"), ...s.xpTransactions]
            }))
          }
        }
        const plan = get().morningPlan
        if (plan?.date === dayKey()) {
          plan.slots.forEach((slot, idx)=>{
            if (slot.subjectId === subjectId && slot.chapterId === chapterId && !slot.done) {
              get().markMorningSlotDone(idx, true)
            }
          })
        }
      },

      toggleResource: (subjectId, chapterId, type) => {
        let outBoss: {subjectName:string, chapterName:string} | null = null
        set(state => {
          let bossDefeatInfo: {subjectName:string, chapterName:string} | null = null
          const subjects = state.subjects.map(sub => {
            if (sub.id !== subjectId) return sub
            const chapters = sub.chapters.map(ch => {
              if (ch.id !== chapterId) return ch
              const resources = ch.resources.map(r => r.type===type ? { ...r, done: !r.done, at: !r.done ? new Date().toISOString() : undefined } : r)
              const allDone = resources.every(r=>r.done)
              let completedAt = ch.completedAt
              let bossSlainAt = ch.bossSlainAt
              if (allDone && !ch.completedAt) completedAt = new Date().toISOString()
              const wasBossEligible = !!ch.isBoss && allDone && ch.confidence >=2 && !ch.bossSlainAt
              if (wasBossEligible) {
                bossSlainAt = new Date().toISOString()
                bossDefeatInfo = { subjectName: sub.name, chapterName: ch.name }
              }
              return { ...ch, resources, completedAt, bossSlainAt }
            })
            return { ...sub, chapters }
          })

          let extras: Partial<Store> = {}
          if (bossDefeatInfo !== null) {
            outBoss = bossDefeatInfo
            const bd = bossDefeatInfo as {subjectName:string, chapterName:string}
            const base = xpForResource[type] || 15
            const bonus = base * 3
            extras._bossDefeat = bd
            extras.totalXp = state.totalXp + bonus
            extras.xpTransactions = [makeTx(bonus,"boss",`Boss slain: ${bd.chapterName}`), ...state.xpTransactions]
            const badges = state.badges.map(b=> b.id==="boss_slayer" && !b.unlockedAt ? {...b, unlockedAt:new Date().toISOString()} : b)
            extras.badges = badges
            extras._badgePopup = "boss_slayer"
            const sub = subjects.find(s=>s.id===subjectId)!
            const ch = sub.chapters.find(c=>c.id===chapterId)!
            if (ch.completedAt) {
              const revs = scheduleRevisions(subjectId, chapterId, new Date(ch.completedAt))
              extras.revisions = [...state.revisions, ...revs]
            }
          } else {
            const sOld = state.subjects.find(s=>s.id===subjectId)!
            const cOld = sOld.chapters.find(c=>c.id===chapterId)!
            const sNew = subjects.find(s=>s.id===subjectId)!
            const cNew = sNew.chapters.find(c=>c.id===chapterId)!
            const justCompleted = !cOld.completedAt && !!cNew.completedAt
            if (justCompleted) {
              const revs = scheduleRevisions(subjectId, chapterId, new Date(cNew.completedAt!))
              extras.revisions = [...state.revisions, ...revs]
            }
          }

          const toggledRes = subjects.find(s=>s.id===subjectId)!.chapters.find(c=>c.id===chapterId)!.resources.find(r=>r.type===type)!
          const gaveXp = toggledRes.done
          const txXp = gaveXp ? xpForResource[type] : 0
          if (gaveXp && bossDefeatInfo === null) {
            extras.totalXp = (extras.totalXp ?? state.totalXp) + txXp
            extras.xpTransactions = [makeTx(txXp,"resource",`${type} completed`), ...(extras.xpTransactions ?? state.xpTransactions)]
            const subjIdx = subjects.findIndex(s=>s.id===subjectId)
            if (subjIdx>=0) {
              const subj = subjects[subjIdx]
              subjects[subjIdx] = { ...subj, xp: subj.xp + txXp, level: levelFromXp(subj.xp + txXp) }
            }
          }
          return { subjects, ...extras }
        })
        get()._checkBadges()
      },

      setConfidence: (subjectId, chapterId, level) => {
        set(s=> ({
          subjects: s.subjects.map(sub=> sub.id!==subjectId ? sub : {
            ...sub,
            chapters: sub.chapters.map(ch=> ch.id!==chapterId ? ch : { ...ch, confidence: level })
          })
        }))
      },

      addGoal: (g) => set(s=> ({
        goals: [{ id: Math.random().toString(36).slice(2), progress:0, done:false, createdAt:new Date().toISOString(), ...g }, ...s.goals]
      })),
      toggleGoal: (id)=> set(s=>{
        const goals = s.goals.map(goal=> goal.id===id ? { ...goal, done: !goal.done } : goal)
        const justDone = goals.find(go=>go.id===id)?.done && !s.goals.find(go=>go.id===id)?.done
        let extras:any = { goals }
        if (justDone) {
          extras.xpTransactions = [makeTx(50,"milestone","Goal completed"), ...s.xpTransactions]
          extras.totalXp = s.totalXp + 50
        }
        return extras
      }),

      acceptChallenge: (id)=> set(s=> ({ challenges: s.challenges.map(c=> c.id===id ? {...c, accepted:true}:c)})),
      skipChallenge: (id)=> set(s=> ({ challenges: s.challenges.map(c=> c.id===id ? {...c, skipped:true}:c)})),

      completeRevision: (id)=> set(s=>{
        const revisions = s.revisions.map(r=> r.id===id ? {...r, completedAt:new Date().toISOString() } : r)
        return {
          revisions,
          totalXp: s.totalXp + 10,
          xpTransactions: [makeTx(10,"revision","Revision completed"), ...s.xpTransactions]
        }
      }),

      saveMorningPlan: (slots)=> set({ morningPlan: { date: dayKey(), slots } }),
      markMorningSlotDone: (index, done)=> set(s=>{
        if(!s.morningPlan) return {}
        const slots = [...s.morningPlan.slots]
        slots[index] = { ...slots[index], done }
        return { morningPlan: { ...s.morningPlan, slots } }
      }),

      _checkBadges: () => {
        const state = get()
        const unlocks = checkUnlocks(state)
        if (unlocks.length) {
          set(s=> ({
            badges: s.badges.map(b=> unlocks.includes(b.id) ? {...b, unlockedAt: b.unlockedAt || new Date().toISOString()} : b),
            _badgePopup: unlocks[0]
          }))
        }
      }
    }),
    {
      name: "studymap-v4",
      storage: createJSONStorage(()=> localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated?.(true)
      },
      partialize: (s)=> ({
        subjects: s.subjects,
        sessions: s.sessions,
        goals: s.goals,
        streak: s.streak,
        streakShields: s.streakShields,
        lastStudyDate: s.lastStudyDate,
        totalXp: s.totalXp,
        badges: s.badges,
        challenges: s.challenges,
        revisions: s.revisions,
        xpTransactions: s.xpTransactions,
        morningPlan: s.morningPlan,
      })
    }
  )
)

export const useHasHydrated = () => useStudyStore(s=>s._hasHydrated)

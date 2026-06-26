import { Revision } from "./types"

export const REVISION_INTERVALS = [3,7,21,45]

export function scheduleRevisions(subjectId: string, chapterId: string, completedAt: Date = new Date()): Revision[] {
  return REVISION_INTERVALS.map((days, idx) => {
    const due = new Date(completedAt)
    due.setDate(due.getDate() + days)
    return {
      id: `${subjectId}-${chapterId}-rev-${idx+1}-${due.getTime()}`,
      subjectId, chapterId,
      stage: (idx+1) as 1|2|3|4,
      dueDate: due.toISOString(),
    }
  })
}

export function isDueToday(rev: Revision) {
  const today = new Date().toISOString().slice(0,10)
  return rev.dueDate.slice(0,10) <= today && !rev.completedAt
}

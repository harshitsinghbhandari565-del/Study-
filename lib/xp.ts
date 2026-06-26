import { XPTransaction, XpSource } from "./types"

export const xpForResource: Record<string, number> = {
  video: 15,
  notes: 10,
  pyq: 25,
  revise: 20,
}

export function levelFromXp(xp:number) {
  return Math.floor(Math.sqrt(xp/50)) + 1
}

export function xpToNextLevel(level:number) {
  const nextXp = Math.pow(level,2)*50
  const curXp = Math.pow(Math.max(level-1,0),2)*50
  return nextXp - curXp
}

export function makeTx(amount:number, source:XpSource, label:string): XPTransaction {
  return { id: Math.random().toString(36).slice(2), amount, source, label, timestamp: new Date().toISOString() }
}

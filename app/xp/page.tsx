"use client"
import { useStudyStore, useHasHydrated } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { levelFromXp } from "@/lib/xp"
import { Progress } from "@/components/ui/progress"
import EmptyState from "@/components/empty-state"
import { PageSkeleton } from "@/components/loading-skeleton"

export default function XpPage() {
  const hydrated = useHasHydrated()
  const totalXp = useStudyStore(s=>s.totalXp)
  const tx = useStudyStore(s=>s.xpTransactions)
  const level = levelFromXp(totalXp)
  if(!hydrated) return <PageSkeleton/>

  const breakdown = tx.reduce((acc:any,t)=>{
    acc[t.source] = (acc[t.source]||0) + t.amount
    return acc
  },{})

  const sources = [
    {k:"resource", label:"Resources", color:"text-purple-300"},
    {k:"boss", label:"Boss Bonus", color:"text-red-400"},
    {k:"challenge", label:"Challenges", color:"text-amber-300"},
    {k:"revision", label:"Revisions", color:"text-sky-300"},
    {k:"milestone", label:"Milestones", color:"text-emerald-300"},
    {k:"bonus", label:"Bonus", color:"text-pink-300"},
  ]

  const nextLevelXp = Math.pow(level,2)*50
  const curLevelXp = Math.pow(Math.max(level-1,0),2)*50
  const prog = ((totalXp - curLevelXp) / Math.max(1, nextLevelXp - curLevelXp))*100

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">XP Economy</h1>
      <Card>
        <CardHeader>
          <CardTitle>Level {level} • {totalXp.toLocaleString()} XP total</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={prog} />
          <div className="text-xs text-zinc-400 mt-2">{totalXp-curLevelXp} / {nextLevelXp-curLevelXp} to Level {level+1}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Breakdown by Source</CardTitle></CardHeader>
        <CardContent className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {sources.map(s=>{
            const v = breakdown[s.k] || 0
            return (
              <div key={s.k} className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
                <div className={`text-sm ${s.color}`}>{s.label}</div>
                <div className="text-xl font-bold">{v.toLocaleString()} XP</div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Recent Transactions</CardTitle></CardHeader>
        <CardContent className="space-y-2 max-h-[520px] overflow-auto">
          {tx.map(t=>(
            <div key={t.id} className="flex justify-between gap-3 text-sm border-b border-zinc-900 py-2">
              <div className="min-w-0">
                <div className="text-zinc-200 truncate">{t.label}</div>
                <div className="text-[11px] text-zinc-500">{t.source} • {new Date(t.timestamp).toLocaleString()}</div>
              </div>
              <div className="text-emerald-400 font-mono shrink-0">+{t.amount}</div>
            </div>
          ))}
          {!tx.length && <EmptyState emoji="⚡" title="No transactions yet" description="Earn XP by completing resources, slaying bosses, and doing revisions." />}
        </CardContent>
      </Card>
    </div>
  )
}
  

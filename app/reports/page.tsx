"use client"
import { useStudyStore, useHasHydrated } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatMinutes } from "@/lib/utils"
import EmptyState from "@/components/empty-state"
import { PageSkeleton } from "@/components/loading-skeleton"

export default function ReportsPage() {
  const hydrated = useHasHydrated()
  const sessions = useStudyStore(s=>s.sessions)
  const subjects = useStudyStore(s=>s.subjects)
  if(!hydrated) return <PageSkeleton/>
  const last7 = sessions.filter(s=> new Date(s.timestamp) > new Date(Date.now()-7*86400000))
  const minutes = last7.reduce((a,c)=>a+c.minutes,0)
  const bySub: Record<string, number> = {}
  last7.forEach(s=> bySub[s.subjectId] = (bySub[s.subjectId]||0)+s.minutes)
  const moodCount: Record<string,number> = {}
  last7.forEach(s=> { if(s.mood) moodCount[s.mood] = (moodCount[s.mood]||0)+1 })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Weekly Report</h1>
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Study Time</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMinutes(minutes)}</div>
            <div className="text-zinc-400 text-sm">{last7.length} sessions</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Avg / day</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMinutes(Math.round(minutes/7))}</div>
            <div className="text-zinc-400 text-sm">7-day window</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Mood</CardTitle></CardHeader>
          <CardContent className="text-sm">
            {Object.entries(moodCount).length ? Object.entries(moodCount).map(([m,c])=><div key={m} className="flex justify-between"><span>{m}</span><span>{c}</span></div>) : <span className="text-zinc-500">—</span>}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">By Subject — Last 7 Days</CardTitle></CardHeader>
        <CardContent>
          {Object.keys(bySub).length ? (
            <div className="space-y-2">
              {Object.entries(bySub).map(([k,v])=>{
                const name = subjects.find(s=>s.id===k)?.name || k
                return (
                  <div key={k} className="flex justify-between border-b border-zinc-900 pb-2 text-sm">
                    <span>{name}</span><span>{formatMinutes(v)}</span>
                  </div>
                )
              })}
            </div>
          ) : <EmptyState emoji="📊" title="No sessions this week" description="Log your first session from the Dashboard + Log button." ctaHref="/" ctaLabel="Dashboard" />}
        </CardContent>
      </Card>
    </div>
  )
                  }

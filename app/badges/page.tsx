"use client"
import { BADGE_DEFS } from "@/lib/badges"
import { useStudyStore, useHasHydrated } from "@/lib/store"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import EmptyState from "@/components/empty-state"
import { PageSkeleton } from "@/components/loading-skeleton"

export default function BadgesPage() {
  const hydrated = useHasHydrated()
  const badges = useStudyStore(s=>s.badges)
  const unlockedMap = new Map(badges.filter(b=>b.unlockedAt).map(b=>[b.id, b.unlockedAt]))
  if(!hydrated) return <PageSkeleton/>
  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-bold">Badges</h1>
        <div className="text-sm text-zinc-400">{unlockedMap.size} / {BADGE_DEFS.length} unlocked</div>
      </div>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {BADGE_DEFS.map(def=>{
          const unlockedAt = unlockedMap.get(def.id)
          return (
            <Card key={def.id} className={cn(
              "transition",
              unlockedAt ? "border-emerald-700/40 bg-emerald-950/10" : "opacity-55 grayscale"
            )}>
              <CardContent className="p-5">
                <div className="text-3xl mb-2">{def.emoji}</div>
                <div className="font-semibold">{def.name}</div>
                <div className="text-sm text-zinc-400">{def.description}</div>
                {unlockedAt ? (
                  <div className="text-[11px] text-emerald-400 mt-2">Unlocked {new Date(unlockedAt).toLocaleDateString()}</div>
                ) : (
                  <div className="text-[11px] text-zinc-500 mt-2">Locked</div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
      {unlockedMap.size===0 && <EmptyState emoji="🏅" title="No badges yet" description="Slay a boss chapter, complete a goal, or hit a 30-day streak to unlock your first badge." />}
    </div>
  )
    }
    

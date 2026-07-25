"use client";

import { useState, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import { useStudyContext } from "@/contexts/study-context";
import { ReminderBanner } from "@/components/ui/reminder-banner";
import { SUBJECTS } from "@/lib/constants";
import { calculatePaceStatus } from "@/lib/utils";
import { differenceInDays, parseISO } from "date-fns";

interface ReminderItem { type: "streak" | "revision" | "test" | "pace"; title: string; message: string; conditionId: string; }

export function Reminders() {
  const { sessions, currentStreak, revisionsDueToday, nearestTest, chapters, tests, userStats, settings } = useStudyContext();
  const [activeIndex, setActiveIndex] = useState(0);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  // Respect settings
  if (!settings.reminderBanners) return null;

  const today = new Date().toISOString().split("T")[0];

  const activeReminders = useMemo(() => {
    const reminders: ReminderItem[] = [];
    if (currentStreak > 0 && !sessions.some((s) => s.timestamp.startsWith(today))) {
      reminders.push({ type: "streak", title: "Streak in danger", message: `You haven't logged a session today. 🔥 ${currentStreak} days on the line.`, conditionId: `streak-${today}` });
    }
    if (revisionsDueToday.length > 0) {
      reminders.push({ type: "revision", title: "Revisions waiting", message: `${revisionsDueToday.length} chapter(s) need review today.`, conditionId: `revision-count-${revisionsDueToday.length}` });
    }
    if (nearestTest) {
      const daysLeft = differenceInDays(parseISO(nearestTest.date), new Date());
      if (daysLeft >= 0 && daysLeft <= 7) {
        reminders.push({ type: "test", title: `${nearestTest.name} soon`, message: `Only ${daysLeft} day${daysLeft !== 1 ? "s" : ""} left. Final stretch.`, conditionId: `test-${nearestTest.subjectId}-${nearestTest.date}` });
      }
    }
    for (const subject of SUBJECTS) {
      const pace = calculatePaceStatus(subject.id, chapters, tests, userStats.sessionStartDate);
      if (pace.status === "critical") {
        reminders.push({ type: "pace", title: `${subject.name} behind`, message: `Your pace is critical. ${pace.requiredChaptersPerWeek.toFixed(1)} chapters/week needed.`, conditionId: `pace-${subject.id}` });
        break;
      }
    }
    return reminders;
  }, [sessions, currentStreak, revisionsDueToday, nearestTest, chapters, tests, userStats.sessionStartDate, today]);

  const visibleReminders = useMemo(() => activeReminders.filter((r) => !dismissedIds.includes(r.conditionId)), [activeReminders, dismissedIds]);
  if (visibleReminders.length === 0) return null;

  const safeIndex = activeIndex < visibleReminders.length ? activeIndex : 0;
  const current = visibleReminders[safeIndex];

  return (
    <div className="mb-1">
      <AnimatePresence mode="wait">
        <ReminderBanner key={current.conditionId} type={current.type} title={current.title} message={current.message} index={safeIndex + 1} total={visibleReminders.length}
          onNext={() => setActiveIndex((p) => (p + 1) % visibleReminders.length)}
          onDismiss={() => { setDismissedIds((p) => [...p, current.conditionId]); if (safeIndex >= visibleReminders.length - 1) setActiveIndex(0); }}
        />
      </AnimatePresence>
    </div>
  );
}
export default Reminders;

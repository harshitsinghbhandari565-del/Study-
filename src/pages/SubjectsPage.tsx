"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Atom, FlaskConical, Calculator, Cpu, Dumbbell, BookOpen, ChevronRight, CheckCircle2, ArrowLeft } from "lucide-react";

import { useStudyContext } from "@/contexts/study-context";
import { ProgressBar } from "@/components/ui/progress-bar";
import { SubjectPressure } from "@/components/dashboard/subject-pressure";
import { ChapterSearch } from "@/components/subjects/chapter-search";
import { SUBJECTS } from "@/lib/constants";
import { calculateLevel } from "@/lib/utils";

const ICON_MAP: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: number | string }>> = { Atom, FlaskConical, Calculator, Cpu, Dumbbell, BookOpen };
function getSubjectIcon(n: string) { return ICON_MAP[n] || BookOpen; }

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: "easeOut" as const } } };

interface SubjectsPageProps {
  onSelectSubject: (subjectId: string) => void;
  onBack: () => void;
}

export function SubjectsPage({ onSelectSubject, onBack }: SubjectsPageProps) {
  const { chapters, subjectsWithProgress, tests } = useStudyContext();

  const subjectCards = useMemo(() => {
    return SUBJECTS.map((subject) => {
      const subjectProgress = subjectsWithProgress.find((sp) => sp.id === subject.id);
      const subjectChapters = chapters.filter((ch) => ch.subjectId === subject.id);
      const totalXP = subjectChapters.reduce((sum, ch) => sum + ch.xpEarned, 0);
      const totalResources = subjectChapters.reduce((sum, ch) => sum + ch.resources.length, 0);
      const completedResources = subjectChapters.reduce((sum, ch) => sum + ch.resources.filter((r) => r.completed).length, 0);
      const progress = totalResources > 0 ? Math.round((completedResources / totalResources) * 100) : 0;
      const level = subjectProgress?.level || calculateLevel(totalXP).level;
      return {
        subject, totalXP, progress, level,
        chapterCount: subjectChapters.length,
        completedChapters: subjectChapters.filter((ch) => ch.resources.every((r) => r.completed)).length,
      };
    });
  }, [chapters, subjectsWithProgress]);

  const handleSearchSelect = (_chapterId: string, subjectId: string) => {
    // Navigate to the subject detail page — chapter will be visible there
    // TODO: scroll to chapter on detail page if needed
    onSelectSubject(subjectId);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <header className="mb-6">
          <motion.button initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} onClick={onBack} className="flex items-center gap-1 transition-colors mb-4 -ml-1 min-h-[44px]" style={{ color: "var(--text-muted)" }}>
            <ArrowLeft size={20} /><span className="text-sm font-medium">Back</span>
          </motion.button>
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Subjects</h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-faint)" }}>Track your progress across all subjects</p>
          </motion.div>
        </header>

        {/* Search & Filter */}
        <ChapterSearch chapters={chapters} subjects={SUBJECTS} onSelectChapter={handleSearchSelect} />

        {/* Subject Cards */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
          {subjectCards.map(({ subject, totalXP, progress, level, chapterCount, completedChapters }) => {
            const IconComponent = getSubjectIcon(subject.icon);
            const isHighProgress = progress >= 50;
            const isCompleted = progress >= 100;

            return (
              <motion.button
                key={subject.id}
                variants={itemVariants}
                onClick={() => onSelectSubject(subject.id)}
                whileTap={{ scale: 0.98 }}
                className="w-full text-left p-4 rounded-xl border transition-all duration-200 min-h-[100px]"
                style={{
                  backgroundColor: "var(--bg-card)",
                  borderColor: isCompleted ? "rgba(251,191,36,0.4)" : isHighProgress ? "rgba(251,191,36,0.2)" : "var(--border-color)",
                  boxShadow: isHighProgress ? `0 0 20px ${subject.color}10` : undefined,
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-14 h-14 rounded-xl shrink-0" style={{ backgroundColor: `${subject.color}15` }}>
                    <IconComponent size={28} style={{ color: subject.color }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-lg truncate" style={{ color: "var(--text-primary)" }}>{subject.name}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md shrink-0" style={{ backgroundColor: `${subject.color}20`, color: subject.color }}>Lv.{level}</span>
                      {isCompleted && <CheckCircle2 size={18} className="text-amber-400 shrink-0" />}
                      <SubjectPressure subjectId={subject.id} tests={tests} subjectColor={subject.color} />
                    </div>

                    <div className="mb-2"><ProgressBar progress={progress} color={subject.color} height={8} showLabel={false} animate={true} /></div>

                    <div className="flex items-center gap-3 text-xs" style={{ color: "var(--text-faint)" }}>
                      <span>{completedChapters}/{chapterCount} chapters</span>
                      <span>·</span>
                      <span className="font-medium" style={{ color: "var(--text-muted)" }}>{totalXP.toLocaleString()} XP</span>
                    </div>
                  </div>

                  <div className="shrink-0"><ChevronRight size={24} style={{ color: "var(--text-faint)" }} /></div>
                </div>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Summary Footer */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-6 p-4 rounded-xl border text-center" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Total:{" "}
            <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{subjectCards.reduce((sum, s) => sum + s.totalXP, 0).toLocaleString()} XP</span>
            {" "}across{" "}
            <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{chapters.length} chapters</span>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default SubjectsPage;

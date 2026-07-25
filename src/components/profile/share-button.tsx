"use client";

import { useState, useCallback, useEffect } from "react";
import { Share2, Check } from "lucide-react";

interface ShareStats {
  level: number; totalXP: number; totalHours: number; currentStreak: number; longestStreak: number;
  totalSessions: number; completedChapters: number; bossSlain: number; badgesEarned: number;
  subjectProgress: Array<{ name: string; percent: number }>;
}

interface ShareButtonProps { stats: ShareStats; }

export function ShareButton({ stats }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => { if (copied) { const t = setTimeout(() => setCopied(false), 2000); return () => clearTimeout(t); } }, [copied]);

  const handleCopy = useCallback(() => {
    const topSubjects = stats.subjectProgress.filter((s) => s.percent > 0).slice(0, 3).map((s) => `${s.name} ${Math.round(s.percent)}%`).join(" · ");
    const text = `Level ${stats.level} · ${Math.round(stats.totalHours)} hours studied · 🔥 ${stats.currentStreak}-day streak${topSubjects ? ` · ${topSubjects}` : ""} · Built with STUDYMAP`;

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => setCopied(true)).catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  }, [stats]);

  function fallbackCopy(text: string) {
    const ta = document.createElement("textarea");
    ta.value = text; ta.style.position = "fixed"; ta.style.left = "-9999px";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); setCopied(true); } catch {}
    document.body.removeChild(ta);
  }

  return (
    <button onClick={handleCopy} className="flex items-center justify-center gap-2 w-full h-12 rounded-xl font-medium text-sm transition-colors border"
      style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", color: copied ? "#34d399" : "var(--text-primary)" }}>
      {copied ? <><Check size={18} className="text-emerald-400" />Copied!</> : <><Share2 size={18} />Copy Stats</>}
    </button>
  );
}
export default ShareButton;

"use client";

import { motion } from "framer-motion";
import { Flame, Repeat, Calendar, Gauge, X } from "lucide-react";

interface ReminderBannerProps {
  type: "streak" | "revision" | "test" | "pace";
  title: string;
  message: string;
  index: number;
  total: number;
  onNext: () => void;
  onDismiss: () => void;
}

const typeConfig = {
  streak: { icon: Flame, color: "#fbbf24", border: "border-l-amber-400" },
  revision: { icon: Repeat, color: "#60a5fa", border: "border-l-blue-400" },
  test: { icon: Calendar, color: "#f87171", border: "border-l-red-400" },
  pace: { icon: Gauge, color: "#fb923c", border: "border-l-orange-400" },
};

export function ReminderBanner({ type, title, message, index, total, onNext, onDismiss }: ReminderBannerProps) {
  const cfg = typeConfig[type];
  const Icon = cfg.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onNext}
      className={`rounded-xl p-3 flex items-start gap-3 relative cursor-pointer border border-l-4 ${cfg.border}`}
      style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}
    >
      {/* Icon */}
      <div className="shrink-0 mt-0.5">
        <Icon size={18} style={{ color: cfg.color }} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-12">
        <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{title}</p>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{message}</p>
      </div>

      {/* Counter pill */}
      <div className="absolute top-2 right-9 rounded-full px-1.5 py-0.5 border" style={{ backgroundColor: "var(--bg-card-hover)", borderColor: "var(--border-color)" }}>
        <span className="text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>{index}/{total}</span>
      </div>

      {/* Dismiss X */}
      <button
        onClick={(e) => { e.stopPropagation(); onDismiss(); }}
        className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full transition-colors"
        style={{ color: "var(--text-muted)" }}
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}

export default ReminderBanner;

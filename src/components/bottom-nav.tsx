"use client";

import { motion } from "framer-motion";
import { Home, BookOpen, BarChart3, CalendarDays, Calendar, User } from "lucide-react";

const TABS = [
  { id: "dashboard", label: "Home", icon: Home },
  { id: "subjects", label: "Subjects", icon: BookOpen },
  { id: "analytics", label: "Stats", icon: BarChart3 },
  { id: "planner", label: "Planner", icon: CalendarDays },
  { id: "tests", label: "Tests", icon: Calendar },
  { id: "profile", label: "Profile", icon: User },
] as const;

export type TabId = (typeof TABS)[number]["id"];
interface BottomNavProps { activeTab: string; onTabChange: (tab: string) => void; }

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-md border-t" style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-color)", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
      <div className="max-w-lg mx-auto flex items-center justify-around h-16">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id || (tab.id === "subjects" && activeTab === "subject-detail") || (tab.id === "profile" && activeTab === "settings");
          return (
            <motion.button key={tab.id} onClick={() => onTabChange(tab.id)} whileTap={{ scale: 0.9 }}
              className="relative flex flex-col items-center justify-center gap-0.5 min-w-[48px] min-h-[48px] rounded-xl transition-colors"
              style={{ color: isActive ? "var(--text-primary)" : "var(--text-faint)" }}>
              {isActive && <motion.div layoutId="nav-pill" className="absolute inset-0.5 rounded-xl" style={{ backgroundColor: "var(--bg-card-hover)" }} transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
              <Icon size={20} className="relative z-10" />
              <span className="relative z-10 text-[9px] font-medium leading-none">{tab.label}</span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
export default BottomNav;

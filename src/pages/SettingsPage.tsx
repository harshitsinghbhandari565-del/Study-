"use client";

import { ArrowLeft, Moon, Gauge, Heart, Snowflake, Bell, Database, Settings as SettingsIcon } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { useStudyContext } from "@/contexts/study-context";
import { SettingToggle } from "@/components/ui/setting-toggle";
import { SettingSelect } from "@/components/ui/setting-select";

interface SettingsPageProps { onBack: () => void; }

export function SettingsPage({ onBack }: SettingsPageProps) {
  const { theme, toggleTheme } = useTheme();
  const { settings, updateSetting } = useStudyContext();

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)", color: "var(--text-primary)" }}>
      <div className="max-w-md mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <header className="flex items-center gap-3 mb-6">
          <button onClick={onBack} className="p-1 min-h-[44px] min-w-[44px] flex items-center justify-center" style={{ color: "var(--text-muted)" }}><ArrowLeft size={20} /></button>
          <div className="flex items-center gap-2"><SettingsIcon size={18} style={{ color: "var(--text-muted)" }} /><h1 className="text-xl font-bold">Settings</h1></div>
        </header>

        {/* Appearance */}
        <h2 className="text-xs font-bold uppercase tracking-wider mt-6 mb-2" style={{ color: "var(--text-muted)" }}>Appearance</h2>
        <SettingToggle icon={Moon} label="Dark mode" description="Use dark theme across the app" value={theme === "dark"} onChange={() => toggleTheme()} />

        {/* Study Preferences */}
        <h2 className="text-xs font-bold uppercase tracking-wider mt-6 mb-2" style={{ color: "var(--text-muted)" }}>Study Preferences</h2>
        <SettingSelect icon={Gauge} label="Daily session target" description="Max sessions in auto-generated schedule" value={settings.maxSessionsPerDay.toString()} options={[{ label: "2", value: "2" }, { label: "3", value: "3" }, { label: "4", value: "4" }, { label: "5", value: "5" }]} onChange={(v) => updateSetting("maxSessionsPerDay", parseInt(v))} />
        <SettingToggle icon={Heart} label="Log mood" description="Track how you felt during each session" value={settings.moodLogging} onChange={(v) => updateSetting("moodLogging", v)} />
        <SettingSelect icon={Snowflake} label="Freeze card limit" description="Max freeze cards per month" value={settings.freezeCardLimit.toString()} options={[{ label: "1", value: "1" }, { label: "2", value: "2" }, { label: "3", value: "3" }, { label: "4", value: "4" }, { label: "5", value: "5" }]} onChange={(v) => updateSetting("freezeCardLimit", parseInt(v))} />

        {/* Notifications */}
        <h2 className="text-xs font-bold uppercase tracking-wider mt-6 mb-2" style={{ color: "var(--text-muted)" }}>Notifications</h2>
        <SettingToggle icon={Bell} label="Reminder banners" description="Show alerts for streaks, revisions, and upcoming tests" value={settings.reminderBanners} onChange={(v) => updateSetting("reminderBanners", v)} />

        {/* Data */}
        <h2 className="text-xs font-bold uppercase tracking-wider mt-6 mb-2" style={{ color: "var(--text-muted)" }}>Data</h2>
        <SettingSelect icon={Database} label="Backup reminder" description="How often to remind you to export data" value={settings.backupReminderFrequency} options={[{ label: "Never", value: "never" }, { label: "Daily", value: "daily" }, { label: "Weekly", value: "weekly" }, { label: "Monthly", value: "monthly" }]} onChange={(v) => updateSetting("backupReminderFrequency", v as "never" | "daily" | "weekly" | "monthly")} />

        <p className="text-center mt-8" style={{ color: "var(--text-faint)", fontSize: "12px" }}>STUDYMAP v1.0</p>
      </div>
    </div>
  );
}
export default SettingsPage;

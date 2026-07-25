"use client";

import { motion } from "framer-motion";
import type { ComponentType, SVGProps } from "react";

interface SettingToggleProps {
  label: string;
  description?: string;
  value: boolean;
  onChange: (v: boolean) => void;
  icon?: ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>;
}

export function SettingToggle({ label, description, value, onChange, icon: Icon }: SettingToggleProps) {
  return (
    <button onClick={() => onChange(!value)} className="w-full flex items-center justify-between py-3 text-left" style={{ borderBottomWidth: 1, borderBottomColor: "var(--border-color)" }}>
      <div className="flex items-center gap-3">
        {Icon && <Icon size={20} style={{ color: "var(--text-muted)" }} />}
        <div>
          <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{label}</p>
          {description && <p className="text-xs" style={{ color: "var(--text-muted)" }}>{description}</p>}
        </div>
      </div>
      <div className={`w-11 h-6 rounded-full relative transition-colors ${value ? "bg-emerald-500" : ""}`} style={value ? {} : { backgroundColor: "var(--bg-tertiary)" }}>
        <motion.div layout className="w-5 h-5 rounded-full bg-white absolute top-0.5" animate={{ x: value ? 20 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} />
      </div>
    </button>
  );
}
export default SettingToggle;

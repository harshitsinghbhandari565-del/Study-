"use client";

import { ChevronDown } from "lucide-react";
import type { ComponentType, SVGProps } from "react";

interface SettingSelectProps {
  label: string;
  description?: string;
  value: string;
  options: Array<{ label: string; value: string }>;
  onChange: (v: string) => void;
  icon?: ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>;
}

export function SettingSelect({ label, description, value, options, onChange, icon: Icon }: SettingSelectProps) {
  return (
    <div className="flex items-center justify-between py-3" style={{ borderBottomWidth: 1, borderBottomColor: "var(--border-color)" }}>
      <div className="flex items-center gap-3">
        {Icon && <Icon size={20} style={{ color: "var(--text-muted)" }} />}
        <div>
          <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{label}</p>
          {description && <p className="text-xs" style={{ color: "var(--text-muted)" }}>{description}</p>}
        </div>
      </div>
      <div className="relative">
        <select value={value} onChange={(e) => onChange(e.target.value)} className="appearance-none rounded-lg text-sm px-3 py-2 h-9 min-w-[110px] pr-8 focus:outline-none" style={{ backgroundColor: "var(--bg-card)", borderWidth: 1, borderColor: "var(--border-color)", color: "var(--text-primary)" }}>
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-muted)" }} />
      </div>
    </div>
  );
}
export default SettingSelect;

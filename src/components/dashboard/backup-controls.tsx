"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Upload, AlertTriangle } from "lucide-react";
import { formatStudyDate } from "@/lib/utils";

interface BackupControlsProps {
  lastBackupAt: string | null;
  onExport: () => void;
  onImport: (content: string) => boolean;
}

export function BackupControls({ lastBackupAt, onExport, onImport }: BackupControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importResult, setImportResult] = useState<"success" | "error" | null>(null);

  // Auto-dismiss import result after 3 seconds
  useEffect(() => {
    if (importResult) {
      const t = setTimeout(() => setImportResult(null), 3000);
      return () => clearTimeout(t);
    }
  }, [importResult]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      if (content) {
        const success = onImport(content);
        setImportResult(success ? "success" : "error");
      }
    };
    reader.onerror = () => setImportResult("error");
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [onImport]);

  return (
    <div className="flex flex-col items-end gap-1">
      {/* Buttons row */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onExport}
          title="Backup data"
          className="w-8 h-8 flex items-center justify-center rounded-lg border transition-colors"
          style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", color: "var(--text-muted)" }}
        >
          <Download size={15} />
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          title="Restore data"
          className="w-8 h-8 flex items-center justify-center rounded-lg border transition-colors"
          style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)", color: "var(--text-muted)" }}
        >
          <Upload size={15} />
        </button>
        <input
          type="file"
          accept="application/json,.json"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
      </div>

      {/* Status text */}
      {lastBackupAt ? (
        <span className="text-[10px]" style={{ color: "var(--text-faint)" }}>
          Backup: {formatStudyDate(lastBackupAt)}
        </span>
      ) : (
        <span className="flex items-center gap-1 text-[10px] text-amber-400/60">
          <AlertTriangle size={10} /> No backup
        </span>
      )}

      {/* Import result banner */}
      <AnimatePresence>
        {importResult && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="text-[10px] font-medium"
            style={{ color: importResult === "success" ? "#34d399" : "#f87171" }}
          >
            {importResult === "success" ? "Data restored successfully." : "Invalid backup file. Try again."}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
export default BackupControls;

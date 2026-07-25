"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [showSynced, setShowSynced] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowSynced(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setShowSynced(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowSynced(false);
      if (timerRef.current) clearTimeout(timerRef.current);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!isOnline) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[200] h-6 bg-red-500/90 backdrop-blur-sm flex items-center justify-center">
        <span className="text-white text-xs font-medium">Offline — saving locally</span>
      </div>
    );
  }

  return (
    <AnimatePresence>
      {showSynced && (
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -24 }}
          className="fixed top-0 left-0 right-0 z-[200] h-6 bg-emerald-500/90 backdrop-blur-sm flex items-center justify-center"
        >
          <span className="text-white text-xs font-medium">Back online — all data synced</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default ConnectionStatus;

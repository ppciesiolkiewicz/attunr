"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui";
import { useStreak } from "./useStreak";
import { getStreakMessage } from "./messages";

export function StreakBadge() {
  const { streak, celebration, clearCelebration } = useStreak();
  const [showPanel, setShowPanel] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  // Auto-show panel on celebration
  useEffect(() => {
    if (celebration !== null) {
      setShowPanel(true);
      timeoutRef.current = setTimeout(() => {
        setShowPanel(false);
        clearCelebration();
      }, 3000);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [celebration, clearCelebration]);

  // Close panel on click outside
  useEffect(() => {
    if (!showPanel) return;
    function handleClick(e: MouseEvent) {
      if (badgeRef.current && !badgeRef.current.contains(e.target as Node)) {
        setShowPanel(false);
        if (celebration !== null) clearCelebration();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showPanel, celebration, clearCelebration]);

  const handleMouseEnter = useCallback(() => {
    if (celebration !== null) return; // don't interfere with celebration
    setShowPanel(true);
  }, [celebration]);

  const handleMouseLeave = useCallback(() => {
    if (celebration !== null) return;
    setShowPanel(false);
  }, [celebration]);

  const count = streak.currentStreak;
  const fireEmojis = "🔥".repeat(Math.min(count, 10));

  return (
    <div
      ref={badgeRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Badge */}
      <Button
        variant="ghost"
        size="sm"
        className="gap-0.5 text-white/70 hover:text-white/90"
        onClick={() => setShowPanel((s) => !s)}
      >
        <span>🔥</span>
        <span>{count}</span>
      </Button>

      {/* Floating panel */}
      {showPanel && (
        <div
          className="absolute right-0 top-full mt-2 z-50 w-64 rounded-xl
                     bg-white/[0.08] backdrop-blur-xl border border-white/[0.1]
                     p-4 shadow-xl"
        >
          {count > 0 && (
            <div className="text-lg mb-2 leading-relaxed">{fireEmojis}</div>
          )}
          <p className="text-sm font-semibold text-white mb-1">
            {count > 0
              ? `${count} day streak`
              : "No streak yet"}
          </p>
          <p className="text-xs text-white/60 leading-relaxed">
            {getStreakMessage(count)}
          </p>
          {streak.longestStreak > count && (
            <p className="text-xs text-white/40 mt-2">
              Best: {streak.longestStreak} days
            </p>
          )}
        </div>
      )}
    </div>
  );
}

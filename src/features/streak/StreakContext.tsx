"use client";

import { createContext, useState, useCallback, useMemo } from "react";
import { StreakManager } from "./StreakManager";
import type { StreakData, StreakResult } from "./StreakManager";

export interface StreakContextValue {
  streak: StreakData;
  recordCompletion: () => StreakResult;
  celebration: number | null;
  clearCelebration: () => void;
}

export const StreakContext = createContext<StreakContextValue | null>(null);

export function StreakProvider({ children }: { children: React.ReactNode }) {
  const [manager] = useState(() => new StreakManager());
  const [streak, setStreak] = useState<StreakData>(() => manager.getData());
  const [celebration, setCelebration] = useState<number | null>(null);

  const recordCompletion = useCallback((): StreakResult => {
    const result = manager.recordCompletion();
    setStreak(manager.getData());
    if (result.changed) {
      setCelebration(result.streak);
    }
    return result;
  }, [manager]);

  const clearCelebration = useCallback(() => {
    setCelebration(null);
  }, []);

  const value = useMemo(
    () => ({ streak, recordCompletion, celebration, clearCelebration }),
    [streak, recordCompletion, celebration, clearCelebration],
  );

  return (
    <StreakContext.Provider value={value}>
      {children}
    </StreakContext.Provider>
  );
}

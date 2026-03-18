"use client";

import { useContext } from "react";
import { StreakContext } from "./StreakContext";
import type { StreakContextValue } from "./StreakContext";

export function useStreak(): StreakContextValue {
  const ctx = useContext(StreakContext);
  if (!ctx) throw new Error("useStreak must be used within StreakProvider");
  return ctx;
}

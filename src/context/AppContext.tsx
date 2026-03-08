"use client";

import { createContext, useContext } from "react";
import type { Chakra } from "@/constants/chakras";
import type { Settings } from "@/hooks/useSettings";

export interface AppContextValue {
  settings: Settings;
  updateSettings: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  pitchHz: number | null;
  pitchHzRef: React.RefObject<number | null>;
  playTone: (chakra: Chakra) => void;
  pitchStatus: string;
  startListening: () => void;
  openSettings: () => void;
}

export const AppContext = createContext<AppContextValue | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppShell");
  return ctx;
}

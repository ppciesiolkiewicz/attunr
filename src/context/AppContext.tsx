"use client";

import { createContext, useContext } from "react";
import type { ColoredNote } from "@/lib/VocalRange";
import type { Settings } from "@/hooks/useSettings";
import type { JourneyProgressHook } from "@/hooks/useJourneyProgress";
import type { AuthHook } from "@/hooks/useAuth";

export interface AppContextValue {
  settings: Settings;
  updateSettings: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  journeyProgress: JourneyProgressHook;
  auth: AuthHook;
  pitchHz: number | null;
  pitchHzRef: React.RefObject<number | null>;
  playTone: (band: ColoredNote) => void;
  playSlide: (fromBand: ColoredNote, toBand: ColoredNote) => void;
  pitchStatus: string;
  startListening: () => void;
  openSettings: () => void;
  triggerNotificationPrompt: () => void;
}

export const AppContext = createContext<AppContextValue | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppShell");
  return ctx;
}

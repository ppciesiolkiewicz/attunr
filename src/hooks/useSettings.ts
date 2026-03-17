"use client";

import { useState, useEffect, useCallback } from "react";
import type { TuningStandard } from "@/constants/tuning";
import type { PracticeFrequency } from "@/constants/notifications";

export interface Settings {
  tuning: TuningStandard;
  journeyStage: number; // 0 = none completed, 1–49 = highest completed
  vocalRangeLowHz: number;  // detected low comfortable Hz (0 = not set)
  vocalRangeHighHz: number; // detected high comfortable Hz (0 = not set)
  notificationsEnabled: boolean;
  practiceFrequency: PracticeFrequency;
  lastWarmupCompletedAt: number; // epoch ms, 0 = never
}

const DEFAULTS: Settings = {
  tuning: "A432",
  journeyStage: 0,
  vocalRangeLowHz: 0,
  vocalRangeHighHz: 0,
  notificationsEnabled: false,
  practiceFrequency: "daily",
  lastWarmupCompletedAt: 0,
};

const KEYS: Record<keyof Settings, string> = {
  tuning:                   "attunr.tuning",
  journeyStage:             "attunr.journeyStage",
  vocalRangeLowHz:          "attunr.vocalRangeLowHz",
  vocalRangeHighHz:         "attunr.vocalRangeHighHz",
  notificationsEnabled:     "attunr.notificationsEnabled",
  practiceFrequency:        "attunr.practiceFrequency",
  lastWarmupCompletedAt:    "attunr.lastWarmupCompletedAt",
};

function readStorage(): Partial<Settings> {
  try {
    const tuning    = localStorage.getItem(KEYS.tuning) as TuningStandard | null;
    const stageRaw  = localStorage.getItem(KEYS.journeyStage);
    const lowRaw    = localStorage.getItem(KEYS.vocalRangeLowHz);
    const highRaw   = localStorage.getItem(KEYS.vocalRangeHighHz);
    const notifEnabled = localStorage.getItem(KEYS.notificationsEnabled);
    const frequency  = localStorage.getItem(KEYS.practiceFrequency) as PracticeFrequency | null;
    const warmupRaw  = localStorage.getItem(KEYS.lastWarmupCompletedAt);
    return {
      ...(tuning       && { tuning }),
      ...(stageRaw     && { journeyStage: parseInt(stageRaw, 10) }),
      ...(lowRaw       && { vocalRangeLowHz: parseFloat(lowRaw) }),
      ...(highRaw      && { vocalRangeHighHz: parseFloat(highRaw) }),
      ...(notifEnabled && { notificationsEnabled: notifEnabled === "true" }),
      ...(frequency    && { practiceFrequency: frequency }),
      ...(warmupRaw && { lastWarmupCompletedAt: parseInt(warmupRaw, 10) }),
    };
  } catch {
    return {};
  }
}

function persist<K extends keyof Settings>(key: K, value: Settings[K]) {
  try {
    localStorage.setItem(KEYS[key], String(value));
  } catch {
    // localStorage unavailable
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);

  useEffect(() => {
    setSettings((prev) => ({ ...prev, ...readStorage() }));
  }, []);

  const update = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    persist(key, value);
  }, []);

  return { settings, update };
}

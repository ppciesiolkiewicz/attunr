"use client";

import { useState, useEffect, useCallback } from "react";
import type { VoiceTypeId, TuningStandard, FrequencyBase } from "@/constants/chakras";

export interface Settings {
  voiceType: VoiceTypeId;
  tuning: TuningStandard;
  freqBase: FrequencyBase;
  journeyStage: number; // 0 = none completed, 1–45 = highest completed
}

const DEFAULTS: Settings = {
  voiceType: "tenor",
  tuning: "A432",
  freqBase: "voice",
  journeyStage: 0,
};

const KEYS: Record<keyof Settings, string> = {
  voiceType:    "attunr.voiceType",
  tuning:       "attunr.tuning",
  freqBase:     "attunr.freqBase",
  journeyStage: "attunr.journeyStage",
};

function readStorage(): Partial<Settings> {
  try {
    const voiceType = localStorage.getItem(KEYS.voiceType) as VoiceTypeId | null;
    const tuning    = localStorage.getItem(KEYS.tuning)    as TuningStandard | null;
    const freqBase  = localStorage.getItem(KEYS.freqBase)  as FrequencyBase | null;
    const stageRaw  = localStorage.getItem(KEYS.journeyStage);
    return {
      ...(voiceType && { voiceType }),
      ...(tuning    && { tuning }),
      ...(freqBase  && { freqBase }),
      ...(stageRaw  && { journeyStage: parseInt(stageRaw, 10) }),
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

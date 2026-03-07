"use client";

import { useState, useEffect, useCallback } from "react";
import type { VoiceTypeId, TuningStandard, FrequencyBase } from "@/constants/chakras";
import type { ChakraId } from "@/constants/chakras";

export type DroneTarget = ChakraId | "off";

export interface Settings {
  voiceType: VoiceTypeId;
  tuning: TuningStandard;
  freqBase: FrequencyBase;
  binaural: boolean;
  drone: DroneTarget;
  journeyStage: number; // 0 = none completed, 1–13 = highest completed
}

const DEFAULTS: Settings = {
  voiceType: "tenor",
  tuning: "A432",
  freqBase: "voice",
  binaural: true,
  drone: "off",
  journeyStage: 0,
};

const KEYS: Record<keyof Settings, string> = {
  voiceType:    "attunr.voiceType",
  tuning:       "attunr.tuning",
  freqBase:     "attunr.freqBase",
  binaural:     "attunr.binaural",
  drone:        "attunr.drone",
  journeyStage: "attunr.journeyStage",
};

function readStorage(): Partial<Settings> {
  try {
    const voiceType  = localStorage.getItem(KEYS.voiceType)    as VoiceTypeId | null;
    const tuning     = localStorage.getItem(KEYS.tuning)       as TuningStandard | null;
    const freqBase   = localStorage.getItem(KEYS.freqBase)     as FrequencyBase | null;
    const binaural   = localStorage.getItem(KEYS.binaural);
    const drone      = localStorage.getItem(KEYS.drone)        as DroneTarget | null;
    const stageRaw   = localStorage.getItem(KEYS.journeyStage);
    return {
      ...(voiceType  && { voiceType }),
      ...(tuning     && { tuning }),
      ...(freqBase   && { freqBase }),
      ...(binaural !== null && { binaural: binaural === "true" }),
      ...(drone      && { drone }),
      ...(stageRaw   && { journeyStage: parseInt(stageRaw, 10) }),
    };
  } catch {
    return {};
  }
}

function persist<K extends keyof Settings>(key: K, value: Settings[K]) {
  try {
    localStorage.setItem(KEYS[key], String(value));
  } catch {
    // localStorage unavailable (private browsing, storage full, etc.)
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);

  // Hydrate from localStorage after mount
  useEffect(() => {
    setSettings((prev) => ({ ...prev, ...readStorage() }));
  }, []);

  const update = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    persist(key, value);
  }, []);

  return { settings, update };
}

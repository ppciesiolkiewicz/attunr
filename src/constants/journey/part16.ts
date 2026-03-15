import type { JourneyStage } from "./types";

/** Part 16: Vowel EE — introduce the narrowest, brightest vowel */
export const PART_16_STAGES: JourneyStage[] = [
  {
    id: 86,
    part: 16,
    stageTypeId: "learn",
    title: "Bright vowel — EE",
    technique: "sustain",
    cardCue: "The narrowest vowel — lips spread, tongue forward, bright resonance",
    instruction:
      "EE (as in 'see') is the narrowest, brightest vowel. Lips spread wide, tongue pushed high and forward. It's the opposite of U — where U is dark, round, and back, EE is bright, narrow, and forward. EE requires the most precise tongue position and is the hardest vowel to control, especially on higher tones. We start low and build up.",
  },
  {
    id: 87,
    part: 16,
    stageTypeId: "pitch-detection",
    title: "EE — Low",
    subtitle: "Vowel EE · 8 seconds",
    notes: [{ target: { kind: "slot", n: 1 }, seconds: 8 }],
    instruction:
      "Sing EE (as in 'see') on your lowest tone.\nLips spread, tongue forward.\nA low tone with a bright vowel — notice the blend.",
  },
  {
    id: 88,
    part: 16,
    stageTypeId: "pitch-detection",
    title: "EE — Mid",
    subtitle: "Vowel EE · 8 seconds",
    notes: [{ target: { kind: "slot", n: 4 }, seconds: 8 }],
    instruction:
      "Sing EE on the mid tone.\nKeep the brightness — the resonance should feel forward.\nStay relaxed despite the narrow vowel shape.",
  },
  {
    id: 89,
    part: 16,
    stageTypeId: "breathwork",
    title: "Farinelli breathwork",
    maxCount: 10,
    instruction:
      "Inhale, hold, and exhale for the same count. Each cycle adds one beat. Reset before pushing EE into higher territory.",
  },
  {
    id: 90,
    part: 16,
    stageTypeId: "pitch-detection",
    title: "EE — Mid-high",
    subtitle: "Vowel EE · 9 seconds",
    notes: [{ target: { kind: "slot", n: 5 }, seconds: 9 }],
    instruction:
      "Sing EE on the mid-high tone.\nThe brightness intensifies with height.\nKeep the jaw relaxed — don't clench.",
  },
  {
    id: 91,
    part: 16,
    stageTypeId: "pitch-detection",
    title: "Low sequence — EE",
    subtitle: "3 tones rising · 3 seconds each",
    notes: [
      { target: { kind: "slot", n: 1 }, seconds: 3 },
      { target: { kind: "slot", n: 2 }, seconds: 3 },
      { target: { kind: "slot", n: 3 }, seconds: 3 },
    ],
    instruction:
      "Sing EE on three rising tones — low range.\nKeep the brightness consistent as you rise.\nFeel the forward resonance on every note.",
  },
];

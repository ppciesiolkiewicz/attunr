import type { JourneyExercise } from "./types";

/** Part 17: EE & Brightness — EE high register, U→EE flow, full range */
export const PART_17_EXERCISES: JourneyExercise[] = [
  {
    id: 92,
    part: 17,
    exerciseTypeId: "pitch-detection-slide",
    title: "Lip rolls — low to high",
    subtitle: "Warmup glide · 2–3 times",
    technique: "lip-rolls",
    notes: [{ from: { kind: "index", i: 0 }, to: { kind: "index", i: -1 } }],
    instruction:
      "Quick lip roll warmup before the high EE work. Slide from low to high, smooth and easy.",
  },
  {
    id: 93,
    part: 17,
    exerciseTypeId: "pitch-detection",
    title: "EE — High",
    subtitle: "Vowel EE · 10 seconds",
    notes: [{ target: { kind: "slot", n: 7 }, seconds: 10 }],
    instruction:
      "Sing EE on your highest tone.\nBright and lifted — the hardest combination.\nKeep it light. Don't push.",
  },
  {
    id: 94,
    part: 17,
    exerciseTypeId: "pitch-detection",
    title: "U → EE flow",
    subtitle: "Vowel transition · 10 seconds",
    notes: [{ target: { kind: "slot", n: 4 }, seconds: 10 }],
    instruction:
      "Hold the mid tone steady. Start with U (round, dark) and slowly shift to EE (spread, bright). Keep the pitch constant — the full vowel spectrum unfolds. Feel the tongue move forward and the lips spread as you transition.",
  },
  {
    id: 95,
    part: 17,
    exerciseTypeId: "breathwork-farinelli",
    title: "Farinelli breathwork",
    maxCount: 10,
    instruction:
      "Inhale, hold, and exhale for the same count. Each cycle adds one beat. Recover after the high EE and vowel flow work.",
  },
  {
    id: 96,
    part: 17,
    exerciseTypeId: "pitch-detection",
    title: "Full range sequence — EE",
    subtitle: "All 7 tones · 2 seconds each",
    notes: [
      { target: { kind: "slot", n: 1 }, seconds: 2 },
      { target: { kind: "slot", n: 2 }, seconds: 2 },
      { target: { kind: "slot", n: 3 }, seconds: 2 },
      { target: { kind: "slot", n: 4 }, seconds: 2 },
      { target: { kind: "slot", n: 5 }, seconds: 2 },
      { target: { kind: "slot", n: 6 }, seconds: 2 },
      { target: { kind: "slot", n: 7 }, seconds: 2 },
    ],
    instruction:
      "Sing EE on all seven tones from low to high.\nKeep the brightness consistent through the entire range.\nFeel the resonance lift as you climb.",
  },
  {
    id: 97,
    part: 17,
    exerciseTypeId: "pitch-detection",
    title: "Puffy cheeks — High",
    subtitle: "Breath control · 8 seconds",
    technique: "puffy-cheeks",
    notes: [{ target: { kind: "slot", n: 6 }, seconds: 8 }],
    instruction:
      "Sing on the upper-mid tone with puffy cheeks.\nHigh tone with breath control — a real challenge.\nKeep it steady and supported.",
    completionModal: {
      title: "Part XVII Complete",
      subtitle: "EE & Brightness",
      elements: [
        { type: "paragraph", text: "EE on high tones, U → EE full vowel flow, full-range EE sequence, and puffy cheeks on high tones." },
        { type: "paragraph", text: "The U → EE flow is one of the most valuable exercises in singing. It teaches resonance consistency." },
      ],
      confetti: true,
    },
  },
];

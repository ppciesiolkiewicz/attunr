import type { JourneyStage } from "./types";

/** Part 5: Vowel U — rounded lips across the range */
export const PART_5_STAGES: JourneyStage[] = [
  {
    id: 24,
    part: 5,
    stageTypeId: "intro",
    title: "Vowel U",
    cardCue: "Sing with rounded lips — the easiest vowel to start",
    instruction:
      "Sing uuu (as in 'moon') — lips rounded, tongue back. U is the easiest vowel to start with. Hold the tone steady and focus on the sound.",
  },
  {
    id: 25,
    part: 5,
    stageTypeId: "pitch-detection",
    title: "Low — U",
    subtitle: "Vowel U · 10 seconds",
    notes: [{ target: { kind: "slot", n: 1 }, seconds: 10 }],
    instruction:
      "Sing uuu on your lowest tone.\nKeep it low and grounded.",
  },
  {
    id: 26,
    part: 5,
    stageTypeId: "pitch-detection",
    title: "Lower-mid — U",
    subtitle: "Vowel U · 10 seconds",
    notes: [{ target: { kind: "slot", n: 2 }, seconds: 10 }],
    instruction:
      "Sing uuu on the lower-mid tone.\nKeep it warm and full.",
  },
  {
    id: 27,
    part: 5,
    stageTypeId: "pitch-detection",
    title: "Mid-low — U",
    subtitle: "Vowel U · 10 seconds",
    notes: [{ target: { kind: "slot", n: 3 }, seconds: 10 }],
    instruction:
      "Sing uuu on the mid-low tone.\nFeel the tone grow stronger.",
  },
  {
    id: 28,
    part: 5,
    stageTypeId: "pitch-detection",
    title: "Mid — U",
    subtitle: "Vowel U · 10 seconds",
    notes: [{ target: { kind: "slot", n: 4 }, seconds: 10 }],
    instruction:
      "Sing uuu on the mid tone.\nOpen and soft — keep it relaxed.",
  },
  {
    id: 29,
    part: 5,
    stageTypeId: "pitch-detection",
    title: "Mid-high — U",
    subtitle: "Vowel U · 10 seconds",
    notes: [{ target: { kind: "slot", n: 5 }, seconds: 10 }],
    instruction:
      "Sing uuu on the mid-high tone.\nClear and steady — let your voice be heard.",
  },
  {
    id: 30,
    part: 5,
    stageTypeId: "pitch-detection",
    title: "Upper-mid — U",
    subtitle: "Vowel U · 10 seconds",
    notes: [{ target: { kind: "slot", n: 6 }, seconds: 10 }],
    instruction:
      "Sing uuu on the upper-mid tone.\nGentle and inward — keep it soft.",
  },
  {
    id: 31,
    part: 5,
    stageTypeId: "pitch-detection",
    title: "High — U",
    subtitle: "Vowel U · 10 seconds",
    notes: [{ target: { kind: "slot", n: 7 }, seconds: 10 }],
    instruction:
      "Sing uuu on your highest tone.\nStay soft and open at the top.",
  },
];

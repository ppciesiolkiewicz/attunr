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
      "Sing uuu (as in 'moon') — lips rounded, tongue back. U is the easiest vowel to start with. It tends to resonate lower in the body. Hold the tone and feel where it lands.",
  },
  {
    id: 25,
    part: 5,
    stageTypeId: "pitch-detection",
    title: "Low — U",
    subtitle: "Vowel U · chest · 3 seconds",
    notes: [{ target: { kind: "slot", n: 1 }, seconds: 3 }],
    instruction:
      "Sing uuu on your lowest tone.\nFeel it settle in your chest.",
  },
  {
    id: 26,
    part: 5,
    stageTypeId: "pitch-detection",
    title: "Lower-mid — U",
    subtitle: "Vowel U · lower belly · 3 seconds",
    notes: [{ target: { kind: "slot", n: 2 }, seconds: 3 }],
    instruction:
      "Sing uuu on the lower-mid tone.\nLet the sound flow from your lower belly.",
  },
  {
    id: 27,
    part: 5,
    stageTypeId: "pitch-detection",
    title: "Mid-low — U",
    subtitle: "Vowel U · centre · 3 seconds",
    notes: [{ target: { kind: "slot", n: 3 }, seconds: 3 }],
    instruction:
      "Sing uuu on the mid-low tone.\nFeel the power in your centre.",
  },
  {
    id: 28,
    part: 5,
    stageTypeId: "pitch-detection",
    title: "Mid — U",
    subtitle: "Vowel U · heart · 3 seconds",
    notes: [{ target: { kind: "slot", n: 4 }, seconds: 3 }],
    instruction:
      "Sing uuu on the mid tone.\nOpen and soft — feel it in your chest.",
  },
  {
    id: 29,
    part: 5,
    stageTypeId: "pitch-detection",
    title: "Mid-high — U",
    subtitle: "Vowel U · throat · 3 seconds",
    notes: [{ target: { kind: "slot", n: 5 }, seconds: 3 }],
    instruction:
      "Sing uuu on the mid-high tone.\nClear and steady — let your voice be heard.",
  },
  {
    id: 30,
    part: 5,
    stageTypeId: "pitch-detection",
    title: "Upper-mid — U",
    subtitle: "Vowel U · forehead · 3 seconds",
    notes: [{ target: { kind: "slot", n: 6 }, seconds: 3 }],
    instruction:
      "Sing uuu on the upper-mid tone.\nGentle and inward — feel it behind your forehead.",
  },
  {
    id: 31,
    part: 5,
    stageTypeId: "pitch-detection",
    title: "High — U",
    subtitle: "Vowel U · crown · 3 seconds",
    notes: [{ target: { kind: "slot", n: 7 }, seconds: 3 }],
    instruction:
      "Sing uuu on your highest tone.\nStay soft and open at the top.",
  },
];

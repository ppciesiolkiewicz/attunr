import type { JourneyStage } from "./types";

/** Part 6: Vowel EE — bright forward vowel */
export const PART_6_STAGES: JourneyStage[] = [
  {
    id: 32,
    part: 6,
    stageTypeId: "intro",
    title: "Vowel EE",
    cardCue: "Bright, forward vowel — feel the resonance shift higher",
    instruction:
      "Sing with EE (as in 'see') — lips spread, tongue forward. EE lifts the resonance higher. It can feel brighter and more energising. Contrast with U to feel the shift.",
  },
  {
    id: 33,
    part: 6,
    stageTypeId: "pitch-detection",
    title: "Low — EE",
    subtitle: "Vowel EE · 10 seconds",
    notes: [{ target: { kind: "slot", n: 1 }, seconds: 10 }],
    instruction:
      "Sing EE on your lowest tone.\nA low tone with a forward vowel — notice the blend.",
  },
  {
    id: 34,
    part: 6,
    stageTypeId: "pitch-detection",
    title: "Mid — EE",
    subtitle: "Vowel EE · 10 seconds",
    notes: [{ target: { kind: "slot", n: 4 }, seconds: 10 }],
    instruction:
      "Sing EE on the mid tone.\nFeel the openness in the chest with this vowel.",
  },
  {
    id: 35,
    part: 6,
    stageTypeId: "pitch-detection",
    title: "High — EE",
    subtitle: "Vowel EE · 10 seconds",
    notes: [{ target: { kind: "slot", n: 7 }, seconds: 10 }],
    instruction:
      "Sing EE on your highest tone.\nA high, bright tone — let it lift.",
  },
];

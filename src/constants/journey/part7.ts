import type { JourneyStage } from "./types";

/** Part 7: Vowel flow U → EE */
export const PART_7_STAGES: JourneyStage[] = [
  {
    id: 36,
    part: 7,
    stageTypeId: "intro",
    title: "Vowel flow U → EE",
    cardCue: "Glide from U to EE on one tone to build vocal flexibility",
    instruction:
      "Hold one tone and smoothly move from U to EE (or back). Keep the pitch steady — only the mouth shape changes. This builds vocal flexibility and awareness of resonance.",
  },
  {
    id: 37,
    part: 7,
    stageTypeId: "pitch-detection",
    title: "Mid — U to EE",
    subtitle: "Flow from U to EE · 10 seconds",
    notes: [{ target: { kind: "slot", n: 4 }, seconds: 10 }],
    instruction:
      "Sing the mid tone and flow from U to EE. Hold the pitch steady, let the vowel glide. Ten seconds in tune.",
  },
];

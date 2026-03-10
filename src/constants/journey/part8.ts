import type { JourneyStage } from "./types";

/** Part 8: Vowel flow U → EE */
export const PART_8_STAGES: JourneyStage[] = [
  {
    id: 44,
    part: 8,
    type: "technique_intro",
    title: "Vowel flow U → EE",
    chakraIds: [],
    holdSeconds: 0,
    noteSeconds: 0,
    technique: "vowel-flow",
    cardCue: "Glide from U to EE on one tone to build vocal flexibility",
    instruction:
      "Hold one tone and smoothly move from U to EE (or back). Keep the pitch steady — only the mouth shape changes. This builds vocal flexibility and awareness of resonance.",
  },
  {
    id: 45,
    part: 8,
    type: "individual",
    title: "Heart — U to EE",
    chakraIds: ["heart"],
    holdSeconds: 5,
    noteSeconds: 0,
    technique: "vowel-flow",
    chakraDetailStyle: "brief",
    instruction:
      "Sing Heart and flow from U to EE. Hold the tone steady, let the vowel glide. Five seconds in tune.",
  },
];

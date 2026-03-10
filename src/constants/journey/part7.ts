import type { JourneyStage } from "./types";

/** Part 7: Vowel EE */
export const PART_7_STAGES: JourneyStage[] = [
  {
    id: 40,
    part: 7,
    type: "technique_intro",
    title: "Vowel EE",
    chakraIds: [],
    holdSeconds: 0,
    noteSeconds: 0,
    technique: "vowel-ee",
    cardCue: "Bright, forward vowel — feel the resonance shift higher",
    instruction:
      "Sing with EE (as in 'see') — lips spread, tongue forward. EE lifts the resonance higher. It can feel brighter and more energising. Contrast with U to feel the shift.",
  },
  {
    id: 41,
    part: 7,
    type: "individual",
    title: "Root — EE",
    chakraIds: ["root"],
    holdSeconds: 3,
    noteSeconds: 0,
    technique: "vowel-ee",
    chakraDetailStyle: "brief",
    instruction:
      "Sing Root with EE.\nA low tone with a forward vowel — notice the blend.",
  },
  {
    id: 42,
    part: 7,
    type: "individual",
    title: "Heart — EE",
    chakraIds: ["heart"],
    holdSeconds: 3,
    noteSeconds: 0,
    technique: "vowel-ee",
    chakraDetailStyle: "brief",
    instruction:
      "Sing Heart with EE.\nFeel the openness in the chest with this vowel.",
  },
  {
    id: 43,
    part: 7,
    type: "individual",
    title: "Crown — EE",
    chakraIds: ["crown"],
    holdSeconds: 3,
    noteSeconds: 0,
    technique: "vowel-ee",
    chakraDetailStyle: "brief",
    instruction:
      "Sing Crown with EE.\nA high, bright tone — let it lift.",
  },
];

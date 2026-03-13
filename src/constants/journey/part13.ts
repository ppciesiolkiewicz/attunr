import type { JourneyStage } from "./types";

/** Part 13: Forward EH — introduce EH vowel and resonance shift */
export const PART_13_STAGES: JourneyStage[] = [
  {
    id: 68,
    part: 13,
    stageTypeId: "intro",
    title: "Forward resonance — EH",
    technique: "sustain",
    cardCue: "Place your voice forward with the Spanish-style EH vowel",
    instruction:
      "EH (like Spanish 'e', or the vowel in 'bed') places resonance forward in the mouth. It's brighter than AH and more open than EE. The tongue moves forward and the mouth narrows slightly. This vowel increases articulation and forward resonance — essential skills as you move into higher ranges.",
  },
  {
    id: 69,
    part: 13,
    stageTypeId: "pitch-detection",
    title: "EH — Low",
    subtitle: "Vowel EH · 8 seconds",
    notes: [{ target: { kind: "slot", n: 2 }, seconds: 8 }],
    instruction:
      "Sing EH (as in 'bed') on the lower-mid tone.\nTongue forward, mouth slightly narrower than AH.\nFeel the resonance move forward in your mouth.",
  },
  {
    id: 70,
    part: 13,
    stageTypeId: "pitch-detection",
    title: "EH — Mid",
    subtitle: "Vowel EH · 8 seconds",
    notes: [{ target: { kind: "slot", n: 4 }, seconds: 8 }],
    instruction:
      "Sing EH on the mid tone.\nKeep the forward placement — the buzz should feel closer to your lips and teeth.\nStay relaxed.",
  },
  {
    id: 71,
    part: 13,
    stageTypeId: "breathwork",
    title: "Farinelli breathwork",
    maxCount: 9,
    instruction:
      "Inhale, hold, and exhale for the same count. Each cycle adds one beat. Reset before the vowel transition work.",
  },
  {
    id: 72,
    part: 13,
    stageTypeId: "pitch-detection",
    title: "OH → EH flow",
    subtitle: "Vowel transition · 8 seconds",
    notes: [{ target: { kind: "slot", n: 3 }, seconds: 8 }],
    instruction:
      "Hold the mid-low tone steady. Start with OH (rounded) and transition to EH (forward). The pitch stays the same — feel the resonance shift forward as the lips unround and the tongue moves forward.",
  },
  {
    id: 73,
    part: 13,
    stageTypeId: "pitch-detection",
    title: "EH — Mid-high",
    subtitle: "Vowel EH · 8 seconds",
    notes: [{ target: { kind: "slot", n: 5 }, seconds: 8 }],
    instruction:
      "Sing EH on the mid-high tone.\nA step higher — keep the forward placement.\nDon't push. Let the brightness come naturally.",
  },
];

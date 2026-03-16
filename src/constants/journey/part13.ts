import type { JourneyExerciseInput } from "./types";
import { BandTargetKind } from "./types";

/** Part 13: Forward EH — introduce EH vowel and resonance shift */
export const PART_13_EXERCISES: JourneyExerciseInput[] = [
  {
    part: 13,
    exerciseTypeId: "learn",
    title: "Forward resonance — EH",
    technique: "sustain",
    cardCue: "Place your voice forward with the Spanish-style EH vowel",
    elements: [
      { type: "paragraph", text: "EH (like Spanish 'e', or the vowel in 'bed') places resonance forward in the mouth. It's brighter than AH and more open than EE. The tongue moves forward and the mouth narrows slightly. This vowel increases articulation and forward resonance — essential skills as you move into higher ranges." },
      { type: "video" },
    ],
  },
  {
    part: 13,
    exerciseTypeId: "pitch-detection",
    title: "EH — Low",
    subtitle: "Vowel EH · 8 seconds",
    scale: { type: "even-7-from-major", root: 1 },
    notes: [{ target: { kind: BandTargetKind.Index, i: 1 }, seconds: 8 }],
    instruction:
      "Sing EH (as in 'bed') on the lower-mid tone.\nTongue forward, mouth slightly narrower than AH.\nFeel the resonance move forward in your mouth.",
  },
  {
    part: 13,
    exerciseTypeId: "pitch-detection",
    title: "EH — Mid",
    subtitle: "Vowel EH · 8 seconds",
    scale: { type: "even-7-from-major", root: 1 },
    notes: [{ target: { kind: BandTargetKind.Index, i: 3 }, seconds: 8 }],
    instruction:
      "Sing EH on the mid tone.\nKeep the forward placement — the buzz should feel closer to your lips and teeth.\nStay relaxed.",
  },
  {
    part: 13,
    exerciseTypeId: "breathwork-farinelli",
    title: "Farinelli breathwork",
    maxCount: 9,
    instruction:
      "Inhale, hold, and exhale for the same count. Each cycle adds one beat. Reset before the vowel transition work.",
  },
  {
    part: 13,
    exerciseTypeId: "pitch-detection",
    title: "OH → EH flow",
    subtitle: "Vowel transition · 8 seconds",
    scale: { type: "even-7-from-major", root: 1 },
    notes: [{ target: { kind: BandTargetKind.Index, i: 2 }, seconds: 8 }],
    instruction:
      "Hold the mid-low tone steady. Start with OH (rounded) and transition to EH (forward). The pitch stays the same — feel the resonance shift forward as the lips unround and the tongue moves forward.",
  },
  {
    part: 13,
    exerciseTypeId: "pitch-detection",
    title: "EH — Mid-high",
    subtitle: "Vowel EH · 8 seconds",
    scale: { type: "even-7-from-major", root: 1 },
    notes: [{ target: { kind: BandTargetKind.Index, i: 4 }, seconds: 8 }],
    instruction:
      "Sing EH on the mid-high tone.\nA step higher — keep the forward placement.\nDon't push. Let the brightness come naturally.",
    completionModal: {
      title: "Part XIII Complete",
      subtitle: "Forward EH",
      elements: [
        { type: "paragraph", text: "The forward EH vowel (as in 'bed'), OH → EH vowel flow, and forward resonance placement." },
        { type: "paragraph", text: "Forward resonance helps with projection. Practice EH when you want your voice to carry." },
      ],
      confetti: true,
    },
  },
];

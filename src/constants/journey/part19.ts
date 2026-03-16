import type { JourneyExerciseInput } from "./types";
import { BandTargetKind } from "./types";

/** Part 19: Vowel Mastery — advanced flows, vowel cascade */
export const PART_19_EXERCISES: JourneyExerciseInput[] = [
  {
    part: 19,
    exerciseTypeId: "pitch-detection",
    title: "U → EE flow — high",
    subtitle: "Full vowel shift · 10 seconds",
    scale: { type: "even-7-from-major", root: 1 },
    notes: [{ target: { kind: BandTargetKind.Index, i: 4 }, seconds: 10 }],
    instruction:
      "Hold the mid-high tone steady. Flow from U all the way to EE — the full vowel spectrum on a higher pitch. Keep the pitch locked as the mouth shape transforms completely.",
  },
  {
    part: 19,
    exerciseTypeId: "pitch-detection",
    title: "OO → EE flow",
    subtitle: "Vowel transition · 10 seconds",
    scale: { type: "even-7-from-major", root: 1 },
    notes: [{ target: { kind: BandTargetKind.Index, i: 3 }, seconds: 10 }],
    instruction:
      "Hold the mid tone steady. Start with OO (rounded) and shift to EE (spread). A dramatic transformation — the lips go from round to wide. Keep the pitch and breath steady throughout.",
  },
  {
    part: 19,
    exerciseTypeId: "pitch-detection",
    title: "Vowel cascade — mid-low",
    subtitle: "All vowels on one pitch · 12 seconds",
    scale: { type: "even-7-from-major", root: 1 },
    notes: [{ target: { kind: BandTargetKind.Index, i: 2 }, seconds: 12 }],
    instruction:
      "Hold the mid-low tone steady and flow through all six vowels: U → OO → OH → AH → EH → EE. Smooth, continuous transitions. The pitch stays constant — only the mouth shape changes. Feel the full spectrum of resonance.",
  },
  {
    part: 19,
    exerciseTypeId: "breathwork-farinelli",
    title: "Farinelli breathwork",
    maxCount: 11,
    instruction:
      "Inhale, hold, and exhale for the same count. Each cycle adds one beat. Longer cycles now — your breath control has grown.",
  },
  {
    part: 19,
    exerciseTypeId: "pitch-detection",
    title: "Puffy cheeks — High",
    subtitle: "Breath control · 10 seconds",
    technique: "puffy-cheeks",
    scale: { type: "even-7-from-major", root: 1 },
    notes: [{ target: { kind: BandTargetKind.Index, i: 6 }, seconds: 10 }],
    instruction:
      "Sing on your highest tone with puffy cheeks.\nThe ultimate breath control challenge — high tone with maximum back-pressure.\nKeep it soft and steady.",
  },
  {
    part: 19,
    exerciseTypeId: "pitch-detection",
    title: "Vowel cascade — mid-high",
    subtitle: "All vowels on one pitch · 12 seconds",
    scale: { type: "even-7-from-major", root: 1 },
    notes: [{ target: { kind: BandTargetKind.Index, i: 4 }, seconds: 12 }],
    instruction:
      "Hold the mid-high tone and flow through all six vowels: U → OO → OH → AH → EH → EE. Same cascade, higher pitch — more challenging. Keep the resonance full and consistent through each transition.",
    completionModal: {
      title: "Part XIX Complete",
      subtitle: "Vowel Mastery",
      elements: [
        { type: "paragraph", text: "Advanced vowel flows, the full vowel cascade (U→OO→OH→AH→EH→EE), and puffy cheeks on the highest tone." },
        { type: "paragraph", text: "The vowel cascade is a signature exercise. Try it on different pitches to explore your range." },
      ],
      confetti: true,
    },
  },
];

import type { JourneyExerciseInput } from "./types";
import { BandTargetKind } from "./types";

/** Part 14: EH Mastery — EH range, sequences, puffy cheeks */
export const PART_14_EXERCISES: JourneyExerciseInput[] = [
  {
    part: 14,
    exerciseTypeId: "tone-follow",
    title: "Lip rolls — high to low",
    subtitle: "Warmup glide · play 3 times",
    technique: "lip-rolls",
    scale: { type: "chromatic", root: 1 },
    toneShape: { kind: "slide", from: { kind: BandTargetKind.Index, i: -1 }, to: { kind: BandTargetKind.Index, i: 0 } },
    requiredPlays: 3,
    instruction:
      "Play the tone and lip roll alongside it. A quick warmup glide from high to low.",
  },
  {
    part: 14,
    exerciseTypeId: "pitch-detection",
    title: "EH — Low",
    subtitle: "Vowel EH · 9 seconds",
    scale: { type: "even-7-from-major", root: 1 },
    notes: [{ target: { kind: BandTargetKind.Index, i: 1 }, seconds: 9 }],
    instruction:
      "Sing EH on the lower-mid tone.\nLonger hold this time — find stability in the forward resonance.\nKeep the tongue forward and relaxed.",
  },
  {
    part: 14,
    exerciseTypeId: "pitch-detection",
    title: "Puffy cheeks — Mid",
    subtitle: "Breath control · 8 seconds",
    technique: "puffy-cheeks",
    scale: { type: "even-7-from-major", root: 1 },
    notes: [{ target: { kind: BandTargetKind.Index, i: 3 }, seconds: 8 }],
    instruction:
      "Sing on the mid tone with puffy cheeks.\nFeel the back-pressure support your voice.\nStay steady and relaxed.",
  },
  {
    part: 14,
    exerciseTypeId: "pitch-detection",
    title: "EH rising sequence",
    subtitle: "4 tones rising · 2 seconds each",
    scale: { type: "even-7-from-major", root: 1 },
    notes: [
      { target: { kind: BandTargetKind.Index, i: 1 }, seconds: 2 },
      { target: { kind: BandTargetKind.Index, i: 2 }, seconds: 2 },
      { target: { kind: BandTargetKind.Index, i: 3 }, seconds: 2 },
      { target: { kind: BandTargetKind.Index, i: 4 }, seconds: 2 },
    ],
    instruction:
      "Sing EH on four rising tones.\nKeep the forward placement through each shift.\nFeel the brightness increase as you climb.",
  },
  {
    part: 14,
    exerciseTypeId: "breathwork-farinelli",
    title: "Farinelli breathwork",
    maxCount: 10,
    instruction:
      "Inhale, hold, and exhale for the same count. Each cycle adds one beat. Recover after the sequence and puffy cheeks work.",
  },
  {
    part: 14,
    exerciseTypeId: "pitch-detection",
    title: "AH → EH flow",
    subtitle: "Vowel transition · 9 seconds",
    scale: { type: "even-7-from-major", root: 1 },
    notes: [{ target: { kind: BandTargetKind.Index, i: 3 }, seconds: 9 }],
    instruction:
      "Hold the mid tone steady. Start with AH (open, neutral) and transition to EH (forward, brighter). Feel the tongue move forward and the resonance shift. The pitch stays the same.",
    completionModal: {
      title: "Part XIV Complete",
      subtitle: "EH Mastery",
      elements: [
        { type: "paragraph", text: "EH mastery — longer holds, sequences, puffy cheeks at mid range, and AH → EH vowel flow." },
        { type: "paragraph", text: "Combining techniques (puffy cheeks + vowels + sequences) builds real vocal fitness." },
      ],
      confetti: true,
    },
  },
];

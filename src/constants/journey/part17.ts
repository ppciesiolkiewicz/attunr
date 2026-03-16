import type { JourneyExerciseInput } from "./types";
import { BandTargetKind } from "./types";

/** Part 17: EE & Brightness — EE high register, U→EE flow, full range */
export const PART_17_EXERCISES: JourneyExerciseInput[] = [
  {
    part: 17,
    exerciseTypeId: "tone-follow",
    title: "Lip rolls — low to high",
    subtitle: "Warmup glide · play 3 times",
    technique: "lip-rolls",
    scale: { type: "chromatic", root: 1 },
    displayNotes: [{ type: "major", root: 1, notes: [] }],
    toneShape: { kind: "slide", from: { kind: BandTargetKind.Index, i: 0 }, to: { kind: BandTargetKind.Index, i: -1 } },
    requiredPlays: 3,
    instruction:
      "Play the tone and lip roll alongside it. A quick warmup glide from low to high before the EE work.",
  },
  {
    part: 17,
    exerciseTypeId: "pitch-detection",
    title: "EE — High",
    subtitle: "Vowel EE · 10 seconds",
    scale: { type: "even-7-from-major", root: 1 },
    notes: [{ target: { kind: BandTargetKind.Index, i: 6 }, seconds: 10 }],
    instruction:
      "Sing EE on your highest tone.\nBright and lifted — the hardest combination.\nKeep it light. Don't push.",
  },
  {
    part: 17,
    exerciseTypeId: "pitch-detection",
    title: "U → EE flow",
    subtitle: "Vowel transition · 10 seconds",
    scale: { type: "even-7-from-major", root: 1 },
    notes: [{ target: { kind: BandTargetKind.Index, i: 3 }, seconds: 10 }],
    instruction:
      "Hold the mid tone steady. Start with U (round, dark) and slowly shift to EE (spread, bright). Keep the pitch constant — the full vowel spectrum unfolds. Feel the tongue move forward and the lips spread as you transition.",
  },
  {
    part: 17,
    exerciseTypeId: "breathwork-farinelli",
    title: "Farinelli breathwork",
    maxCount: 10,
    instruction:
      "Inhale, hold, and exhale for the same count. Each cycle adds one beat. Recover after the high EE and vowel flow work.",
  },
  {
    part: 17,
    exerciseTypeId: "pitch-detection",
    title: "Full range sequence — EE",
    subtitle: "All 7 tones · 2 seconds each",
    scale: { type: "even-7-from-major", root: 1 },
    notes: [
      { target: { kind: BandTargetKind.Index, i: 0 }, seconds: 2 },
      { target: { kind: BandTargetKind.Index, i: 1 }, seconds: 2 },
      { target: { kind: BandTargetKind.Index, i: 2 }, seconds: 2 },
      { target: { kind: BandTargetKind.Index, i: 3 }, seconds: 2 },
      { target: { kind: BandTargetKind.Index, i: 4 }, seconds: 2 },
      { target: { kind: BandTargetKind.Index, i: 5 }, seconds: 2 },
      { target: { kind: BandTargetKind.Index, i: 6 }, seconds: 2 },
    ],
    instruction:
      "Sing EE on all seven tones from low to high.\nKeep the brightness consistent through the entire range.\nFeel the resonance lift as you climb.",
  },
  {
    part: 17,
    exerciseTypeId: "pitch-detection",
    title: "Puffy cheeks — High",
    subtitle: "Breath control · 8 seconds",
    technique: "puffy-cheeks",
    scale: { type: "even-7-from-major", root: 1 },
    notes: [{ target: { kind: BandTargetKind.Index, i: 5 }, seconds: 8 }],
    instruction:
      "Sing on the upper-mid tone with puffy cheeks.\nHigh tone with breath control — a real challenge.\nKeep it steady and supported.",
    completionModal: {
      title: "Part XVII Complete",
      subtitle: "EE & Brightness",
      elements: [
        { type: "paragraph", text: "EE on high tones, U → EE full vowel flow, full-range EE sequence, and puffy cheeks on high tones." },
        { type: "paragraph", text: "The U → EE flow is one of the most valuable exercises in singing. It teaches resonance consistency." },
      ],
      confetti: true,
    },
  },
];

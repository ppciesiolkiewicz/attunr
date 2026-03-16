import type { JourneyExerciseInput } from "./types";
import { BandTargetKind } from "./types";

/** Part 10: Sequences & Range — multi-tone sequences with known vowels */
export const PART_10_EXERCISES: JourneyExerciseInput[] = [
  {
    part: 10,
    exerciseTypeId: "pitch-detection",
    title: "Low sequence — U",
    subtitle: "3 tones rising · 2 seconds each",
    scale: { type: "even-7-from-major", root: 1 },
    notes: [
      { target: { kind: BandTargetKind.Index, i: 0 }, seconds: 2 },
      { target: { kind: BandTargetKind.Index, i: 1 }, seconds: 2 },
      { target: { kind: BandTargetKind.Index, i: 2 }, seconds: 2 },
    ],
    instruction:
      "Sing U on three rising tones — low range.\nKeep the lips rounded and the transitions smooth.\nFeel each tone connect to the next.",
  },
  {
    part: 10,
    exerciseTypeId: "pitch-detection",
    title: "Skip sequence — Hum",
    subtitle: "3 tones skipping · 3 seconds each",
    scale: { type: "even-7-from-major", root: 1 },
    notes: [
      { target: { kind: BandTargetKind.Index, i: 0 }, seconds: 3 },
      { target: { kind: BandTargetKind.Index, i: 2 }, seconds: 3 },
      { target: { kind: BandTargetKind.Index, i: 4 }, seconds: 3 },
    ],
    instruction:
      "Hum three tones, skipping every other note — low, mid-low, mid-high.\nBigger jumps require more control.\nKeep the transitions smooth.",
  },
  {
    part: 10,
    exerciseTypeId: "breathwork-farinelli",
    title: "Farinelli breathwork",
    maxCount: 8,
    instruction:
      "Inhale, hold, and exhale for the same count. Each cycle adds one beat. Centre yourself between the sequences.",
  },
  {
    part: 10,
    exerciseTypeId: "pitch-detection",
    title: "Rising sequence — AH",
    subtitle: "5 tones rising · 2 seconds each",
    scale: { type: "even-7-from-major", root: 1 },
    notes: [
      { target: { kind: BandTargetKind.Index, i: 1 }, seconds: 2 },
      { target: { kind: BandTargetKind.Index, i: 2 }, seconds: 2 },
      { target: { kind: BandTargetKind.Index, i: 3 }, seconds: 2 },
      { target: { kind: BandTargetKind.Index, i: 4 }, seconds: 2 },
    ],
    instruction:
      "Sing AH on four rising tones — low to mid-high.\nKeep the jaw relaxed and open on each tone.\nThis is your longest rising sequence yet.",
  },
  {
    part: 10,
    exerciseTypeId: "tone-follow",
    title: "Lip rolls — low to high",
    subtitle: "Glide · play 3 times",
    technique: "lip-rolls",
    scale: { type: "chromatic", root: 1 },
    toneShape: { kind: "slide", from: { kind: BandTargetKind.Index, i: 0 }, to: { kind: BandTargetKind.Index, i: -1 } },
    requiredPlays: 3,
    instruction:
      "Play the tone and lip roll alongside it. A quick reset glide from low to high.",
  },
  {
    part: 10,
    exerciseTypeId: "pitch-detection",
    title: "Rising sequence — OO",
    subtitle: "5 tones rising · 2 seconds each",
    scale: { type: "even-7-from-major", root: 1 },
    notes: [
      { target: { kind: BandTargetKind.Index, i: 0 }, seconds: 2 },
      { target: { kind: BandTargetKind.Index, i: 1 }, seconds: 2 },
      { target: { kind: BandTargetKind.Index, i: 2 }, seconds: 2 },
      { target: { kind: BandTargetKind.Index, i: 3 }, seconds: 2 },
      { target: { kind: BandTargetKind.Index, i: 4 }, seconds: 2 },
    ],
    instruction:
      "Sing OO on five rising tones — low to mid-high.\nKeep the lips rounded through every tone.\nFeel the range opening up.",
    completionModal: {
      title: "Part X Complete",
      subtitle: "Sequences & Range",
      elements: [
        { type: "paragraph", text: "Multi-tone sequences with different vowels — U, Hum, AH, and OO across your expanding range." },
        { type: "paragraph", text: "Sequences prepare you for real singing. Try connecting them to songs you enjoy." },
      ],
      confetti: true,
    },
  },
];

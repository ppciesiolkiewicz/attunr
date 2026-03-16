import type { JourneyExerciseInput } from "./types";
import { BandTargetKind } from "./types";

/** Part 12: Chakras — Sky — Throat to Crown mantras */
export const PART_12_EXERCISES: JourneyExerciseInput[] = [
  {
    part: 12,
    exerciseTypeId: "breathwork-farinelli",
    title: "Farinelli breathwork",
    maxCount: 9,
    instruction:
      "Inhale, hold, and exhale for the same count. Each cycle adds one beat. Centre yourself before the upper chakras — these higher tones ask for more openness.",
  },
  {
    part: 12,
    exerciseTypeId: "pitch-detection",
    title: "Throat — HAM",
    subtitle: "Mantra · Throat tone · 8 seconds",
    scale: { type: "even-7-from-major", root: 1 },
    notes: [{ target: { kind: BandTargetKind.Index, i: 4 }, seconds: 8 }],
    instruction:
      "Sing HAM on the Throat tone.\nClear and true — let your voice be heard.",
  },
  {
    part: 12,
    exerciseTypeId: "pitch-detection",
    title: "Third Eye — OM",
    subtitle: "Mantra · Third Eye tone · 8 seconds",
    scale: { type: "even-7-from-major", root: 1 },
    notes: [{ target: { kind: BandTargetKind.Index, i: 5 }, seconds: 8 }],
    instruction:
      "Sing OM on the Third Eye tone.\nGentle and inward — clarity and insight.",
  },
  {
    part: 12,
    exerciseTypeId: "pitch-detection",
    title: "Crown — AH",
    subtitle: "Mantra · Crown tone · 8 seconds",
    scale: { type: "even-7-from-major", root: 1 },
    notes: [{ target: { kind: BandTargetKind.Index, i: 6 }, seconds: 8 }],
    instruction:
      "Sing AH on the Crown tone.\nSoft and open — presence and unity.",
  },
  {
    part: 12,
    exerciseTypeId: "pitch-detection",
    title: "Full chakra sequence",
    subtitle: "All 7 mantras · 3 seconds each",
    scale: { type: "even-7-from-major", root: 1 },
    notes: [
      { target: { kind: BandTargetKind.Index, i: 0 }, seconds: 3 },
      { target: { kind: BandTargetKind.Index, i: 1 }, seconds: 3 },
      { target: { kind: BandTargetKind.Index, i: 2 }, seconds: 3 },
      { target: { kind: BandTargetKind.Index, i: 3 }, seconds: 3 },
      { target: { kind: BandTargetKind.Index, i: 4 }, seconds: 3 },
      { target: { kind: BandTargetKind.Index, i: 5 }, seconds: 3 },
      { target: { kind: BandTargetKind.Index, i: 6 }, seconds: 3 },
    ],
    instruction:
      "Sing all seven mantras in sequence — LAM, VAM, RAM, YAM, HAM, OM, AH.\nFeel the energy rise from Root to Crown.\nA complete journey through the chakra system.",
  },
  {
    part: 12,
    exerciseTypeId: "breathwork-farinelli",
    title: "Farinelli breathwork",
    maxCount: 9,
    instruction:
      "Inhale, hold, and exhale for the same count. Each cycle adds one beat. Close the chakra journey with deep, centred breathing.",
  },
];

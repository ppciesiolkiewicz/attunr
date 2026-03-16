import type { JourneyExerciseInput } from "./types";
import { BandTargetKind } from "./types";

/** Part 16: Vowel EE — introduce the narrowest, brightest vowel */
export const PART_16_EXERCISES: JourneyExerciseInput[] = [
  {
    part: 16,
    exerciseTypeId: "learn",
    title: "Bright vowel — EE",
    cardCue: "The narrowest vowel — lips spread, tongue forward, bright resonance",
    elements: [
      { type: "paragraph", text: "EE (as in 'see') is the narrowest, brightest vowel. Lips spread wide, tongue pushed high and forward. It's the opposite of U — where U is dark, round, and back, EE is bright, narrow, and forward. EE requires the most precise tongue position and is the hardest vowel to control, especially on higher tones. We start low and build up." },
      { type: "video" },
    ],
  },
  {
    part: 16,
    exerciseTypeId: "pitch-detection",
    title: "EE — Low",
    subtitle: "Vowel EE · 8 seconds",
    scale: { type: "even-7-from-major", root: 1 },
    notes: [{ target: { kind: BandTargetKind.Index, i: 0 }, seconds: 8 }],
    instruction:
      "Sing EE (as in 'see') on your lowest tone.\nLips spread, tongue forward.\nA low tone with a bright vowel — notice the blend.",
  },
  {
    part: 16,
    exerciseTypeId: "pitch-detection",
    title: "EE — Mid",
    subtitle: "Vowel EE · 8 seconds",
    scale: { type: "even-7-from-major", root: 1 },
    notes: [{ target: { kind: BandTargetKind.Index, i: 3 }, seconds: 8 }],
    instruction:
      "Sing EE on the mid tone.\nKeep the brightness — the resonance should feel forward.\nStay relaxed despite the narrow vowel shape.",
  },
  {
    part: 16,
    exerciseTypeId: "breathwork-farinelli",
    title: "Farinelli breathwork",
    maxCount: 10,
    instruction:
      "Inhale, hold, and exhale for the same count. Each cycle adds one beat. Reset before pushing EE into higher territory.",
  },
  {
    part: 16,
    exerciseTypeId: "pitch-detection",
    title: "EE — Mid-high",
    subtitle: "Vowel EE · 9 seconds",
    scale: { type: "even-7-from-major", root: 1 },
    notes: [{ target: { kind: BandTargetKind.Index, i: 4 }, seconds: 9 }],
    instruction:
      "Sing EE on the mid-high tone.\nThe brightness intensifies with height.\nKeep the jaw relaxed — don't clench.",
  },
  {
    part: 16,
    exerciseTypeId: "pitch-detection",
    title: "Low sequence — EE",
    subtitle: "3 tones rising · 3 seconds each",
    scale: { type: "even-7-from-major", root: 1 },
    notes: [
      { target: { kind: BandTargetKind.Index, i: 0 }, seconds: 3 },
      { target: { kind: BandTargetKind.Index, i: 1 }, seconds: 3 },
      { target: { kind: BandTargetKind.Index, i: 2 }, seconds: 3 },
    ],
    instruction:
      "Sing EE on three rising tones — low range.\nKeep the brightness consistent as you rise.\nFeel the forward resonance on every note.",
    completionModal: {
      title: "Part XVI Complete",
      subtitle: "Vowel EE",
      elements: [
        { type: "paragraph", text: "The bright EE vowel — the narrowest, most forward vowel. EE on low, mid, and mid-high tones." },
        { type: "paragraph", text: "EE is the hardest vowel to control. Patience and relaxation are key." },
      ],
      confetti: true,
    },
  },
];

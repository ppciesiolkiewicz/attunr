import type { JourneyExercise } from "./types";

/** Part 7: Vowel Warmth — OO/OH deeper, sequences, lip rolls */
export const PART_7_EXERCISES: JourneyExercise[] = [
  {
    id: 32,
    part: 7,
    exerciseTypeId: "pitch-detection-slide",
    title: "Lip rolls — high to low",
    subtitle: "Warmup glide · 2–3 times",
    technique: "lip-rolls",
    notes: [{ from: { kind: "index", i: -1 }, to: { kind: "index", i: 0 } }],
    instruction:
      "Start with a quick lip roll warmup — slide from high to low. Keep it loose and easy.",
  },
  {
    id: 33,
    part: 7,
    exerciseTypeId: "pitch-detection",
    title: "OO — Mid-low",
    subtitle: "Vowel OO · 7 seconds",
    notes: [{ target: { kind: "slot", n: 3 }, seconds: 7 }],
    instruction:
      "Sing OO on the mid-low tone.\nFeel the warmth settle in your chest and throat.\nKeep the lips rounded.",
  },
  {
    id: 34,
    part: 7,
    exerciseTypeId: "pitch-detection",
    title: "OH — Mid-low",
    subtitle: "Vowel OH · 7 seconds",
    notes: [{ target: { kind: "slot", n: 3 }, seconds: 7 }],
    instruction:
      "Sing OH on the mid-low tone.\nCompare the feel with OO — slightly more open.\nKeep the sound warm and grounded.",
  },
  {
    id: 35,
    part: 7,
    exerciseTypeId: "pitch-detection",
    title: "Low-to-mid sequence — OO",
    subtitle: "4 tones rising · 2 seconds each",
    notes: [
      { target: { kind: "slot", n: 1 }, seconds: 2 },
      { target: { kind: "slot", n: 2 }, seconds: 2 },
      { target: { kind: "slot", n: 3 }, seconds: 2 },
      { target: { kind: "slot", n: 4 }, seconds: 2 },
    ],
    instruction:
      "Sing OO on four rising tones — low to mid.\nKeep the lips rounded as you move through each tone.\nFeel the resonance shift upward.",
  },
  {
    id: 36,
    part: 7,
    exerciseTypeId: "breathwork-farinelli",
    title: "Farinelli breathwork",
    maxCount: 7,
    instruction:
      "Inhale, hold, and exhale for the same count. Each cycle adds one beat. Let the breath settle after the sequence work.",
  },
  {
    id: 37,
    part: 7,
    exerciseTypeId: "pitch-detection",
    title: "Lip roll sustain",
    subtitle: "Hold the buzz · 7 seconds",
    technique: "lip-rolls",
    notes: [{ target: { kind: "slot", n: 3 }, seconds: 7 }],
    instruction:
      "Hold one tone and sustain the lip roll for seven seconds. Keep the buzz steady and relaxed.",
    completionModal: {
      title: "Part VII Complete",
      subtitle: "Vowel Warmth",
      elements: [
        { id: "learned", type: "paragraph", text: "OO and OH vowels at different pitches, lip roll sustains, and your first vowel sequence." },
        { id: "tip", type: "paragraph", text: "Mixing techniques in each session keeps your voice flexible." },
      ],
      confetti: true,
    },
  },
];

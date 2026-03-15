import type { JourneyExerciseInput } from "./types";

/** Part 7: Vowel Warmth — OO/OH deeper, sequences, lip rolls */
export const PART_7_EXERCISES: JourneyExerciseInput[] = [
  {
    part: 7,
    exerciseTypeId: "tone-follow",
    title: "Lip rolls — high to low",
    subtitle: "Warmup glide · play 3 times",
    technique: "lip-rolls",
    toneShape: { kind: "slide", from: { kind: "index", i: -1 }, to: { kind: "index", i: 0 } },
    requiredPlays: 3,
    instruction:
      "Play the tone and lip roll alongside it. A quick warmup glide from high to low.",
  },
  {
    part: 7,
    exerciseTypeId: "pitch-detection",
    title: "OO — Mid-low",
    subtitle: "Vowel OO · 7 seconds",
    notes: [{ target: { kind: "slot", n: 3 }, seconds: 7 }],
    instruction:
      "Sing OO on the mid-low tone.\nFeel the warmth settle in your chest and throat.\nKeep the lips rounded.",
  },
  {
    part: 7,
    exerciseTypeId: "pitch-detection",
    title: "OH — Mid-low",
    subtitle: "Vowel OH · 7 seconds",
    notes: [{ target: { kind: "slot", n: 3 }, seconds: 7 }],
    instruction:
      "Sing OH on the mid-low tone.\nCompare the feel with OO — slightly more open.\nKeep the sound warm and grounded.",
  },
  {
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
    part: 7,
    exerciseTypeId: "breathwork-farinelli",
    title: "Farinelli breathwork",
    maxCount: 7,
    instruction:
      "Inhale, hold, and exhale for the same count. Each cycle adds one beat. Let the breath settle after the sequence work.",
  },
  {
    part: 7,
    exerciseTypeId: "tone-follow",
    title: "Lip roll sustain",
    subtitle: "Hold the buzz · play 3 times",
    technique: "lip-rolls",
    toneShape: { kind: "sustain", target: { kind: "slot", n: 3 }, seconds: 7 },
    requiredPlays: 3,
    instruction:
      "Play the tone and lip roll alongside it. Keep the buzz steady and relaxed.",
    completionModal: {
      title: "Part VII Complete",
      subtitle: "Vowel Warmth",
      elements: [
        { type: "paragraph", text: "OO and OH vowels at different pitches, lip roll sustains, and your first vowel sequence." },
        { type: "paragraph", text: "Mixing techniques in each session keeps your voice flexible." },
      ],
      confetti: true,
    },
  },
];

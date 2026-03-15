import type { JourneyExerciseInput } from "./types";

/** Part 6: Rounded Vowels — introduce OO and OH */
export const PART_6_EXERCISES: JourneyExerciseInput[] = [
  {
    part: 6,
    exerciseTypeId: "learn",
    title: "Rounded vowels",
    technique: "sustain",
    cardCue: "Sing OO and OH — warm, rounded sounds that build on your U foundation",
    elements: [
      { type: "paragraph", text: "OO (as in 'book') and OH (as in 'go') are rounded vowels — cousins of the U you already know. OO keeps the lips rounded but opens the mouth a touch more. OH opens further, like a gentle 'oh' of surprise. Both maintain vocal tract stability and help develop resonance. We'll start on comfortable low-to-mid tones." },
      { type: "video" },
    ],
  },
  {
    part: 6,
    exerciseTypeId: "pitch-detection",
    title: "OO — Low",
    subtitle: "Vowel OO · 7 seconds",
    notes: [{ target: { kind: "slot", n: 2 }, seconds: 7 }],
    instruction:
      "Sing OO (as in 'book') on the lower-mid tone.\nLips rounded, mouth slightly more open than U.\nKeep it warm and full.",
  },
  {
    part: 6,
    exerciseTypeId: "pitch-detection",
    title: "OO — Mid",
    subtitle: "Vowel OO · 7 seconds",
    notes: [{ target: { kind: "slot", n: 4 }, seconds: 7 }],
    instruction:
      "Sing OO on the mid tone.\nFeel the resonance open compared to U.\nKeep the lips rounded and relaxed.",
  },
  {
    part: 6,
    exerciseTypeId: "breathwork-farinelli",
    title: "Farinelli breathwork",
    maxCount: 7,
    instruction:
      "Inhale, hold, and exhale for the same count. Each cycle adds one beat. Centre yourself before the new OH vowel.",
  },
  {
    part: 6,
    exerciseTypeId: "pitch-detection",
    title: "OH — Low",
    subtitle: "Vowel OH · 7 seconds",
    notes: [{ target: { kind: "slot", n: 2 }, seconds: 7 }],
    instruction:
      "Sing OH (as in 'go') on the lower-mid tone.\nSlightly more open than OO — like a gentle 'oh' of surprise.\nKeep it rounded and warm.",
  },
  {
    part: 6,
    exerciseTypeId: "pitch-detection",
    title: "OH — Mid",
    subtitle: "Vowel OH · 7 seconds",
    notes: [{ target: { kind: "slot", n: 4 }, seconds: 7 }],
    instruction:
      "Sing OH on the mid tone.\nFeel the mouth open more than OO.\nKeep the sound warm and resonant.",
    completionModal: {
      title: "Part VI Complete",
      subtitle: "Rounded Vowels",
      elements: [
        { type: "paragraph", text: "The rounded vowels OO (as in 'book') and OH (as in 'go') — warm, stable vowels that build on your U foundation." },
        { type: "paragraph", text: "OO and OH are great for developing resonance. Use them in your warmup routine." },
      ],
      confetti: true,
    },
  },
];

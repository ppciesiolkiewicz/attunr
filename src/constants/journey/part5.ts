import type { JourneyExerciseInput } from "./types";

/** Part 5: Building Range — humming and U in mid range, first sequences */
export const PART_5_EXERCISES: JourneyExerciseInput[] = [
  {
    part: 5,
    exerciseTypeId: "pitch-detection",
    title: "Hum — Mid-low",
    subtitle: "Hum · 6 seconds",
    showEnableNotificationsPrompt: true,
    notes: [{ target: { kind: "slot", n: 3 }, seconds: 6 }],
    instruction:
      "Hum with purpose on the mid-low tone.\nFeel the tone grow stronger in your body.\nKeep your breath even.",
  },
  {
    part: 5,
    exerciseTypeId: "pitch-detection",
    title: "U — Mid-low",
    subtitle: "Vowel U · 6 seconds",
    notes: [{ target: { kind: "slot", n: 3 }, seconds: 6 }],
    instruction:
      "Sing uuu on the mid-low tone.\nFeel the tone grow stronger.\nKeep the vowel open and relaxed.",
  },
  {
    part: 5,
    exerciseTypeId: "breathwork-farinelli",
    title: "Farinelli breathwork",
    maxCount: 7,
    instruction:
      "Inhale, hold, and exhale for the same count. Each cycle adds one beat. A moment to centre before we push into mid range.",
  },
  {
    part: 5,
    exerciseTypeId: "pitch-detection",
    title: "Hum — Mid",
    subtitle: "Hum · 6 seconds",
    notes: [{ target: { kind: "slot", n: 4 }, seconds: 6 }],
    instruction:
      "Take a soft breath and hum openly on the mid tone.\nFeel the buzz in your chest and face.\nStay relaxed and present.",
  },
  {
    part: 5,
    exerciseTypeId: "pitch-detection",
    title: "U — Mid",
    subtitle: "Vowel U · 6 seconds",
    notes: [{ target: { kind: "slot", n: 4 }, seconds: 6 }],
    instruction:
      "Sing uuu on the mid tone.\nOpen and soft — keep it relaxed.\nFeel the resonance in your chest and face.",
  },
  {
    part: 5,
    exerciseTypeId: "pitch-detection",
    title: "Low sequence",
    subtitle: "3 tones rising · 2 seconds each",
    notes: [
      { target: { kind: "slot", n: 1 }, seconds: 2 },
      { target: { kind: "slot", n: 2 }, seconds: 2 },
      { target: { kind: "slot", n: 3 }, seconds: 2 },
    ],
    instruction:
      "Sing three tones rising from low.\nThis is your first sequence — move smoothly between each tone.\nFeel the resonance shift as you rise.",
    completionModal: {
      title: "Part V Complete",
      subtitle: "Building Range",
      elements: [
        { type: "paragraph", text: "Humming and U vowel in mid range, and your first multi-tone sequence." },
        { type: "paragraph", text: "Sequences build agility. Try singing them a little faster as you improve." },
      ],
      confetti: true,
    },
  },
];

import type { JourneyExerciseInput } from "./types";

/** Part 4: Low Resonance — humming and U alternating in the low range */
export const PART_4_EXERCISES: JourneyExerciseInput[] = [
  {
    part: 4,
    exerciseTypeId: "learn",
    title: "Humming and resonance",
    technique: "sustain",
    cardCue: "Hum each tone and feel where it resonates",
    elements: [
      { type: "paragraph", text: "Humming is one of the gentlest and most powerful ways to feel your voice. Close your lips and sing mmmm — feel the buzz in your lips, teeth, and face. In these exercises, we alternate between humming and the U vowel on low tones. Lower tones resonate deep in the chest. There's no rush — let the vibration settle." },
      { type: "video" },
    ],
  },
  {
    part: 4,
    exerciseTypeId: "pitch-detection",
    title: "Hum — Low",
    subtitle: "Hum · 5 seconds",
    notes: [{ target: { kind: "slot", n: 1 }, seconds: 5 }],
    instruction:
      "Hum low and steady — mmmm.\nFeel the buzz settle deep in your chest.\nKeep it grounded and relaxed.",
  },
  {
    part: 4,
    exerciseTypeId: "pitch-detection",
    title: "U — Low",
    subtitle: "Vowel U · 6 seconds",
    notes: [{ target: { kind: "slot", n: 1 }, seconds: 6 }],
    instruction:
      "Sing uuu on the same low tone.\nOpen from the hum into the vowel.\nKeep it warm and grounded.",
  },
  {
    part: 4,
    exerciseTypeId: "pitch-detection",
    title: "Hum — Lower-mid",
    subtitle: "Hum · 5 seconds",
    notes: [{ target: { kind: "slot", n: 2 }, seconds: 5 }],
    instruction:
      "Hum just above your lowest tone.\nFeel the warmth spread through your chest.\nKeep the buzz steady.",
  },
  {
    part: 4,
    exerciseTypeId: "pitch-detection",
    title: "U — Lower-mid",
    subtitle: "Vowel U · 6 seconds",
    notes: [{ target: { kind: "slot", n: 2 }, seconds: 6 }],
    instruction:
      "Sing uuu on the lower-mid tone.\nKeep it warm and full.\nFeel the vowel open from the hum.",
  },
  {
    part: 4,
    exerciseTypeId: "breathwork-farinelli",
    title: "Farinelli breathwork",
    maxCount: 6,
    instruction:
      "Inhale, hold, and exhale for the same count. Each cycle adds one beat. Let the breath ground you after the low resonance work.",
    completionModal: {
      title: "Part IV Complete",
      subtitle: "Low Resonance",
      elements: [
        { type: "paragraph", text: "Humming and the U vowel in your low register — feeling where resonance lives in your chest." },
        { type: "paragraph", text: "The low register is your foundation. Return here when you need to ground your voice." },
      ],
      confetti: true,
    },
  },
];

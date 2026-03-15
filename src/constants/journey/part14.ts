import type { JourneyExercise } from "./types";

/** Part 14: EH Mastery — EH range, sequences, puffy cheeks */
export const PART_14_EXERCISES: JourneyExercise[] = [
  {
    id: 74,
    part: 14,
    exerciseTypeId: "pitch-detection-slide",
    title: "Lip rolls — high to low",
    subtitle: "Warmup glide · 2–3 times",
    technique: "lip-rolls",
    notes: [{ from: { kind: "index", i: -1 }, to: { kind: "index", i: 0 } }],
    instruction:
      "Quick lip roll warmup — slide from high to low. Loosen up after the previous work.",
  },
  {
    id: 75,
    part: 14,
    exerciseTypeId: "pitch-detection",
    title: "EH — Low",
    subtitle: "Vowel EH · 9 seconds",
    notes: [{ target: { kind: "slot", n: 2 }, seconds: 9 }],
    instruction:
      "Sing EH on the lower-mid tone.\nLonger hold this time — find stability in the forward resonance.\nKeep the tongue forward and relaxed.",
  },
  {
    id: 76,
    part: 14,
    exerciseTypeId: "pitch-detection",
    title: "Puffy cheeks — Mid",
    subtitle: "Breath control · 8 seconds",
    technique: "puffy-cheeks",
    notes: [{ target: { kind: "slot", n: 4 }, seconds: 8 }],
    instruction:
      "Sing on the mid tone with puffy cheeks.\nFeel the back-pressure support your voice.\nStay steady and relaxed.",
  },
  {
    id: 77,
    part: 14,
    exerciseTypeId: "pitch-detection",
    title: "EH rising sequence",
    subtitle: "4 tones rising · 2 seconds each",
    notes: [
      { target: { kind: "slot", n: 2 }, seconds: 2 },
      { target: { kind: "slot", n: 3 }, seconds: 2 },
      { target: { kind: "slot", n: 4 }, seconds: 2 },
      { target: { kind: "slot", n: 5 }, seconds: 2 },
    ],
    instruction:
      "Sing EH on four rising tones.\nKeep the forward placement through each shift.\nFeel the brightness increase as you climb.",
  },
  {
    id: 78,
    part: 14,
    exerciseTypeId: "breathwork-farinelli",
    title: "Farinelli breathwork",
    maxCount: 10,
    instruction:
      "Inhale, hold, and exhale for the same count. Each cycle adds one beat. Recover after the sequence and puffy cheeks work.",
  },
  {
    id: 79,
    part: 14,
    exerciseTypeId: "pitch-detection",
    title: "AH → EH flow",
    subtitle: "Vowel transition · 9 seconds",
    notes: [{ target: { kind: "slot", n: 4 }, seconds: 9 }],
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

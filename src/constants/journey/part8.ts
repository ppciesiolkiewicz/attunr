import type { JourneyExercise } from "./types";

/** Part 8: The Open AH — introduce AH vowel and first vowel flows */
export const PART_8_EXERCISES: JourneyExercise[] = [
  {
    id: 38,
    part: 8,
    exerciseTypeId: "learn",
    title: "The open vowel — AH",
    technique: "sustain",
    cardCue: "Open your voice with the most natural vowel",
    instruction:
      "AH (as in 'father') is the most open, neutral vowel. The jaw drops, the tongue lies flat, and the throat opens naturally. It requires more breath support than rounded vowels like U or OO, but it's the most natural sound the voice can make. We'll also try your first vowel flow — transitioning from U to AH while holding the same pitch.",
  },
  {
    id: 39,
    part: 8,
    exerciseTypeId: "pitch-detection",
    title: "AH — Low",
    subtitle: "Vowel AH · 7 seconds",
    notes: [{ target: { kind: "slot", n: 2 }, seconds: 7 }],
    instruction:
      "Sing AH (as in 'father') on the lower-mid tone.\nLet the jaw drop and the throat open.\nKeep the sound grounded and warm.",
  },
  {
    id: 40,
    part: 8,
    exerciseTypeId: "pitch-detection",
    title: "AH — Mid",
    subtitle: "Vowel AH · 8 seconds",
    notes: [{ target: { kind: "slot", n: 4 }, seconds: 8 }],
    instruction:
      "Sing AH on the mid tone.\nFeel the openness — more space than OO or OH.\nKeep your breath steady and the jaw relaxed.",
  },
  {
    id: 41,
    part: 8,
    exerciseTypeId: "pitch-detection",
    title: "U → AH flow",
    subtitle: "Vowel transition · 8 seconds",
    notes: [{ target: { kind: "slot", n: 3 }, seconds: 8 }],
    instruction:
      "Hold the mid-low tone steady. Start with U (lips rounded) and slowly open into AH (jaw drops). The pitch stays the same — only the vowel changes. Feel the mouth open while the voice stays grounded.",
  },
  {
    id: 42,
    part: 8,
    exerciseTypeId: "breathwork-farinelli",
    title: "Farinelli breathwork",
    maxCount: 8,
    instruction:
      "Inhale, hold, and exhale for the same count. Each cycle adds one beat. Recover and centre after the vowel flow work.",
  },
  {
    id: 43,
    part: 8,
    exerciseTypeId: "pitch-detection",
    title: "Rising sequence — AH",
    subtitle: "4 tones rising · 2 seconds each",
    notes: [
      { target: { kind: "slot", n: 1 }, seconds: 2 },
      { target: { kind: "slot", n: 2 }, seconds: 2 },
      { target: { kind: "slot", n: 3 }, seconds: 2 },
      { target: { kind: "slot", n: 4 }, seconds: 2 },
    ],
    instruction:
      "Sing AH on four rising tones — low to mid.\nKeep the jaw relaxed and the vowel open on every tone.\nFeel the resonance lift as you ascend.",
    completionModal: {
      title: "Part VIII Complete",
      subtitle: "The Open AH",
      elements: [
        { id: "learned", type: "paragraph", text: "The open AH vowel and your first vowel flow — transitioning from U to AH while holding pitch." },
        { id: "tip", type: "paragraph", text: "Vowel flows are one of the most valuable exercises for vocal efficiency." },
      ],
      confetti: true,
    },
  },
];

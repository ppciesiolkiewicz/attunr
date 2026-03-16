import type { JourneyExerciseInput } from "./types";
import { BandTargetKind } from "./types";

/** Part 18: Vowel Flow — vowel transitions mastery */
export const PART_18_EXERCISES: JourneyExerciseInput[] = [
  {
    part: 18,
    exerciseTypeId: "learn",
    title: "Vowel flow",
    technique: "sustain",
    cardCue: "Master smooth transitions between all vowels",
    elements: [
      { type: "paragraph", text: "Vowel modification is a core singing skill. By transitioning between vowels while holding the same pitch, you train resonance consistency — the ability to keep a full, supported sound regardless of mouth shape. This is essential for higher notes and vocal efficiency. We'll flow between pairs of vowels, then combine them all." },
      { type: "video" },
    ],
  },
  {
    part: 18,
    exerciseTypeId: "pitch-detection",
    title: "U → OO flow",
    subtitle: "Vowel transition · 10 seconds",
    scale: { type: "even-7-from-major", root: 1 },
    notes: [{ target: { kind: BandTargetKind.Index, i: 2 }, seconds: 10 }],
    instruction:
      "Hold the mid-low tone steady. Start with U (round, closed) and open slightly into OO. A subtle shift — the lips stay rounded but the mouth opens a touch. Keep the pitch locked.",
  },
  {
    part: 18,
    exerciseTypeId: "pitch-detection",
    title: "OO → AH flow",
    subtitle: "Vowel transition · 10 seconds",
    scale: { type: "even-7-from-major", root: 1 },
    notes: [{ target: { kind: BandTargetKind.Index, i: 3 }, seconds: 10 }],
    instruction:
      "Hold the mid tone steady. Start with OO (rounded) and open into AH (jaw drops). Feel the space increase as the lips unround and the jaw relaxes. The pitch stays the same.",
  },
  {
    part: 18,
    exerciseTypeId: "breathwork-farinelli",
    title: "Farinelli breathwork",
    maxCount: 10,
    instruction:
      "Inhale, hold, and exhale for the same count. Each cycle adds one beat. Reset before the more challenging forward vowel transitions.",
  },
  {
    part: 18,
    exerciseTypeId: "pitch-detection",
    title: "AH → EH flow",
    subtitle: "Vowel transition · 10 seconds",
    scale: { type: "even-7-from-major", root: 1 },
    notes: [{ target: { kind: BandTargetKind.Index, i: 3 }, seconds: 10 }],
    instruction:
      "Hold the mid tone steady. Start with AH (open, neutral) and narrow into EH (forward, brighter). Feel the tongue move forward and the resonance shift. The pitch stays constant.",
  },
  {
    part: 18,
    exerciseTypeId: "pitch-detection",
    title: "EH → EE flow",
    subtitle: "Vowel transition · 10 seconds",
    scale: { type: "even-7-from-major", root: 1 },
    notes: [{ target: { kind: BandTargetKind.Index, i: 4 }, seconds: 10 }],
    instruction:
      "Hold the mid-high tone steady. Start with EH and narrow further into EE. The lips spread and the tongue lifts. A small but precise shift — keep the pitch locked and the resonance forward.",
    completionModal: {
      title: "Part XVIII Complete",
      subtitle: "Vowel Flow",
      elements: [
        { type: "paragraph", text: "Vowel flow mastery — smooth transitions between all vowel pairs: U→OO, OO→AH, AH→EH, EH→EE." },
        { type: "paragraph", text: "Practice these flows daily. They're the secret to smooth, connected singing." },
      ],
      confetti: true,
    },
  },
];

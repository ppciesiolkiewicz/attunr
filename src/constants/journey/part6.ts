import type { JourneyStage } from "./types";

/** Part 6: Rounded Vowels — introduce OO and OH */
export const PART_6_STAGES: JourneyStage[] = [
  {
    id: 26,
    part: 6,
    stageTypeId: "learn",
    title: "Rounded vowels",
    technique: "sustain",
    cardCue: "Sing OO and OH — warm, rounded sounds that build on your U foundation",
    instruction:
      "OO (as in 'book') and OH (as in 'go') are rounded vowels — cousins of the U you already know. OO keeps the lips rounded but opens the mouth a touch more. OH opens further, like a gentle 'oh' of surprise. Both maintain vocal tract stability and help develop resonance. We'll start on comfortable low-to-mid tones.",
  },
  {
    id: 27,
    part: 6,
    stageTypeId: "pitch-detection",
    title: "OO — Low",
    subtitle: "Vowel OO · 7 seconds",
    notes: [{ target: { kind: "slot", n: 2 }, seconds: 7 }],
    instruction:
      "Sing OO (as in 'book') on the lower-mid tone.\nLips rounded, mouth slightly more open than U.\nKeep it warm and full.",
  },
  {
    id: 28,
    part: 6,
    stageTypeId: "pitch-detection",
    title: "OO — Mid",
    subtitle: "Vowel OO · 7 seconds",
    notes: [{ target: { kind: "slot", n: 4 }, seconds: 7 }],
    instruction:
      "Sing OO on the mid tone.\nFeel the resonance open compared to U.\nKeep the lips rounded and relaxed.",
  },
  {
    id: 29,
    part: 6,
    stageTypeId: "breathwork",
    title: "Farinelli breathwork",
    maxCount: 7,
    instruction:
      "Inhale, hold, and exhale for the same count. Each cycle adds one beat. Centre yourself before the new OH vowel.",
  },
  {
    id: 30,
    part: 6,
    stageTypeId: "pitch-detection",
    title: "OH — Low",
    subtitle: "Vowel OH · 7 seconds",
    notes: [{ target: { kind: "slot", n: 2 }, seconds: 7 }],
    instruction:
      "Sing OH (as in 'go') on the lower-mid tone.\nSlightly more open than OO — like a gentle 'oh' of surprise.\nKeep it rounded and warm.",
  },
  {
    id: 31,
    part: 6,
    stageTypeId: "pitch-detection",
    title: "OH — Mid",
    subtitle: "Vowel OH · 7 seconds",
    notes: [{ target: { kind: "slot", n: 4 }, seconds: 7 }],
    instruction:
      "Sing OH on the mid tone.\nFeel the mouth open more than OO.\nKeep the sound warm and resonant.",
  },
];
